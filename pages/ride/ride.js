// pages/ride/ride.js  站点上车/拼车上门/包车出发/跨城跑腿
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 服务类型 tab（价格为示例，实际由接口返回）
const TABS = [
  { name: '站点\n上车', price: '¥18起' },
  { name: '拼车\n上门', price: '¥49.9起' },
  { name: '包车\n出发', price: '¥240起', badge: '推荐' },
  { name: '跨城\n跑腿', price: '¥30起' },
];

const PERIODS = ['上午', '中午', '下午', '晚上'];

function pad(n) {
  return String(n).padStart(2, '0');
}

Page({
  data: {
    from: '孝义',
    to: '太原',
    dateIdx: 0,
    dates: [],       // 固定四天：今天/明天/后天/周几
    dateLabel: '',   // 顶部出发日期文案，如 10月12日

    tabs: TABS,
    tab: 0,

    timeSlotIdx: 2,
    hotStations: [
      { name: '建南汽车站', sel: false },
      { name: '武宿机场', sel: false },
      { name: '武宿机场', sel: false },
      { name: '建南汽车站', sel: false },
      { name: '建南汽车站', sel: true },
      { name: '武宿机场', sel: false },
    ],
    hotCount: 1,
    stationRoutes: [
      { time: '07:30', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 33, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '08:00', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 18, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '08:30', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 45, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '09:00', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 6, start: '建南汽车站', mids: ['武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '09:30', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 28, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '10:00', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 12, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '10:30', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 2, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '11:00', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 36, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '11:30', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 9, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '12:00', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 22, start: '建南汽车站', mids: ['武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '12:30', type: '途径', stationPrice: 25, platformPrice: 10, tickets: 4, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
      { time: '13:00', type: '始发', stationPrice: 25, platformPrice: 10, tickets: 31, start: '建南汽车站', mids: ['武宿机场', '武宿机场', '武宿机场'], end: '孝义汽车站' },
    ],

    /* --- 拼车上门 / 包车出发：右侧共用同一套班次列表 --- */
    periods: PERIODS,
    periodIdx: 2,
    carpoolAll: [
      { id: 'c1', period: 0, time: '08:00~09:00', seats: 4, sold: false },
      { id: 'c2', period: 1, time: '12:00~13:00', seats: 2, sold: false },
      { id: 'c3', period: 2, time: '14:00~15:00', seats: 135, sold: false },
      { id: 'c4', period: 2, time: '15:00~16:00', seats: 135, sold: false },
      { id: 'c5', period: 2, time: '16:00~17:00', seats: 135, sold: false },
      { id: 'c6', period: 2, time: '17:00~18:00', seats: 135, sold: false },
      { id: 'c7', period: 2, time: '18:00~19:00', seats: 0, sold: true },
      { id: 'c8', period: 3, time: '19:00~20:00', seats: 135, sold: false },
    ],
    carpoolShow: [],
    carpoolSel: '',

    /* --- 包车出发：右侧直接下单（不跳转 rideOrder） --- */
    addrFrom: '煤管局住宅区吕梁市孝义市振兴街',
    addrTo: '煤管局住宅区吕梁市孝义市振兴街2',
    // 时间段：后端定好几点到几点，当前先用模拟数据，接口通了换掉
    tripTime: '19:00~20:00',
    charterTimes: [],   // [{ label, start, end }]
    timeIdx: -1,
    lineId: '',
    dateSheetOpen: false,   // 日期底部弹框
    timeSheetOpen: false,   // 时间段底部弹框
    timeLoading: false,
    charterVeh: [
      { name: '6座高级包车', seats: '1-5人', price: 280, tag: '宽敞', hot: true, img: '/assets/images/car1.png' },
      { name: '7座中级包车', seats: '1-6人', price: 240, tag: '舒适', hot: true, img: '/assets/images/car2.png' },
    ],
    vehSel: 0,
    vehPrice: 280,
    phone: '',
    remark: '',
    agree: false,

    /* --- 跨城跑腿：城际捎货 / 城际跑腿 --- */
    errandSub: 0,           // 0=城际捎货 1=城际跑腿
    // 捎货
    cargoSpeed: 0,          // 0=普通 1=加急(+30)
    cargoType: 0,           // 选中货物类别下标
    cargoTypes: [
      { name: '捎货小件(335mm*335mm*113mm)', price: 30 },
      { name: '捎货大件(500mm*340mm*190mm)', price: 60 },
      { name: '捎货包车', price: 99 },
    ],
    cargoName: '',
    cargoImgs: [],          // 货物照片，1~3 张
    senderName: '', senderPhone: '', senderAddr: '',
    receiverName: '', receiverPhone: '', receiverAddr: '',
    cargoRemark: '',
    // 跑腿
    runType: 0,             // 选中服务类型下标
    runTypes: [
      { name: '代取外卖：到店取餐，负责城际运输送达，客户自己点餐', price: 30 },
      { name: '带点外卖：代点餐品，负责城际运输送达不含外卖费用', price: 60 },
    ],
    shopName: '', foodReq: '',
    runName: '', runPhone: '', runAddr: '',
    orderPhone: '', runRemark: '',
    // 费用与协议
    erBase: 30, erUrgent: 0, erTotal: 30,
    erAgree: false,
  },


  onShow() {
    // 从 starting2 选完地址返回时，回填上下车地址
    const start = wx.getStorageSync('starInfo2');
    const end = wx.getStorageSync('endInfo2');
    const patch = {};
    if (start && start.startAddress) patch.addrFrom = start.startAddress;
    if (end && end.endAddress) patch.addrTo = end.endAddress;
    if (Object.keys(patch).length) this.setData(patch);
  },

  onPickAddr(e) {
    const direction = e.currentTarget.dataset.direction;
    wx.navigateTo({
      url: `/pages/starting2/starting2?direction=${direction}&type=ride`,
    });
  },
  onLoad(query) {
    // 出发地/目的地/日期由首页 index 页查询带入
    const from = query.from ? decodeURIComponent(query.from) : this.data.from;
    const to = query.to ? decodeURIComponent(query.to) : this.data.to;

    // 包车时间段接口需要线路 id：优先路径参数，其次缓存
    const storageSync = wx.getStorageSync('storageSync') || {};
    const lineId = query.lineId || wx.getStorageSync('lineId') || storageSync.lineId || '';

    // 可选四天固定以真实今天为基准（今天/明天/后天/第4天），不受传入日期影响
    const base = new Date();
    const dates = this.buildDates(base);

    // 传入日期落在哪天就选中哪天，默认第 1 天
    let idx = 0;
    if (query.date) {
      const hit = dates.findIndex(d => d.full === query.date);
      if (hit >= 0) idx = hit;
    }

    this.setData({
      from,
      to,
      dates,
      dateIdx: idx,
      lineId,
    });
    this.applyDate(idx);
    this.filterCarpool();
    // 拉包车可选时间段（后端定义几点到几点）
    this.fetchCharterTimes(idx);
  },

  //获取包车车型列表
  getCarList() {
    wx.showLoading({
      title: '',
    })
    let _this = this;
    let data = {
      IsExclusive: '100004-0000010001',
      Id: storageSync.lineId,
      StartLat: starInfo2.startLait,
      StartLng: starInfo2.startLont,
      EndLat: endInfo2.endLait,
      EndLng: endInfo2.endLont,
      ArrivalTime: ArrivalTime,
      MemberId: userinfo.Id,
      AdultNumber: 1,
    };
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/getPriceListForLineId',
      data: data,
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
         console.log(res)
          // _this.setData({
          //   hotRoutes:res.data.data
          // })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
      },
      fail(err) {
        console.error('网络异常:', err)
      },complete() {
        wx.hideLoading()
      }
    })
  },
  // 生成固定四天：今天/明天/后天 + 第4天显示周几
  buildDates(base) {
    const arr = [];
    const fixed = ['今天', '明天', '后天'];
    for (let i = 0; i < 4; i++) {
      const d = new Date(base.getTime());
      d.setDate(base.getDate() + i);
      arr.push({
        label: fixed[i] || WEEK[d.getDay()],
        md: `${d.getMonth() + 1}/${d.getDate()}`,
        full: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      });
    }
    return arr;
  },

  // 切日期：顶部出发日期文案同步
  applyDate(idx) {
    const d = this.data.dates[idx];
    if (!d) return;
    const dt = new Date(d.full.replace(/-/g, '/'));
    this.setData({
      dateLabel: `${dt.getMonth() + 1}月${dt.getDate()}日`,
    });
  },

  onDateTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ dateIdx: idx });
    this.applyDate(idx);
    // 换日期后重新拉包车时间段
    this.fetchCharterTimes(idx);
  },

  /* ===== 包车出发：日期 / 时间段 底部弹框 ===== */
  onOpenDateSheet() {
    this.setData({ dateSheetOpen: true, timeSheetOpen: false });
  },

  onOpenTimeSheet() {
    this.setData({ timeSheetOpen: true, dateSheetOpen: false });
  },

  onCloseSheets() {
    this.setData({ dateSheetOpen: false, timeSheetOpen: false });
  },

  noop() {},

  // 弹框里选日期：dates 只有四天，天然限制在 今天~第4天
  onDateSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ dateIdx: idx, dateSheetOpen: false });
    this.applyDate(idx);
    this.fetchCharterTimes(idx);
  },

  // 弹框里选时间段（选项由后端返回）
  onTimeSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const item = this.data.charterTimes[idx];
    if (!item) return;
    this.setData({
      timeIdx: idx,
      tripTime: item.label,
      timeSheetOpen: false,
    });
  },

  // 获取包车可选时间段（后端定好的"几点到几点"）
  // TODO 接口就绪后改用：
  // wx.request({ url: baseUrl + '/api/DispatchMobile/GetCharterTimeListForDate?time=' + d.full + '&lineId=' + this.data.lineId, ... })
  // 返回 res.data[i].RunTimeShow（如 "08:00-09:00"）
  fetchCharterTimes(dateIdx) {
    const d = this.data.dates[dateIdx];
    if (!d) return;

    // ---- 模拟数据：后端定好的时间段 ----
    const mockLabels = [
      '08:00~09:00', '09:00~10:00', '10:00~11:00', '11:00~12:00',
      '13:00~14:00', '15:00~16:00', '17:00~18:00', '19:00~20:00', '20:00~21:00',
    ];
    const charterTimes = mockLabels.map(function (label) {
      const parts = label.split('~');
      return { label: label, start: parts[0], end: parts[1] };
    });

    // 保持已选：原 tripTime 还在列表里就继续选中，否则清空
    const cur = this.data.tripTime;
    const keepIdx = charterTimes.findIndex(t => t.label === cur);
    this.setData({
      charterTimes: charterTimes,
      timeIdx: keepIdx,
      tripTime: keepIdx >= 0 ? cur : '',
      timeLoading: false,
    });
  },

  onTabTap(e) {
    this.setData({ tab: Number(e.currentTarget.dataset.idx) });
  },

 

  onSwap() {
    this.setData({ from: this.data.to, to: this.data.from });
  },

  /* ===== 站点上车 ===== */
  onHotTap(e) {
    const i = Number(e.currentTarget.dataset.idx);
    const key = `hotStations[${i}].sel`;
    const sel = !this.data.hotStations[i].sel;
    this.setData({
      [key]: sel,
      hotCount: this.data.hotStations.filter(h => h.sel).length + (sel ? 1 : -1),
    });
  },

  onOpenStationPage() {
    wx.showToast({ title: '选择上下车站点（待接入）', icon: 'none' });
  },

  onBookStation(e) {
    const item = this.data.stationRoutes[Number(e.currentTarget.dataset.idx)];
    wx.navigateTo({ url: '/pages/stationOrder/stationOrder?price=' + item.platformPrice });
  },

  /* ===== 拼车上门 / 包车出发 ===== */
  filterCarpool() {
    const p = this.data.periodIdx;
    this.setData({ carpoolShow: this.data.carpoolAll.filter(c => c.period === p) });
  },

  onPeriodTap(e) {
    this.setData({ periodIdx: Number(e.currentTarget.dataset.idx) });
    this.filterCarpool();
  },

  // 选中班次并跳转下单页（仅拼车上门）
  onCarpoolTap(e) {
    const { id, sold } = e.currentTarget.dataset;
    if (sold) {
      wx.showToast({ title: '该时段已售罄', icon: 'none' });
      return;
    }
    const item = this.data.carpoolAll.find(c => c.id === id);
    const d = this.data.dates[this.data.dateIdx];
    this.setData({ carpoolSel: id });
    wx.navigateTo({
      url: `/pages/rideOrder/rideOrder?mode=carpool` +
        `&from=${encodeURIComponent(this.data.from)}` +
        `&to=${encodeURIComponent(this.data.to)}` +
        `&dayLabel=${d.label}&md=${d.md}&time=${item.time}&date=${d.full}`,
      fail(err) {
        wx.showModal({
          title: '跳转失败',
          content: String((err && err.errMsg) || err),
          showCancel: false,
        });
      },
    });
  },

  /* ===== 包车出发：右侧直接下单 ===== */
  onVehTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ vehSel: idx, vehPrice: this.data.charterVeh[idx].price });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onAgreeTap() {
    this.setData({ agree: !this.data.agree });
  },

  onCharterPay() {
    // if (!/^1\d{10}$/.test(this.data.phone)) {
    //   wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
    //   return;
    // }
    // if (!this.data.agree) {
    //   wx.showToast({ title: '请先同意服务条款', icon: 'none' });
    //   return;
    // }
    // const veh = this.data.charterVeh[this.data.vehSel];
    // wx.showToast({ title: `${veh.name} ¥${veh.price}`, icon: 'none' });
    wx.navigateToMiniProgram({
      appId: 'wx3cbe919f36710d1c',
      path: '/pages/CQPApplet/index?tn=548548590630064569907',
      extraData: {
        foo: 'bar'
      },
      success(res) {
        // 打开成功
      }
    })
  },

 

  /* ===== 跨城跑腿 ===== */
  /* ===== 跨城跑腿：子tab与表单 ===== */
  onErrandSubTap(e) {
    this.setData({ errandSub: Number(e.currentTarget.dataset.idx) });
    this.calcErrandFee();
  },

  onErInput(e) {
    this.setData({ [e.currentTarget.dataset.k]: e.detail.value });
  },

  // 捎货：时效 / 类别
  onCargoSpeedTap(e) {
    this.setData({ cargoSpeed: Number(e.currentTarget.dataset.idx) });
    this.calcErrandFee();
  },
  onCargoTypeTap(e) {
    this.setData({ cargoType: Number(e.currentTarget.dataset.idx) });
    this.calcErrandFee();
  },

  // 捎货：货物照片（最多3张）
  onCargoImgAdd() {
    const left = 3 - this.data.cargoImgs.length;
    if (left <= 0) return;
    const that = this;
    wx.chooseMedia({
      count: left,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success(res) {
        const paths = (res.tempFiles || []).map(f => f.tempFilePath);
        that.setData({ cargoImgs: that.data.cargoImgs.concat(paths).slice(0, 3) });
      },
    });
  },
  onCargoImgDel(e) {
    const imgs = this.data.cargoImgs.slice();
    imgs.splice(Number(e.currentTarget.dataset.idx), 1);
    this.setData({ cargoImgs: imgs });
  },

  // 跑腿：服务类型
  onRunTypeTap(e) {
    this.setData({ runType: Number(e.currentTarget.dataset.idx) });
    this.calcErrandFee();
  },

  onErAgreeTap() {
    this.setData({ erAgree: !this.data.erAgree });
  },

  // 费用：捎货=类别价+加急30；跑腿=服务类型价
  calcErrandFee() {
    let base, urgent;
    if (this.data.errandSub === 0) {
      base = this.data.cargoTypes[this.data.cargoType].price;
      urgent = this.data.cargoSpeed === 1 ? 30 : 0;
    } else {
      base = this.data.runTypes[this.data.runType].price;
      urgent = 0;
    }
    this.setData({ erBase: base, erUrgent: urgent, erTotal: base + urgent });
  },

  onErrandPay() {
    const d = this.data;
    if (!d.erAgree) {
      wx.showToast({ title: '请先同意服务条款', icon: 'none' });
      return;
    }
    const need = (v, msg) => { if (!v) { wx.showToast({ title: msg, icon: 'none' }); return false; } return true; };
    const phoneOk = (v) => /^1\d{10}$/.test(v);
    if (d.errandSub === 0) {
      if (!need(d.cargoName, '请填写货物名称')) return;
      if (!d.cargoImgs.length) { wx.showToast({ title: '请至少上传1张货物照片', icon: 'none' }); return; }
      if (!need(d.senderName, '请填写寄件人称呼') || !need(d.senderPhone, '请填写寄件人电话')) return;
      if (!phoneOk(d.senderPhone)) { wx.showToast({ title: '寄件人手机号格式不正确', icon: 'none' }); return; }
      if (!need(d.senderAddr, '请填写取件地址')) return;
      if (!need(d.receiverName, '请填写收件人称呼') || !need(d.receiverPhone, '请填写收件人电话')) return;
      if (!phoneOk(d.receiverPhone)) { wx.showToast({ title: '收件人手机号格式不正确', icon: 'none' }); return; }
      if (!need(d.receiverAddr, '请填写收件地址')) return;
    } else {
      if (!need(d.shopName, '请填写点餐店铺')) return;
      if (!need(d.foodReq, '请填写餐品要求')) return;
      if (!need(d.runName, '请填写送达人称呼') || !need(d.runPhone, '请填写送达人电话')) return;
      if (!phoneOk(d.runPhone)) { wx.showToast({ title: '送达人手机号格式不正确', icon: 'none' }); return; }
      if (!need(d.runAddr, '请填写取件地址')) return;
      if (!need(d.orderPhone, '请填写下单人联系电话')) return;
      if (!phoneOk(d.orderPhone)) { wx.showToast({ title: '下单人手机号格式不正确', icon: 'none' }); return; }
    }
    // TODO 接入下单接口
    wx.showToast({ title: `下单成功 ¥${d.erTotal}`, icon: 'none' });
  },
});
