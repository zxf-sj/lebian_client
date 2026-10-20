// pages/city/city.js
const CITIES = [
  '太原市', '离市区', '榆次大学城',
  '孝义市', '汾阳市', '文水县',
  '交城县', '兴县', '临县',
  '柳林县', '石楼县', '岚县',
  '方山县', '中阳县', '交口县',
];
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({
  data: {
    cities: CITIES,
    selected: '',
  },

  onLoad(query) {
    // 来源：from / to，以及上一页已选中的城市名
    this.from = query.from || 'from';
    this.setData({ selected: query.current || '' });
    this.ec = this.getOpenerEventChannel();
    this.getCity()
  },
//获取路线列表
getCity() {
  wx.showLoading({
    title: '',
  })
  let _this = this;
  
  wx.request({
    url: baseUrl + '/api/BusMobile/GetLineCityList',
    data: {},
    method: "GET",
    success: (res) => {
        console.log(res)
      if (res.data.code == 0) {
        _this.setData({
          cities:res.data.data
        })
      }
    },
    fail(err) {
      console.error('网络异常:', err)
    },complete() {
      wx.hideLoading()
    }
  })
},
  onPick(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({ selected: item.LineName });
    if (this.ec && typeof this.ec.emit === 'function') {
      this.ec.emit('citySelected', {
        cityName: item.LineName,
        cityId:item.Id
      });
      // 留一点时间让选中态可见，再返回
    setTimeout(() => wx.navigateBack(), 200);
    } else {
      console.warn('无法发送数据：事件通道未建立');
    }
  },
});