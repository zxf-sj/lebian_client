// pages/stationOrder/stationOrder.js  站点上车下单页
const BASE_URL = require("../../utils/BASE_URL");
const http = require("../../utils/http.js");
const orderStorage = require("../../utils/orderStorage.js");
const unionPayWatcher = require("../../utils/unionPayWatcher.js");
var baseUrl = BASE_URL.BASE_URL //配置基础url

// 儿童字典值（与 userList / addPassenger 一致）
const CHILD = '100004-0000010001';

function toCols(name, time, mark, city, locationId, group) {
  const [h, m] = time.split(':');
  return {
    name,
    city: city || '',          // 所属城市（文水县 / 太原市），用于按城市过滤上下车点
    chars: name.split(''),
    timeH: h,
    timeM: m,
    mark: mark || '',          // up=上车点 down=下车点 ''=未选
    locationId: locationId || '', // 下单 Statinglocation/EndLocation 用
    group: group || '',        // up=属于上车点分组 down=属于下车点分组
    split: false,              // 是否为下车点分组的第一列（该列左侧画分割线）
  };
}

Page({
  data: {
    // 顶部站点纵览：左半属上车站城市（文水县），右半属下车站城市（太原市）
    // mark: up=上车点 down=下车点；green=灰色站点（途经/不可选）
    stations: [],

    // 上/下城市：由上级页面 onLoad 传入，未传时给默认占位
    upCity: '文水县',
    downCity: '太原市',

    // 上/下选中的具体站点名（与顶部圆圈 mark 双向绑定）
    upStation: '',
    downStation: '',

    platformPrice: null,
    psgCount: 1,
    total: 10,

    // 乘车人：onShow 从 /Api/Mobile/AddressList 拉取（同 userList 页），selected 为多选状态
    passengers: [],

    // 上级带入的发车时间/线路，供新增乘车人页展示行程信息
    depTime: '',
    lineId: '',
    scheduleId: '',

    // 选中上下车站点的 LocationId（下单 Create 的 Statinglocation/EndLocation）
    upLocationId: '',
    downLocationId: '',

    agree: true, // 服务合同默认勾选（勾选框在乘车安全须知上方）
    detailOpen: false,

    // ===== 底部支付方式弹框（微信支付 / 云闪付）=====
    paySheetShow: false,
    payType: 'wechat', // union=云闪付 wechat=微信
    payPromoDetailShow: false,
    payPromoRules: [
      '满5元立减1元',
      '满10元立减2元',
      '满50元立减10元',
      '满100元立减20元'
    ],
    payTypeList: [
      {
        img: '/assets/images/yunshanfu.png',
        key: 'union',
        name: '云闪付支付',
        tip: '选择云闪付支付随机立减'
      },
      {
        img: '/assets/images/wechat.png',
        key: 'wechat',
        name: '微信支付',
        tip: ''
      }
    ],
  },

  onLoad(options) {
    console.log(options)
    orderStorage.touchOrderDraft();
    options = options || {};
    this.setData({
      LineId:options.LineId
    })
    // 上级页面传入：城市、站点列表、价格
    this._cityFromQuery = !!(options.upCity || options.downCity);
    if (options.upCity)   this.setData({ upCity: options.upCity });
    if (options.downCity) this.setData({ downCity: options.downCity });
    if (options.price) {
      const price = Number(options.price) || this.data.platformPrice;
      this.setData({ platformPrice: price, total: price * this.data.psgCount });
    }
    // 如果上级传了站点列表（JSON 字符串），则覆盖默认 stations
    if (options.stations) {
      try {
        const list = JSON.parse(decodeURIComponent(options.stations));
        if (Array.isArray(list) && list.length) {
          this._markGroups(list, this.data.upCity);
          this._applyDefaultMarks(list);
          this.setData({ stations: list });
        }
      } catch (e) {}
    }
    // 根据初始 mark 反推 upStation / downStation
    this._syncStationLabels();
    // 按初始选中乘车人重算人数与总价
    this._recalcPsg();

    // ride 页班次卡片带入：查该班次的站点时刻信息
    if (options.ScheduleId) {
      console.log(options.ScheduleId)
      this.setData({
        scheduleId: options.ScheduleId,
        lineId: options.LineId || '',
        depTime: decodeURIComponent(options.DepartureTime || '')
      });
      this.getSiteTimeInfo({
        ScheduleId: options.ScheduleId,
        DepartureTime: decodeURIComponent(options.DepartureTime || ''),
        LineId:options.LineId
      });
    }
  },

  onShow() {
    // 从新增乘车人页返回后需要刷新列表
    this.getPassengers();
  },

  // 支付成功：清草稿并跳订单详情（原代码只调用了这里，但方法没实现）
  _handleOrderSuccess(orderId) {
    orderStorage.clearOrderDraft();
    wx.showModal({
      title: '预约成功',
      content: '订单已预约成功，司机将会在您出发前一小时联系你',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        wx.reLaunch({
          url: `/user_center/pages/payDetail2/payDetail2?orderId=${orderId}&from=orderList`
        });
      }
    });
  },

  // 乘车人列表：同 userList 页，GET /Api/Mobile/AddressList?MemberId=
  getPassengers() {
    const userinfo = wx.getStorageSync('userInfo');
    if (!userinfo || !userinfo.Id) return;
    let _this = this;
    http.getRequest('/Api/Mobile/AddressList?MemberId=' + userinfo.Id, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        const old = _this.data.passengers;
        const rows = res.data || [];
        const list = rows.map((it, i) => {
          const isChild = it.isChildren == CHILD;
          const prev = old.find(p => p.id == it.Id);
          return {
            id: it.Id,
            name: it.RealName,
            phone: it.Phone,
            idCard: it.IdCard,
            isChild: isChild,
            type: isChild ? '儿童' : '成人',
            // 保留刷新前的勾选；首次加载默认勾选第一位
            selected: old.length ? !!(prev && prev.selected) : i === 0,
          };
        });
        _this.setData({ passengers: list });
        _this._recalcPsg();
      } else {
        _this.setData({ passengers: [] });
        _this._recalcPsg();
      }
    }, err => {
      console.error('乘车人列表加载失败', err);
    });
  },

  // 班次站点时刻：POST /api/BusMobile/GetBusLineSiteTimeInfo
  getSiteTimeInfo({ ScheduleId, DepartureTime, LineId }) {
    console.log('没进来？')
    let _this = this;
    wx.showLoading({ title: '' });
    wx.request({
      url: baseUrl + '/api/BusMobile/GetBusLineSiteTimeInfo',
      data: {
        ScheduleId: Number(ScheduleId),
        LineId: LineId,
        DepartureTime: DepartureTime
      },
      method: "POST",
      success(res) {
        console.log(res.data);
        if (res.data.code != 0) {
          wx.showToast({ title: res.data.msg, icon: 'none' });
          return;
        }
        const d = res.data.data || {};
        // 接口实际结构：StartSiteList = 去程（上车）站点，EndSiteList = 返程（下车）站点
        const upList = d.StartSiteList || [];
        const downList = d.EndSiteList || [];
        let list = upList.concat(downList);
        if (!list.length) {
          // 兼容旧结构：data.SiteList / data.Sites / data 本身是数组
          list = d.SiteList || d.Sites || (Array.isArray(d) ? d : []);
        }
        if (!Array.isArray(list) || !list.length) return;

        const upCount = upList.length;
        let stations = list.map((s, i) => toCols(
          s.LocationName || s.SiteName || s.Name || '',
          (s.ArrivalTime || s.Time || '00:00').slice(0, 5),
          '',                       // 默认选中在下方 _applyDefaultMarks 里统一处理
          s.County || s.CityName || s.City || '', // 文水站点 County=文水县，太原站点 County 为空用 City
          s.LocationId,
          upCount ? (i < upCount ? 'up' : 'down') : ''  // 前半段上车点，后半段下车点
        ));
        console.log(stations)

        const patch = { stations };
        // 上级没传城市时，用接口返回的城市兜底，保证左右两列能正常点选
        if (!_this._cityFromQuery) {
          const upCity = (upList[0] && (upList[0].County || upList[0].City)) || '';
          const downCity = (downList[0] && (downList[0].County || downList[0].City)) || '';
          if (upCity) patch.upCity = upCity;
          if (downCity) patch.downCity = downCity;
        }
        // 补齐分组标记（接口没给出分组时按城市推断），并标出下车点分组的第一列
        _this._markGroups(stations, patch.upCity || _this.data.upCity);
        // 默认选中：第一站为上车点，最后一站为下车点
        _this._applyDefaultMarks(stations);
        _this.setData(patch);
        _this._syncStationLabels();
      },
      fail(err) {
        console.error('网络异常:', err);
      },
      complete() {
        wx.hideLoading();
      }
    });
  },

  // 标记分组：group=up/down，并给下车点分组的第一列打 split（该列左侧画分割线）
  _markGroups(list, upCity) {
    if (!Array.isArray(list)) return list;
    list.forEach((s) => {
      if (!s.group) s.group = (upCity && s.city === upCity) ? 'up' : 'down';
      s.split = false;
    });
    // 下车点分组的第一列（前面已有上车点时才画分割线）
    let idx = -1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].group === 'down') { idx = i; break; }
    }
    if (idx > 0 && list[idx]) list[idx].split = true;
    return list;
  },

  // 默认选中：第一站为上车点，最后一站为下车点（用户/上级已选过的不覆盖）
  _applyDefaultMarks(list) {
    if (!Array.isArray(list) || !list.length) return list;
    const hasUp = list.some((s) => s.mark === 'up');
    const hasDown = list.some((s) => s.mark === 'down');
    if (!hasUp) list[0].mark = 'up';
    if (!hasDown && list.length > 1) list[list.length - 1].mark = 'down';
    return list;
  },

  // 根据 stations 里的 mark 同步 upStation / downStation（并记录下单用的 LocationId）
  _syncStationLabels() {
    let up = '', down = '', upLoc = '', downLoc = '';
    console.log(this.data.stations)
    this.data.stations.forEach((s) => {
      if (s.mark === 'up')   {
        up   = s.name;
        upLoc = s.locationId;
      }
      if (s.mark === 'down') {
        down = s.name;
        downLoc = s.locationId;
      }
    });
    console.log(upLoc,downLoc)
    this.setData({ upStation: up, downStation: down, upLocationId: upLoc, downLocationId: downLoc });

  },

  // 点击圆圈：左半区（上车站城市）只在 空↔上 切换；右半区（下车站城市）只在 空↔下 切换
  onStaTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (isNaN(idx)) return;
    const cur = this.data.stations[idx].mark || '';
    const city = this.data.stations[idx].city;

    let next = '';
    if (city === this.data.upCity) {
      // 上车站城市：空→上，上→空
      next = cur === 'up' ? '' : 'up';
    } else if (city === this.data.downCity) {
      // 下车站城市：空→下，下→空
      next = cur === 'down' ? '' : 'down';
    } else {
      // 不属于任一侧城市：默认空→上，上→空
      next = cur === 'up' ? '' : 'up';
    }

    const stations = JSON.parse(JSON.stringify(this.data.stations));
    stations[idx].mark = next;

    // 全局最多 1 个上车、1 个下车，新标记覆盖旧的
    if (next) {
      for (let i = 0; i < stations.length; i++) {
        if (i !== idx && stations[i].mark === next) stations[i].mark = '';
      }
    }
    this.setData({ stations });
    this._syncStationLabels();
  },

  // 点中间"选择上车点"：弹出当前上城市下所有站点，选完反向点亮顶部圆圈
  onPickUp() {
    const list = this.data.stations
      .map((s, i) => ({ name: s.name, idx: i }))
      .filter((s) => this.data.upCity && this.data.stations[s.idx].city === this.data.upCity);
    if (!list.length) {
      wx.showToast({ title: '当前城市暂无可选上车点', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: list.map((s) => s.name),
      success: (res) => {
        const pickIdx = list[res.tapIndex].idx;
        const stations = JSON.parse(JSON.stringify(this.data.stations));
        stations.forEach((s, i) => { if (s.mark === 'up') s.mark = ''; });
        stations[pickIdx].mark = 'up';
        this.setData({ stations });
        this._syncStationLabels();
      },
    });
  },

  // 点中间"选择下车点"：弹出当前下城市下所有站点
  onPickDown() {
    const list = this.data.stations
      .map((s, i) => ({ name: s.name, idx: i }))
      .filter((s) => this.data.downCity && this.data.stations[s.idx].city === this.data.downCity);
    if (!list.length) {
      wx.showToast({ title: '当前城市暂无可选下车点', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: list.map((s) => s.name),
      success: (res) => {
        const pickIdx = list[res.tapIndex].idx;
        const stations = JSON.parse(JSON.stringify(this.data.stations));
        stations.forEach((s, i) => { if (s.mark === 'down') s.mark = ''; });
        stations[pickIdx].mark = 'down';
        this.setData({ stations });
        this._syncStationLabels();
      },
    });
  },

  // 多选乘车人：点一下选中、再点取消，明细行与总价随之刷新
  onPaxTab(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const key = `passengers[${idx}].selected`;
    this.setData({ [key]: !this.data.passengers[idx].selected });
    this._recalcPsg();
  },

  // 按选中人数重算 psgCount 与 total
  _recalcPsg() {
    const n = this.data.passengers.filter(p => p.selected).length;
    this.setData({ psgCount: n, total: this.data.platformPrice * n });
  },

  // 新增乘车人：带上行程上下文，addPassenger 页以纯文字展示
  onAddUser() {
    const d = this.data;
    const params = [
      'upCity=' + encodeURIComponent(d.upCity || ''),
      'downCity=' + encodeURIComponent(d.downCity || ''),
      'upStation=' + encodeURIComponent(d.upStation || ''),
      'downStation=' + encodeURIComponent(d.downStation || ''),
      'DepartureTime=' + encodeURIComponent(d.depTime || '')
    ].join('&');
    wx.navigateTo({ url: '/pages/addPassenger/addPassenger?' + params });
  },

  onCoupon() {
    wx.showToast({ title: '暂无优惠方式', icon: 'none' });
  },

  onAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onDetail() {
    this.setData({ detailOpen: !this.data.detailOpen });
  },

  noop() {},

  onPay() {
    if (!this.data.agree) {
      wx.showToast({ title: '请先接受服务合同', icon: 'none' });
      return;
    }
    if (!this.data.upStation || !this.data.downStation) {
      wx.showToast({ title: '请先选择上/下车点', icon: 'none' });
      return;
    }
    if (this.data.psgCount < 1) {
      wx.showToast({ title: '请至少选择一位乘车人', icon: 'none' });
      return;
    }
    // 弹出支付方式（微信支付 / 云闪付），确认后再下单
    this.setData({ paySheetShow: true });
  },

  // 支付方式弹框：展开/收起立减说明
  togglePayPromoDetail() {
    this.setData({ payPromoDetailShow: !this.data.payPromoDetailShow });
  },
  onPayTypeChange(e) {
    this.setData({ payType: e.currentTarget.dataset.key });
  },
  cancelPaySheet() {
    this.setData({ paySheetShow: false });
  },
  confirmPaySheet() {
    const payType = this.data.payType;
    this.setData({ paySheetShow: false });
    this.submitOrder(payType);
  },

  // 下单（Create）→ 按支付方式拉起支付
  submitOrder(payType) {
    let _this = this;
    let userinfo = wx.getStorageSync('userInfo') || {};
    if (!userinfo.Id) {
      wx.navigateTo({ url: '/user_center/pages/login/login' });
      return;
    }
    // 选中乘车人：格式 -> 姓名|手机号|证件号,姓名|手机号|证件号
    const PersonalIds = this.data.passengers
      .filter(p => p.selected)
      .map(p => [p.name, p.phone, p.idCard || ''].join('|'))
      .join(',');
    wx.showLoading({ title: '下单中...', mask: true });
    wx.request({
      url: baseUrl + "/api/BusMobile/Create",
      data: {
        MemberId: userinfo.Id,
        LineId: _this.data.LineId,
        ArrivalTime: _this.data.depTime,
        ScheduleId: _this.data.scheduleId,
        PassengerPhone: '17601636466',
        PersonalIds: PersonalIds,
        Remark: '',
        Statinglocation: _this.data.upLocationId, // 选中站点的 LocationId
        EndLocation: _this.data.downLocationId,   // 选中站点的 LocationId
      },
      method: "POST",
      success: (res) => {
        wx.hideLoading();
        const d = res.data || {};
        // 业务失败（如 430）必须提示，不能直接往下走支付
        if (d.code != 0) {
          wx.showToast({
            title: d.msg || '下单失败，请稍后重试',
            icon: 'none',
            duration: 2500
          });
          return;
        }
        if (!d.data) {
          wx.showToast({ title: '下单失败：未返回订单号', icon: 'none' });
          return;
        }
        const orderId = d.data;
        _this.setData({ orderId });
        if (payType === 'union') {
          _this._payByUnionPay(orderId, userinfo.Id);
        } else {
          _this._payByWechat(orderId, userinfo.Id);
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      },
    });
  },

  // 微信支付
  _payByWechat(orderId, memberId) {
    let _this = this;
    wx.request({
      url: baseUrl + '/api/BusMobile/GoUnionPay',
      data: {
        appid: wx.getStorageSync('appId'),
        Id: orderId,
        MemberInfoId: memberId,
        PaymentType: 1
      },
      method: "GET",
      success: (payRes) => {
        const payData = payRes.data || {};
        if (payData.code === 0 && payData.data) {
          const info = payData.data;
          wx.requestPayment({
            timeStamp: info.TimeStamp,
            nonceStr: info.NonceStr,
            package: info.Package,
            signType: info.SignType,
            paySign: info.PaySign,
            success: () => {
              _this._handleOrderSuccess(orderId);
            },
            fail: (err) => {
              console.log('支付失败', err);
              setTimeout(() => {
                wx.reLaunch({
                  url: `/user_center/pages/payDetail2/payDetail2?orderId=${orderId}&from=orderList`
                });
              }, 1000);
            }
          });
        } else if (payData.code === 400 && payData.msg === "已付款") {
          _this._handleOrderSuccess(orderId);
        } else {
          wx.showToast({
            title: payData.msg || '获取支付信息失败，请稍后重试',
            icon: 'none',
            duration: 2500
          });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      }
    });
  },

  // 云闪付：跳外部小程序，返回后由 unionPayWatcher 查询支付结果
  _payByUnionPay(orderId, memberId) {
    wx.request({
      url: baseUrl + '/api/BusMobile/GoUnionPay',
      data: {
        appid: wx.getStorageSync('appId'),
        Id: orderId,
        MemberInfoId: memberId,
        PaymentType: 2
      },
      method: "GET",
      success: (payRes) => {
        const payData = payRes.data || {};
        if (payData.code === 0 && payData.data) {
          unionPayWatcher.mark(orderId, 'bus');
          wx.navigateToMiniProgram({
            appId: payData.data.CqpMpAppId,
            path: payData.data.CqpMpPath,
            fail(err) {
              console.log('打开云闪付失败', err);
              unionPayWatcher.clear();
              wx.showModal({
                title: '提示',
                content: '无法打开云闪付，可稍后在订单页继续支付。',
                confirmText: '查看订单',
                cancelText: '知道了',
                success(r) {
                  if (r.confirm) {
                    wx.reLaunch({
                      url: `/user_center/pages/payDetail2/payDetail2?orderId=${orderId}&from=orderList`
                    });
                  }
                }
              });
            }
          });
        } else if (payData.code === 400 && payData.msg === "已付款") {
          this._handleOrderSuccess(orderId);
        } else {
          wx.showToast({
            title: payData.msg || '获取支付信息失败，请稍后重试',
            icon: 'none',
            duration: 2500
          });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      }
    });
  },
});
