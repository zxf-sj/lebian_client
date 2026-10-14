// pages/rideOrder/rideOrder.js  拼车/包车 共用的下单页
// mode=carpool 拼车下单（无成人儿童步进器）；mode=charter 包车下单（有成人儿童步进器）
Page({
  data: {
    mode: 'carpool',
    from: '孝义',
    to: '太原',
    dayLabel: '今天',
    md: '10/12',
    time: '19:00~20:00',

    // 车型：origin 有值则显示"限时特惠"，无值只显示价格
    // 拼车下单页：6座高级包车 ¥80 → 限时特惠 ¥59.9（带成人/儿童选择）
    // 包车下单页：无特惠、无成人/儿童行
    vehicles: [],
    vehSel: 0,
    vehPrice: 0,

    // 站点：[上车, 下车]，点击圆点/⇅可互换
    stations: [
      { city: '孝义', address: '煤管局住宅区吕梁市孝义市振兴街' },
      { city: '太原', address: '煤管局住宅区吕梁市孝义市振兴街2' },
    ],

    // 乘车人：每人独立的成人/儿童数和身份证号
    passengers: [
      { name: '张一', idCard: '142301199001011234', adults: 1, children: 0 },
      { name: '王二', idCard: '142301199502025678', adults: 1, children: 0 },
    ],
    paxIdx: 0,

    phone: '',
    remark: '',
    agree: false,
  },


  onShow() {
    const start = wx.getStorageSync('starInfo2');
    const end = wx.getStorageSync('endInfo2');
    const stations = this.data.stations.slice();
    let changed = false;
    if (start && start.startAddress) { stations[0] = { ...stations[0], address: start.startAddress }; changed = true; }
    if (end && end.endAddress) { stations[1] = { ...stations[1], address: end.endAddress }; changed = true; }
    if (changed) this.setData({ stations });
  },

  onPickAddr(e) {
    const direction = e.currentTarget.dataset.direction;
    wx.navigateTo({
      url: `/pages/starting2/starting2?direction=${direction}&type=rideOrder`,
    });
  },
  onLoad(query) {
    const mode = query.mode === 'charter' ? 'charter' : 'carpool';
    const vehicles = mode === 'carpool' ? [
      { name: '6座高级包车', seats: '1-5人', origin: 80, price: 59.9, tag: '宽敞', img: '/assets/images/car1.png' },
      { name: '7座中级包车', seats: '1-6人', origin: 60, price: 49.9, tag: '舒适', img: '/assets/images/car2.png' },
    ] : [
      { name: '6座高级包车', seats: '1-5人', price: 280, tag: '宽敞', img: '/assets/images/car1.png' },
      { name: '7座中级包车', seats: '1-6人', price: 240, tag: '舒适', img: '/assets/images/car2.png' },
    ];

    this.setData({
      mode,
      from: query.from ? decodeURIComponent(query.from) : this.data.from,
      to: query.to ? decodeURIComponent(query.to) : this.data.to,
      dayLabel: query.dayLabel || this.data.dayLabel,
      md: query.md || this.data.md,
      time: query.time || this.data.time,
      vehicles,
      vehPrice: vehicles[0].price,
    });
  },

  onVehTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ vehSel: idx, vehPrice: this.data.vehicles[idx].price });
  },

  // 互换上下车站
  onSwapStations() {
    const s = this.data.stations.slice();
    [s[0], s[1]] = [s[1], s[0]];
    this.setData({ stations: s });
  },

  // 切换乘车人
  onPaxTab(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ paxIdx: idx });
  },

  // 以下四个操作的是当前选中的乘客
  onAdultMinus() {
    const p = this.data.passengers[this.data.paxIdx];
    if (p.adults > 1) {
      const key = `passengers[${this.data.paxIdx}].adults`;
      this.setData({ [key]: p.adults - 1 });
    }
  },
  onAdultPlus() {
    const p = this.data.passengers[this.data.paxIdx];
    this.setData({ [`passengers[${this.data.paxIdx}].adults`]: p.adults + 1 });
  },
  onChildMinus() {
    const p = this.data.passengers[this.data.paxIdx];
    if (p.children > 0) {
      this.setData({ [`passengers[${this.data.paxIdx}].children`]: p.children - 1 });
    }
  },
  onChildPlus() {
    const p = this.data.passengers[this.data.paxIdx];
    this.setData({ [`passengers[${this.data.paxIdx}].children`]: p.children + 1 });
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },
  onAgreeTap() { this.setData({ agree: !this.data.agree }); },

  onPay() {
    if (!this.data.agree) {
      wx.showToast({ title: '请先同意服务条款', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(this.data.phone)) {
      wx.showToast({ title: '请填写正确的手机号', icon: 'none' });
      return;
    }
    wx.showToast({ title: `提交预约 ¥${this.data.vehPrice}`, icon: 'none' });
  },
});
