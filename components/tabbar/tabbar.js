Component({
  /**
   * 组件的属性列表
   * current: 当前选中的 tab，可选值 home / orders / life / mine
   */
  properties: {
    current: {
      type: String,
      value: 'home'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabs: {
      home: '/pages/chengji/chengji',
      orders: '/user_center/pages/travelList/travelList',
      life: '/pages/life/life',
      mine: '/user_center/pages/personalCenter/personalCenter'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      var key = e.currentTarget.dataset.key;
      if (key === this.data.current) {
        return;
      }
      var url = this.data.tabs[key];
      if (!url) {
        return;
      }
      // 订单、我的在分包中，原生 tabBar 不支持分包页面，统一用 reLaunch 切换
      wx.reLaunch({
        url: url
      });
    }
  }
});
