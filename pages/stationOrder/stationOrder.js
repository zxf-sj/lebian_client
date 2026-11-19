// pages/stationOrder/stationOrder.js  站点上车下单页
const BASE_URL = require("../../utils/BASE_URL");
const http = require("../../utils/http.js");
const orderStorage = require("../../utils/orderStorage.js");
const auth = require("../../utils/auth.js");
const unionPayWatcher = require("../../utils/unionPayWatcher.js");
var baseUrl = BASE_URL.BASE_URL //配置基础url

// 儿童字典值（与 userList / addPassenger 一致）
const CHILD = '100004-0000010001';
// 单笔订单最多可选乘车人数
const MAX_PSG = 5;

function toCols(name, time, mark, city, locationId, group, img) {
  const [h, m] = time.split(':');
  return {
    name,
    city: city || '',          // 所属城市（文水县 / 太原市），用于按城市过滤上下车点
    chars: name.split(''),
    time: time,                // 完整时间（接口 ArrivalTime），上车点=发车时间、下车点=到达时间
    timeH: h,
    timeM: m,
    mark: mark || '',          // up=上车点 down=下车点 ''=未选
    img: img || '',            // 站点图片示意（点击可放大预览）
    locationId: locationId || '', // 下单 Statinglocation/EndLocation 用
    group: group || '',        // up=属于上车点分组 down=属于下车点分组
    split: false,              // 是否为下车点分组的第一列（该列左侧画分割线）
  };
}

