Page({
  /**
   * 服务入口
   *
   * 【版本说明】旅游 / 陪诊 / 租车 目前仍在用「旧版」页面（D:\备份\10.10客户端旧版备份），
   * 新版页面已存在但暂不启用，等新版验收后再把 url 切过去：
   *   旅游：新版 /pages/lvyouHome/lvyouHome
   *   陪诊：新版暂未提供（旧版目录 driving_status/pages/peizhenList）
   *   租车：新版 /pages/lvbao/lvbao
   * 切换时只改 url，并删掉对应的「旧版」注释即可。
   *
   * 城际代驾：先注掉（新版 /pages/daijia/daijia），需要上线时把下面那行取消注释。
   */
  data: {
    services: [
      // 旧版：旅游列表（新版为 /pages/lvyouHome/lvyouHome）
      { name: '旅游',     active: true,  img: '/assets/images/lvyou2.png',   url: '/driving_status/pages/lvyouList/lvyouList' },
      // 旧版：陪诊列表（新版页面暂未提供）
      { name: '陪诊',     active: false, img: '/assets/images/peizhen.png',  url: '/driving_status/pages/peizhenList/peizhenList' },
      // 旧版：租车（页面从旧版备份拷入 pages/zuche、pages/zuDetail；新版为 /pages/lvbao/lvbao）
      { name: '租车',     active: false, img: '/assets/images/zuche.png',    url: '/pages/zuche/zuche' },
      // 城际代驾：暂时下线，恢复时取消下面这行注释
      // { name: '城际代驾', active: false, img: '/assets/images/car2.png',  url: '/pages/daijia/daijia' },
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
