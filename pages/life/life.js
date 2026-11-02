Page({
  data: {
    services: [
      { name: '旅游',     active: true,  img: '/assets/images/lvyou2.png',   url: '/pages/lvyouHome/lvyouHome' },
      { name: '陪诊',     active: false, img: '/assets/images/peizhen.png',  url: '/driving_status/pages/peizhenList/peizhenList' },
      { name: '租车',     active: false, img: '/assets/images/zuche.png',    url: '/pages/lvbao/lvbao' },
      { name: '城际代驾', active: false, img: '/assets/images/car2.png',     url: '/pages/daijia/daijia' },
      { name: '吕梁地图', active: false, img: '/assets/images/mapCart.png',  url: '' },
      { name: '增加中',   active: false, img: '/assets/images/plus.png',     url: '' },
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
});
