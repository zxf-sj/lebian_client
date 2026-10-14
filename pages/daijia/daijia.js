Page({
  data: {
    startPoint: '',
    endPoint: '',
    phone: '',
    fee: '0',
    remark: ''
  },

  // 选择起点/终点（暂用 toast 占位，实际可接入地图选点）
  onPickStart() {
    wx.showToast({ title: '选择起点（待接入地图）', icon: 'none' });
  },
  onPickEnd() {
    wx.showToast({ title: '选择终点（待接入地图）', icon: 'none' });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  onSubmit() {
    const { startPoint, endPoint, phone } = this.data;
    if (!startPoint) { wx.showToast({ title: '请选择起点', icon: 'none' }); return; }
    if (!endPoint) { wx.showToast({ title: '请选择终点', icon: 'none' }); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return; }

    wx.showToast({ title: '预订成功，客服将联系您', icon: 'success', duration: 2000 });
  },

  onGoHome() {
    wx.navigateBack();
  },

  onGoOrders() {
    wx.showToast({ title: '代驾订单（待接入）', icon: 'none' });
  }
});
