import http from '../../utils/http.js';

Page({
  data: {
    tabIdx: 0,

    // 包车 tab
    startPoint: '',
    endPoint: '',
    phone: '',
    startDate: '',
    selectedCar: 0,
    tripType: 0, // 0单程 1往返

    // 租车 tab
    rentStartDate: '',
    rentEndDate: '',
    rentPhone: '',
    selectedRentCar: 0
  },

  onTabTap(e) {
    this.setData({ tabIdx: Number(e.currentTarget.dataset.idx) });
  },

  // ---- 包车表单 ----
  onStartInput(e) { this.setData({ startPoint: e.detail.value }); },
  onEndInput(e) { this.setData({ endPoint: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onStartDateChange(e) { this.setData({ startDate: e.detail.value }); },
  onCarTap(e) { this.setData({ selectedCar: Number(e.currentTarget.dataset.idx) }); },
  onTripTap(e) { this.setData({ tripType: Number(e.currentTarget.dataset.idx) }); },

  // ---- 租车表单 ----
  onRentStartDateChange(e) { this.setData({ rentStartDate: e.detail.value }); },
  onRentEndDateChange(e) { this.setData({ rentEndDate: e.detail.value }); },
  onRentPhoneInput(e) { this.setData({ rentPhone: e.detail.value }); },
  onRentCarTap(e) { this.setData({ selectedRentCar: Number(e.currentTarget.dataset.idx) }); },

  // ---- 提交包车 ----
  onSubmitCharter() {
    const { startPoint, endPoint, phone, startDate, selectedCar, tripType } = this.data;
    if (!startPoint.trim()) { wx.showToast({ title: '请输入起点', icon: 'none' }); return; }
    if (!endPoint.trim()) { wx.showToast({ title: '请输入终点', icon: 'none' }); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return; }
    if (!startDate) { wx.showToast({ title: '请选择出发日期', icon: 'none' }); return; }

    const carName = selectedCar === 0 ? '6座高级包车' : '';
    const tripName = tripType === 0 ? '单程' : '往返';

    wx.showToast({ title: '预订成功，客服将联系您', icon: 'success', duration: 2000 });
  },

  // ---- 提交租车 ----
  onSubmitRent() {
    const { rentStartDate, rentEndDate, rentPhone, selectedRentCar } = this.data;
    if (!rentStartDate) { wx.showToast({ title: '请选择租用日期', icon: 'none' }); return; }
    if (!rentEndDate) { wx.showToast({ title: '请选择还车日期', icon: 'none' }); return; }
    if (!/^1[3-9]\d{9}$/.test(rentPhone)) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return; }

    wx.showToast({ title: '预订成功，客服将联系您', icon: 'success', duration: 2000 });
  },

  onGoHome() {
    wx.navigateTo({ url: '/pages/lvyouHome/lvyouHome' });
  },

  onGoOrders() {
    wx.navigateTo({ url: '/pages/lvyouOrder/lvyouOrder' });
  }
});