Page({
  data: {
    // 接口分别返回两组站点，页面也分开存，不做合并：
    // upStations = StartSiteList（上车点，ArrivalTime 为发车时间）
    // downStations = EndSiteList（下车点，ArrivalTime 为到达时间）
    upStations: [],
    downStations: [],

    // 横滑提示（站点纵览 / 乘车人列表）：内容超出一屏时短暂展示
    showStaTip: false,
    staScrollLeft: 0,
    showPsgTip: false,
    psgScrollLeft: 0,

    // 上/下城市：由上级页面 onLoad 传入，未传时给默认占位
    upCity: '文水县',
    downCity: '太原市',

    // 上/下选中的具体站点名（与顶部圆圈 mark 双向绑定）
    upStation: '',
    downStation: '',

    // 选中站点对应时间：上车点=发车时间（StartSiteList），下车点=到达时间（EndSiteList）
    upTime: '',
    downTime: '',
    upTimeLabel: '预计发车时间',
    downTimeLabel: '预计到达时间',

    // 站点选择弹层
    staPickShow: false,
    staPickType: 'up', // up=选上车点 down=选下车点
    staPickList: [],

    platformPrice: null, // 成人票价（优惠价，无优惠时即原价）
    originPrice: null,   // 成人原价（计算儿童价用）
    childPrice: null,    // 儿童价 = min(成人优惠价, 成人原价 / 2)
    psgCount: 1,
    adultCount: 0,       // 选中乘车人里的成人数
    childCount: 0,       // 选中乘车人里的儿童数
    total: 0,

    // 乘车人：onShow 从 /Api/Mobile/AddressList 拉取（同 userList 页），selected 为多选状态
    passengers: [],

    // 上级带入的发车时间/线路，供新增乘车人页展示行程信息
    depTime: '',
    lineId: '',
    scheduleId: '',

    // 选中上下车站点的 LocationId（下单 Create 的 Statinglocation/EndLocation）
    upLocationId: '',
    downLocationId: '',

    agree: false, // 服务合同默认勾选（勾选框在乘车安全须知上方）
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
    // 成人票价 + 原价：儿童价 = min(成人优惠价, 成人原价 / 2)
    if (options.price || options.originPrice) {
      const adultPrice = Number(options.price) || 0;
      const originPrice = Number(options.originPrice) || adultPrice;
      this.setData({
        platformPrice: adultPrice,
        originPrice,
        childPrice: this._calcChildPrice(adultPrice, originPrice),
      });
    }
    // 上级传了站点列表（JSON 字符串）时，按 group 拆回两组（无 group 的按城市归类）
    if (options.stations) {
      try {
        const list = JSON.parse(decodeURIComponent(options.stations));
        if (Array.isArray(list) && list.length) {
          const upArr = list.filter((s) => s.group === 'up');
          const downArr = list.filter((s) => s.group === 'down');
          list.filter((s) => !s.group).forEach((s) => {
            (this.data.upCity && s.city === this.data.upCity ? upArr : downArr).push(s);
          });
          const patch = { upStations: upArr, downStations: downArr };
          this._applyDefaultMarks(patch);
          this.setData(patch, () => {
            this._playSwipeTip({
              box: '.sta-scroll',
              each: '.sta-col',
              tipKey: 'showStaTip',
              scrollKey: 'staScrollLeft',
              flag: '_staTipDone',
            });
          });
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

  // 横滑提示：内容超出一屏时，轻推一下列表并展示提示
  // opts.each：按子元素逐个累加宽度判断（flex 布局下包裹层宽度恒等于视口，直接比较无效）
  _playSwipeTip(opts) {
    if (this[opts.flag]) return;
    wx.nextTick(() => {
      const q = wx.createSelectorQuery().in(this);
      q.select(opts.box).boundingClientRect();
      if (opts.each) q.selectAll(opts.each).boundingClientRect();
      else q.select(opts.inner).boundingClientRect();
      q.exec((res) => {
        const box = res && res[0];
        const content = res && res[1];
        if (!box) return;
        const contentWidth = opts.each
          ? (Array.isArray(content) ? content.reduce((sum, r) => sum + (r.width || 0), 0) : 0)
          : ((content && content.width) || 0);
        if (!contentWidth || contentWidth <= box.width + 8) return;
        this[opts.flag] = true;
        this.setData({ [opts.tipKey]: true });
        // 先向右轻推再回弹，直观示意可横滑
        setTimeout(() => {
          this.setData({ [opts.scrollKey]: 70 });
          setTimeout(() => this.setData({ [opts.scrollKey]: 0 }), 600);
        }, 250);
        setTimeout(() => this.setData({ [opts.tipKey]: false }), 3800);
      });
    });
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
        // 兜底：刷新后保留的选中项也不超过 MAX_PSG 人
        let picked = 0;
        list.forEach((p) => {
          if (p.selected && picked < MAX_PSG) picked++;
          else p.selected = false;
        });
        _this.setData({ passengers: list }, () => {
          _this._playSwipeTip({
            box: '.psg-names',
            inner: '.psg-names-inner',
            tipKey: 'showPsgTip',
            scrollKey: 'psgScrollLeft',
            flag: '_psgTipDone',
          });
        });
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
        // 接口已分好组：StartSiteList = 上车点列表（ArrivalTime = 发车时间）
        //             EndSiteList   = 下车点列表（ArrivalTime = 到达时间）
        const upList = d.StartSiteList || [];
        const downList = d.EndSiteList || [];
        const patch = {};
        let upStations = [];
        let downStations = [];

        if (upList.length || downList.length) {
          upStations = _this._mapSites(upList, 'up');
          downStations = _this._mapSites(downList, 'down');
        } else {
          // 兼容旧结构：data.SiteList / data.Sites / data 本身是数组（只有混合列表，按城市拆两组）
          const legacy = d.SiteList || d.Sites || (Array.isArray(d) ? d : []);
          if (!Array.isArray(legacy) || !legacy.length) return;
          _this._mapSites(legacy, '').forEach((s) => {
            const isUp = _this.data.upCity && s.city === _this.data.upCity;
            (isUp ? upStations : downStations).push(s);
          });
        }

        patch.upStations = upStations;
        patch.downStations = downStations;

        // 上级没传城市时，用接口返回的城市兜底
        if (!_this._cityFromQuery) {
          const upCity = (upList[0] && (upList[0].County || upList[0].City)) || '';
          const downCity = (downList[0] && (downList[0].County || downList[0].City)) || '';
          if (upCity) patch.upCity = upCity;
          if (downCity) patch.downCity = downCity;
        }
        // 默认选中：上车点列表首站、下车点列表末站
        _this._applyDefaultMarks(patch);
        _this.setData(patch);
        _this._syncStationLabels();
        _this._playSwipeTip({
          box: '.sta-scroll',
          each: '.sta-col',
          tipKey: 'showStaTip',
          scrollKey: 'staScrollLeft',
          flag: '_staTipDone',
        });
      },
      fail(err) {
        console.error('网络异常:', err);
      },
      complete() {
        wx.hideLoading();
      }
    });
  },

  // 接口站点 → 页面结构：group 由来源列表（StartSiteList / EndSiteList）直接决定
  _mapSites(list, group) {
    return (list || []).map((s) => {
      const col = toCols(
        s.LocationName || s.SiteName || s.Name || '',
        (s.ArrivalTime || s.Time || '00:00').slice(0, 5),
        '',                                                  // 默认选中在 _applyDefaultMarks 里统一处理
        s.County || s.CityName || s.City || '',              // 所属城市，仅作兜底过滤用
        s.LocationId,
        group,
        s.Img || s.Image || s.Photo || s.PicUrl || s.SiteImg || '' // 站点图片示意
      );
      // 站点详情页需要：地址、经纬度、图片列表
      col.address = s.Address || s.SiteAddress || s.LocationAddress || '';
      col.lat = Number(s.Latitude || s.Lat) || 0;
      col.lng = Number(s.Longitude || s.Lng || s.Lon) || 0;
      col.imgs = this._normalizeImgs(s.Imgs || s.ImgList || s.SiteImgList || s.Images);
      if (!col.img && col.imgs.length) col.img = col.imgs[0];
      return col;
    });
  },

  // 图片字段兼容：字符串数组 / 对象数组 / 逗号分隔字符串
  _normalizeImgs(data) {
    if (!data) return [];
    let arr = data;
    if (typeof arr === 'string') arr = arr.split(',');
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it) => (typeof it === 'string' ? it : (it && (it.Img || it.Image || it.Url || it.PicUrl || it.Path))))
      .filter(Boolean);
  },

  // 默认选中：上车点列表首站、下车点列表末站（已选过的不覆盖）
  _applyDefaultMarks(patch) {
    const ups = (patch && patch.upStations) || [];
    const downs = (patch && patch.downStations) || [];
    if (ups.length && !ups.some((s) => s.mark === 'up')) ups[0].mark = 'up';
    if (downs.length && !downs.some((s) => s.mark === 'down')) downs[downs.length - 1].mark = 'down';
    return patch;
  },

  // 从两个列表里取选中站，同步站名 / LocationId / 时间
  // upStations = StartSiteList → 发车时间；downStations = EndSiteList → 到达时间
  _syncStationLabels() {
    const up = (this.data.upStations || []).find((s) => s.mark === 'up') || null;
    const down = (this.data.downStations || []).find((s) => s.mark === 'down') || null;
    this.setData({
      upStation: up ? up.name : '',
      downStation: down ? down.name : '',
      upLocationId: up ? up.locationId : '',
      downLocationId: down ? down.locationId : '',
      upTime: up ? (up.time || '') : '',
      downTime: down ? (down.time || '') : '',
      upTimeLabel: '预计发车时间',
      downTimeLabel: '预计到达时间',
    });
  },

  // 点击圆圈：上车点列表内互斥选 1 个（再点取消），下车点列表同理
  onStaTap(e) {
    const kind = e.currentTarget.dataset.kind === 'down' ? 'down' : 'up';
    const key = kind === 'up' ? 'upStations' : 'downStations';
    const idx = Number(e.currentTarget.dataset.idx);
    const list = JSON.parse(JSON.stringify(this.data[key] || []));
    if (isNaN(idx) || !list[idx]) return;
    const next = list[idx].mark === kind ? '' : kind;
    list.forEach((s) => { s.mark = ''; });
    list[idx].mark = next;
    this.setData({ [key]: list });
    this._syncStationLabels();
  },

  // 点击站点图片示意：进入站点详情页（上 6 图片列表 / 下 4 地图导航）
  onStaImgTap(e) {
    const kind = e.currentTarget.dataset.kind === 'down' ? 'down' : 'up';
    const key = kind === 'up' ? 'upStations' : 'downStations';
    const idx = Number(e.currentTarget.dataset.idx);
    const s = (this.data[key] || [])[idx];
    if (!s) return;
    const imgs = (s.imgs && s.imgs.length) ? s.imgs.join(',') : (s.img || '');
    const params = [
      'name=' + encodeURIComponent(s.name || ''),
      'address=' + encodeURIComponent(s.address || ''),
      'locationId=' + encodeURIComponent(s.locationId || ''),
      'lat=' + (s.lat || ''),
      'lng=' + (s.lng || ''),
      'imgs=' + encodeURIComponent(imgs),
    ].join('&');
    wx.navigateTo({ url: '/pages/stationDetail/stationDetail?' + params });
  },
  onPickUp() {
    this._openStaPicker('up');
  },

  // 点中间"选择下车点"：弹出当前下城市下所有站点
  onPickDown() {
    this._openStaPicker('down');
  },

  // 站点选择弹层：不用 wx.showActionSheet（itemList 最多 6 项，超了直接 fail 不弹窗）
  // 上车点取 upStations（StartSiteList），下车点取 downStations（EndSiteList）
  _openStaPicker(type) {
    const isDown = type === 'down';
    const list = (isDown ? this.data.downStations : this.data.upStations) || [];
    if (!list.length) {
      wx.showToast({
        title: isDown ? '当前线路暂无可选下车点' : '当前线路暂无可选上车点',
        icon: 'none',
      });
      return;
    }
    this.setData({
      staPickShow: true,
      staPickType: isDown ? 'down' : 'up',
      staPickList: list.map((s, i) => ({
        idx: i,
        name: s.name || '',
        time: s.time || '',
        mark: s.mark || '',
      })),
    });
  },

  // 弹层里点选站点：所属列表内互斥，只保留 1 个选中
  onStaPick(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const kind = this.data.staPickType === 'down' ? 'down' : 'up';
    const key = kind === 'up' ? 'upStations' : 'downStations';
    const list = JSON.parse(JSON.stringify(this.data[key] || []));
    if (isNaN(idx) || !list[idx]) return;
    list.forEach((s) => { s.mark = ''; });
    list[idx].mark = kind;
    this.setData({ [key]: list, staPickShow: false });
    this._syncStationLabels();
  },

  closeStaPick() {
    this.setData({ staPickShow: false });
  },

  // 多选乘车人：点一下选中、再点取消，明细行与总价随之刷新
  // 最多同时选中 MAX_PSG 人，已满时提示
  onPaxTab(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (isNaN(idx) || !this.data.passengers[idx]) return;
    const isOn = !!this.data.passengers[idx].selected;
    if (!isOn) {
      const picked = this.data.passengers.filter((p) => p.selected).length;
      if (picked >= MAX_PSG) {
        wx.showToast({ title: '最多选择' + MAX_PSG + '位乘车人', icon: 'none' });
        return;
      }
    }
    this.setData({ [`passengers[${idx}].selected`]: !isOn });
    this._recalcPsg();
  },

  // 儿童价：成人原价一半与成人优惠价取低；原价缺失时按成人票价一半兜底
  _calcChildPrice(adultPrice, originPrice) {
    const adult = Number(adultPrice) || 0;
    const origin = Number(originPrice) || 0;
    const half = (origin > 0 ? origin : adult) / 2;
    const child = adult > 0 ? Math.min(adult, half) : half;
    return Math.round(child * 100) / 100;
  },

  // 按选中乘车人重算人数与总价：成人按成人价、儿童按儿童价
  _recalcPsg() {
    const picked = this.data.passengers.filter(p => p.selected);
    const adultCount = picked.filter(p => !p.isChild).length;
    const childCount = picked.filter(p => p.isChild).length;
    const total =
      adultCount * (Number(this.data.platformPrice) || 0) +
      childCount * (Number(this.data.childPrice) || 0);
    this.setData({
      psgCount: picked.length,
      adultCount,
      childCount,
      total: Math.round(total * 100) / 100,
    });
  },

  // 新增乘车人：带上行程上下文，addPassenger 页以纯文字展示
  onAddUser() {
    // 未登录不进入新增乘车人页，先引导登录
    if (!auth.isLogin()) {
      auth.requireLogin();
      return;
    }
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
  // 下单前先查巴士未完成订单（/api/BusMobile/GetUnfinishedOrder），
  // 有已付款的未完成订单时仅做提示（同拼车/包车），用户可选择继续下单
  async submitOrder(payType) {
    let _this = this;
    let userinfo = wx.getStorageSync('userInfo') || {};
    if (!userinfo.Id) {
      wx.navigateTo({ url: '/user_center/pages/login/login' });
      return;
    }
    // 选中乘车人：格式 -> 姓名|手机号|证件号,姓名|手机号|证件号
    const picked = this.data.passengers.filter(p => p.selected);
    const PersonalIds = picked
      .map(p => [p.name, p.phone, p.idCard || ''].join('|'))
      .join(',');

    // 有未完成订单时弹提示，用户选「继续下单」才往下走
    // 注意校验要在 showLoading 之前，否则 loading 的 mask 会盖住弹窗
    const canOrder = await this._confirmUnfinishedOrder(userinfo.Id);
    if (!canOrder) return;

    wx.showLoading({ title: '下单中...', mask: true });

    wx.request({
      url: baseUrl + "/api/BusMobile/Create",
      data: {
        MemberId: userinfo.Id,
        LineId: _this.data.LineId,
        ArrivalTime: _this.data.depTime,
        ScheduleId: _this.data.scheduleId,
        PassengerPhone: PersonalIds.split('|')[1],
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

  // 查巴士是否有未完成订单：GET /api/BusMobile/GetUnfinishedOrder?MemberId=
  // 仅做提示，不阻止下单：有订单时弹「继续下单 / 取消下单」；查询失败直接放行
  _confirmUnfinishedOrder(memberId) {
    return new Promise((resolve) => {
      const url = '/api/BusMobile/GetUnfinishedOrder?MemberId=' + encodeURIComponent(memberId);
      http.getRequest(url, '', wx.getStorageSync('header'), (res) => {
        const order = (res && res.code == 0) ? this._pickUnfinishedOrder(res) : null;
        if (!order) {
          resolve(true);
          return;
        }
        const orderNo = order.Code || order.OrderNo || order.PassengerOrderNo || '';
        wx.showModal({
          title: '下单提示',
          content: '您有一笔未完成的巴士订单' +
            (orderNo ? '，订单号为:' + orderNo : '') +
            '，是否继续下单？',
          cancelText: '取消下单',
          confirmText: '继续下单',
          success: (r) => resolve(!!r.confirm),
          fail: () => resolve(true)
        });
      }, () => {
        // 查询失败不做拦截，避免影响正常下单
        resolve(true);
      });
    });
  },

  // 兼容不同返回结构：数组取第一条；对象（含 list/List）有内容即视为有订单
  _pickUnfinishedOrder(res) {
    const d = res && res.data;
    if (!d) return null;
    if (Array.isArray(d)) return d.length ? (d[0] || {}) : null;
    if (typeof d === 'object') {
      const list = Array.isArray(d.List) ? d.List : (Array.isArray(d.list) ? d.list : null);
      if (list) return list.length ? (list[0] || {}) : null;
      return Object.keys(d).length ? d : null;
    }
    return d ? {} : null;
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
