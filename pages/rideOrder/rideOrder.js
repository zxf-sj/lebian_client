// pages/rideOrder/rideOrder.js  拼车/包车 共用的下单页
// mode=carpool 拼车下单（无成人儿童步进器）；mode=charter 包车下单（有成人儿童步进器）
Page({
  data: {
    mode: 'carpool',
    from: '孝义',
    to: '太原',
    dayLabel: '今天',
    md: '10/12',
    dates: [],       // 固定四天：今天/明天/后天/第4天
    dateIdx: 0,

    // 时间段：后端定好几点到几点，当前先用模拟数据，接口通了换掉
    time: '19:00~20:00',
    charterTimes: [],   // [{ label, start, end }]
    timeIdx: -1,
    dateSheetOpen: false,   // 日期底部弹框
    timeSheetOpen: false,   // 时间段底部弹框,
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

    // 固定四天（今天/明天/后天/第4天），与 ride 页一致
    const dates = this.buildDates(new Date());
    // 列表页带入的日期落在哪天选哪天，默认第 1 天
    let idx = 0;
    if (query.date) {
      const hit = dates.findIndex(d => d.full === query.date);
      if (hit >= 0) idx = hit;
    }

    this.setData({
      mode,
      from: query.from ? decodeURIComponent(query.from) : this.data.from,
      to: query.to ? decodeURIComponent(query.to) : this.data.to,
      dates,
      dateIdx: idx,
      dayLabel: dates[idx].label,
      md: dates[idx].md,
      time: query.time || this.data.time,
      vehicles,
      vehPrice: vehicles[0].price,
    });
    this.fetchCharterTimes(idx);
  },

  // 生成固定四天：今天/明天/后天 + 第4天显示周几（与 ride 页一致）
  buildDates(base) {
    const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const pad = n => String(n).padStart(2, '0');
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

  /* ===== 日期 / 时间段 底部弹框（与 ride 页一致） ===== */
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

  onDateSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const d = this.data.dates[idx];
    if (!d) return;
    this.setData({
      dateIdx: idx,
      dayLabel: d.label,
      md: d.md,
      dateSheetOpen: false,
    });
    this.fetchCharterTimes(idx);
  },

  onTimeSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const item = this.data.charterTimes[idx];
    if (!item) return;
    this.setData({
      timeIdx: idx,
      time: item.label,
      timeSheetOpen: false,
    });
  },

  // 获取包车可选时间段（后端定好的"几点到几点"）
  // TODO 接口就绪后改用：
  // wx.request({ url: baseUrl + '/api/DispatchMobile/GetCharterTimeListForDate?time=' + d.full + '&lineId=' + lineId, ... })
  // 返回 res.data[i].RunTimeShow（如 "08:00-09:00"）
  fetchCharterTimes(dateIdx) {
    const d = this.data.dates[dateIdx];
    if (!d) return;

    // ---- 模拟数据：后端定好的时间段 ----
    const mockLabels = [
      '08:00~09:00', '09:00~10:00', '10:00~11:00', '11:00~12:00',
      '13:00~14:00', '15:00~16:00', '17:00~18:00', '19:00~20:00', '20:00~21:00',
    ];
    const charterTimes = mockLabels.map(label => {
      const parts = label.split('~');
      return { label, start: parts[0], end: parts[1] };
    });

    // 保持已选：原 time 还在列表里就继续选中，否则清空
    const cur = this.data.time;
    const keepIdx = charterTimes.findIndex(t => t.label === cur);
    this.setData({
      charterTimes,
      timeIdx: keepIdx,
      time: keepIdx >= 0 ? cur : '',
    });
  },

  onVehTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ vehSel: idx, vehPrice: this.data.vehicles[idx].price });
  },

  // 成人/儿童数量仍作用于 passengers[paxIdx]（默认第 1 位）
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
