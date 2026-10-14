Page({
  data: {
    services: [
      { name: '旅游',     active: true,  url: '/pages/lvyouHome/lvyouHome' },
      { name: '陪诊',     active: false, url: '/driving_status/pages/peizhenList/peizhenList' },
      { name: '租车',     active: false, url: '/pages/lvbao/lvbao' },
      { name: '城际代驾', active: false, url: '/pages/daijia/daijia' },
      { name: '吕梁地图', active: false, url: '' },
      { name: '增加中',   active: false, url: '' },
    ],
  },

  onServiceTap(e) {
    const { name, url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: name + ' 敬请期待', icon: 'none' });
    }
  },

  onKefuTap() {
    wx.showToast({ title: '联系客服', icon: 'none' });
  },
});
