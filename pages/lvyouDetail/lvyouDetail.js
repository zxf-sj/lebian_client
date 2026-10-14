Page({
  data: {
    route: {
      title: '五台山朝圣2日游',
      from: '太原', to: '五台山', days: 2, price: 328,
      tags: ['含门票', '纯玩无购物'],
      itinerary: [
        { day: '第1天', text: '太原集合出发，车赴五台山，游览显通寺、塔院寺，宿台怀镇。' },
        { day: '第2天', text: '登黛螺顶小朝台，五爷庙祈福，下午返回太原。' },
      ],
      included: [
        '往返旅游巴士及行程内交通',
        '行程所列景点门票与导游讲解',
        '当地住宿（按线路行程安排）',
        '旅行社责任险',
      ],
      excluded: [
        '行程外个人消费与自费项目',
        '部分正餐（以当日安排为准）',
        '旅游意外险（可另行购买）',
      ],
    },
  },
  onBook() {
    wx.navigateTo({ url: '/pages/lvyouOrder/lvyouOrder' });
  },
  onBack() { wx.navigateBack({ delta: 1 }); },
});
