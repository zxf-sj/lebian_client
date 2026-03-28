Page({
  data: {
    stations: [
      { id: 1, name: '客运东站', status: 'passed' },
      { id: 2, name: '山大三院', status: 'passed' },
      { id: 3, name: '太原火车站', status: 'current' },
      { id: 4, name: '省人民医院', status: 'next' },
      { id: 5, name: '太原火车南站', status: 'upcoming' },
      { id: 6, name: '武宿机场', status: 'upcoming' },
      { id: 7, name: '大学城', status: 'upcoming' },
      { id: 8, name: '汾孝站', status: 'upcoming' },
      { id: 9, name: '孝义市内（就近下车）', status: 'upcoming' },
      { id: 10, name: '高阳', status: 'upcoming' },
      { id: 11, name: '水域', status: 'upcoming' },
      { id: 12, name: '柳湾', status: 'upcoming' }
    ],
    stations2: [
      { id: 1, name: '太钢总医院', status: 'passed' },
      { id: 2, name: '钟楼街', status: 'passed' },
      { id: 3, name: '迎泽公园（山大一院）', status: 'current' },
      { id: 4, name: '长治路亲贤街口', status: 'next' },
      { id: 5, name: '长风街亲贤街方向', status: 'upcoming' },
      { id: 6, name: '白求恩医院', status: 'upcoming' },
      { id: 7, name: '罗城高速口', status: 'upcoming' },
      { id: 8, name: '汾孝站', status: 'upcoming' },
      { id: 9, name: '孝义市内（就近下车）', status: 'upcoming' },
      { id: 10, name: '高阳', status: 'upcoming' },
      { id: 11, name: '水域', status: 'upcoming' },
      { id: 12, name: '柳湾', status: 'upcoming' }
    ],
    car_type:""
  },
  onLoad(options) {
    let _this = this;
    console.log(options)
    if(options.startCity == "太原市") {
      _this.setData({
        car_type:options.car_type
      })
    } else {
      console.log('else',[..._this.data.stations2].reverse())
      _this.setData({
        stations:[..._this.data.stations].reverse(),
        stations2:[..._this.data.stations2].reverse()
      })
      _this.setData({
        car_type:options.car_type
      })
    }
    
  },
})
