// pages/stationOrder/stationOrder.js  站点上车下单页
const BASE_URL = require("../../utils/BASE_URL");
const http = require("../../utils/http.js");
var baseUrl = BASE_URL.BASE_URL //配置基础url

// 儿童字典值（与 userList / addPassenger 一致）
const CHILD = '100004-0000010001';

function toCols(name, time, mark, city, locationId) {
  const [h, m] = time.split(':');
  return {
    name,
    city: city || '',          // 所属城市（文水县 / 太原市），用于按城市过滤上下车点
    chars: name.split(''),
    timeH: h,
    timeM: m,
    mark: mark || '',          // up=上车点 down=下车点 ''=未选
    locationId: locationId || '', // 下单 Statinglocation/EndLocation 用
  };
}

Page({
  data: {
    // 顶部站点纵览：左半属上车站城市（文水县），右半属下车站城市（太原市）
    // mark: up=上车点 down=下车点；green=灰色站点（途经/不可选）
    stations: [
      toCols('文水汽车站',   '06:00', '',    '文水县'),
      toCols('南徐村',       '06:00', 'up',  '文水县'),
      toCols('龙泉村',       '06:00', '',    '文水县'),
      toCols('桑村营村',     '06:00', '',    '文水县'),
      toCols('开栅高速口',   '06:00', '',    '文水县'),
      toCols('罗城高速口',   '06:00', 'down','太原市'),
      toCols('武宿机场',     '06:00', '',    '太原市'),
      toCols('太原火车南站', '06:00', '',    '太原市'),
      toCols('太原火车站',   '06:00', '',    '太原市'),
      toCols('建南汽车站',   '06:00', '',    '太原市'),
    ],

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

    agree: false,
    detailOpen: false,
  },

  onLoad(options) {
    console.log(options)
    options = options || {};
    this.setData({
      LineId:options.LineId
    })
    // 上级页面传入：城市、站点列表、价格
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
        if (res.data.code == 0) {
          let d = res.data.data;
          console.log(d)
          // 站点列表结构以接口实际返回为准，能对上时覆盖顶部站点纵览
          let list = d && (d.SiteList || d.Sites || (Array.isArray(d) ? d : null));
          if (Array.isArray(list) && list.length) {
            console.log(list)
            let stations = list.map(s => toCols(
              s.SiteName || s.Name,
              (s.ArrivalTime || s.Time || '').slice(0, 5),
              s.Mark || '',
              s.CityName || s.City || '',
              s.LocationId
            ));
            _this.setData({ stations });
            _this._syncStationLabels();
          }
        } else {
          wx.showToast({ title: res.data.msg, icon: 'none' });
        }
      },
      fail(err) {
        console.error('网络异常:', err);
      },
      complete() {
        wx.hideLoading();
      }
    });
  },

  // 根据 stations 里的 mark 同步 upStation / downStation（并记录下单用的 LocationId）
  _syncStationLabels() {
    let up = '', down = '', upLoc = '', downLoc = '';
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
    wx.showToast({ title: '优惠方式（待接入）', icon: 'none' });
  },

  onAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onDetail() {
    this.setData({ detailOpen: !this.data.detailOpen });
  },

  noop() {},

  onPay() {
    let _this = this;
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
    // TODO 接入下单支付接口
    let userinfo = wx.getStorageSync('userInfo')
    // 选中乘车人：格式 -> 姓名|手机号|证件号,姓名|手机号|证件号
    const PersonalIds = this.data.passengers
      .filter(p => p.selected)
      .map(p => [p.name, p.phone, p.idCard || ''].join('|'))
      .join(',');
    wx.request({
      url: baseUrl + "/api/BusMobile/Create",
      data: {
        MemberId: userinfo.Id,
        LineId: _this.data.LineId,
        ArrivalTime: _this.data.depTime ,
        ScheduleId: _this.data.scheduleId,
        PassengerPhone: '17601636466',
        PersonalIds: PersonalIds,//选中乘车人 格式->  测试|18734560486|14325201006102532,测试儿童|18734560486|14325201006102532
        Remark: '',//空值
        Statinglocation: _this.data.upLocationId,//这里是选中站点的 LocationId
        EndLocation: _this.data.downLocationId,//这里是选中站点的 LocationId
      },
      method: "POST",
      success: (res) => {
        let appid = wx.getStorageSync('appId');
        let userInfo = wx.getStorageSync('userInfo');
        _this.setData({
          orderId:res.data.data
        })
        wx.request({
          url: baseUrl + '/api/BusMobile/GoUnionPay',
          data: {
            appid: appid,
            Id: res.data.data,
            MemberInfoId: userInfo.Id
          },
          method: "GET",
          success: (payRes) => {
            if (payRes.data.code === 0) {
              const payData = payRes.data.data
              wx.requestPayment({
                timeStamp: payData.TimeStamp,
                nonceStr: payData.NonceStr,
                package: payData.Package,
                signType: payData.SignType,
                paySign: payData.PaySign,
                success: () => {
                  this._handleOrderSuccess(_this.data.orderId);
                },
                fail: (err) => {
                  console.log('支付失败', err);
                  // this._clearStorageAndRedirect(orderId);
                  // resolve(); // 支付失败也结束流程，避免卡死
                  setTimeout(() => {
                    wx.reLaunch({
                      url: `/user_center/pages/payDetail2/payDetail2?orderId=${_this.data.orderId}&from=orderList`
                    });
                  }, 1000);
                }
              });
            } else if (payRes.code === 400 && payRes.msg === "已付款") {
              this._handleOrderSuccess(orderId);
              resolve();
            } else {
              wx.showToast({
                title: payRes.msg,
                icon: 'none'
              });
            }
          }
        })
      },
    });
    wx.showToast({ title: '下单成功', icon: 'success' });
  },
});
