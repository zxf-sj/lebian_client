Page({
  data: {
    cities: ['太原', '大同', '临汾', '运城', '晋中', '忻州', '长治'],
    cityIdx: 0,
    sorts: ['默认推荐', '价格降序', '价格升序'],
    sortIdx: 0,
    days: ['全部', '1-2天', '3-7天', '6-8天', '9天+'],
    dayIdx: 0,
    routes: [
      { id: 1, title: '五台山朝圣2日游太原出发', from: '太原', to: '五台山', days: 2, price: 328, dates: '10月17日、10月18日', tags: ['含门票', '纯玩无购物'] },
      { id: 2, title: '平遥古城·乔家大院2日游', from: '太原', to: '平遥', days: 2, price: 298, dates: '10月17日、10月18日', tags: ['古城客栈', '含讲解'] },
    ],
  },
  onCityTap(e) { this.setData({ cityIdx: Number(e.currentTarget.dataset.idx) }); },
  onSortTap(e) { this.setData({ sortIdx: Number(e.currentTarget.dataset.idx) }); },
  onDayTap(e) { this.setData({ dayIdx: Number(e.currentTarget.dataset.idx) }); },
  onRouteTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/lvyouDetail/lvyouDetail?id=${id}` });
  },
});
