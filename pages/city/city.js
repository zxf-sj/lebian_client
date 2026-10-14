// pages/city/city.js
const CITIES = [
  '太原市', '离市区', '榆次大学城',
  '孝义市', '汾阳市', '文水县',
  '交城县', '兴县', '临县',
  '柳林县', '石楼县', '岚县',
  '方山县', '中阳县', '交口县',
];

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
  },

  onPick(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({ selected: city });
    if (this.ec && typeof this.ec.emit === 'function') {
      this.ec.emit('citySelected', {
        cityName: city
      });
      // 留一点时间让选中态可见，再返回
    setTimeout(() => wx.navigateBack(), 200);
    } else {
      console.warn('无法发送数据：事件通道未建立');
    }
  },
});