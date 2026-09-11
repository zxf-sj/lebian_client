// user_center/pages/select-traveler/select-traveler.js
Page({
  data: {
    // 模拟出行人数据（实际可从接口获取）
    travelers: [
      {
        id: 1,
        name: '张晓峰',
        type: 'adult', // adult/child 等类型
        idCardType: '中国居民身份证',
        idCard: '142**************75',
        selected: false // 是否选中
      }
    ]
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 添加出行人（跳转至添加页面）
  addTraveler() {
    wx.navigateTo({
      url: '/pages/add-traveler/add-traveler' // 需提前创建该页面
    });
  },

  // 编辑出行人（跳转至编辑页面）
  editTraveler(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/edit-traveler/edit-traveler?id=${id}` // 需提前创建该页面
    });
  },

  // 选择出行人（单选逻辑）
  selectTraveler(e) {
    const id = e.currentTarget.dataset.id;
    const travelers = this.data.travelers.map(item => ({
      ...item,
      selected: item.id === id // 仅当前项选中
    }));
    this.setData({ travelers });
  },

  // 确认选择（获取选中项并返回上一页）
  confirmSelection() {
    const selected = this.data.travelers.find(item => item.selected);
    if (!selected) {
      wx.showToast({ title: '请选择出行人', icon: 'none' });
      return;
    }
    // 将选中数据传递给上一页（通过事件通道或全局变量）
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.setData({ selectedTraveler: selected }); // 假设上一页有 selectedTraveler 变量
    wx.navigateBack({ delta: 1 });
  }
});