// pages/addPassenger/addPassenger.js  新增乘车人
Page({
  data: {
    type: 'adult', // adult | child
    name: '',
    idcard: '',
    contact: '',
    phone: '',
    isDefault: true,
    agree: false,
  },

  onType(e) {
    this.setData({ type: e.currentTarget.dataset.t });
  },

  onName(e) {
    this.setData({ name: e.detail.value });
  },

  onIdcard(e) {
    this.setData({ idcard: e.detail.value });
  },

  onContact(e) {
    this.setData({ contact: e.detail.value });
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  onDefault(e) {
    this.setData({ isDefault: e.detail.value });
  },

  onAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onSave() {
    const { name, idcard, phone, agree } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' });
      return;
    }
    if (!idcard.trim()) {
      wx.showToast({ title: '请输入证件号码', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!agree) {
      wx.showToast({ title: '请先阅读并同意隐私政策', icon: 'none' });
      return;
    }
    // TODO 接入新增乘车人接口
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },
});
