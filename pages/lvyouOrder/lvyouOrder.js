Page({
  data: {
    dates: [
      { md: '10月17日', week: '周六', full: '2026-10-17' },
      { md: '10月18日', week: '周日', full: '2026-10-18' },
      { md: '10月19日', week: '周一', full: '2026-10-19' },
    ],
    dateIdx: 0,
    adults: 1,
    children: 0,
    adultPrice: 328,
    childPrice: 328,
    totalPrice: 328,
  },
  onDateTap(e) { this.setData({ dateIdx: Number(e.currentTarget.dataset.idx) }); },
  onAdultPlus() { this.setData({ adults: this.data.adults + 1 }, this.calc); },
  onAdultMinus() {
    if (this.data.adults > 1) this.setData({ adults: this.data.adults - 1 }, this.calc);
  },
  onChildPlus() { this.setData({ children: this.data.children + 1 }, this.calc); },
  onChildMinus() {
    if (this.data.children > 0) this.setData({ children: this.data.children - 1 }, this.calc);
  },
  calc() {
    const t = this.data.adults * this.data.adultPrice + this.data.children * this.data.childPrice;
    this.setData({ totalPrice: t });
  },
  onPay() {
    wx.showToast({ title: `提交预约 ¥${this.data.totalPrice}`, icon: 'none' });
  },
  onBack() { wx.navigateBack({ delta: 1 }); },
});
