Page({
  data: {
    searchValue: '',
    routeList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    this.loadRouteList();
  },

  // 加载公交线路列表
  loadRouteList: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 模拟API请求
    wx.showLoading({ title: '加载中' });
    setTimeout(() => {
      const mockData = this.getMockData(this.data.page, this.data.pageSize);
      
      this.setData({
        routeList: this.data.page === 1 
          ? mockData 
          : this.data.routeList.concat(mockData),
        page: this.data.page + 1,
        hasMore: mockData.length === this.data.pageSize,
        loading: false
      });
      
      wx.hideLoading();
    }, 800);
  },

  // 搜索输入处理
  handleSearchInput: function(e) {
    this.setData({ searchValue: e.detail.value });
  },

  // 搜索按钮点击
  handleSearch: function() {
    this.setData({ page: 1, hasMore: true });
    this.loadRouteList();
  },

  // 加载更多
  loadMore: function() {
    this.loadRouteList();
  },

  // 跳转到详情页
  navigateToDetail: function(e) {
    const routeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/routeDetail/routeDetail`
    });
  },

  // 模拟数据
  getMockData: function(page, pageSize) {
    const routes = [];
    const start = (page - 1) * pageSize;
    for (let i = 1; i <= pageSize; i++) {
      const id = start + i;
      routes.push({
        id: id,
        routeNumber: i%2==0?"太原--->孝义":"孝义--->太原",
        routeName: `城际专线`,
        startStation: `起点站`+i%2==0?"太原站":"孝义站",
        endStation: `终点站`+i%2==0?"孝义站":"太原站",
        firstBus: '06:00',
        lastBus: '22:30',
        price: '2'
      });
    }
    
    // 模拟搜索过滤
    if (this.data.searchValue) {
      return routes.filter(item => 
        item.routeNumber.includes(this.data.searchValue) || 
        item.routeName.includes(this.data.searchValue) ||
        item.startStation.includes(this.data.searchValue) ||
        item.endStation.includes(this.data.searchValue)
      );
    }
    
    return routes;
  }
});
