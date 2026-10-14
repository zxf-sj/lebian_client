const app = getApp();

// 城市名短称：离市区→离石、孝义市→孝义、太原市→太原
function shortName(name) {
  if (!name) return '';
  if (name.length > 2 && name.endsWith('市区')) return name.slice(0, -2);
  if (name.length > 2 && name.endsWith('市')) return name.slice(0, -1);
  return name;
}

Page({
  data: {
    fromCity: '孝义市',
    toCity: '太原市',
    fromLabel: '孝义',
    toLabel: '太原',
    date: '',
    dateLabel: '',
    historyRoutes: [],
    hotRoutes: [],
  },

  onLoad() {
    const historyRoutes = [
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '太原市', to: '孝义市', price: 25 },
      { from: '离市区', to: '孝义市', price: 45 },
    ];
    const hotRoutes = [
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '孝义市', to: '太原市', price: 25 },
      { from: '孝义市', to: '太原市', price: 25 },
    ];
    const decorate = (list) => list.map((r) => ({
      ...r,
      shortFrom: shortName(r.from),
      shortTo: shortName(r.to),
    }));

    const today = new Date();
    this.setData({
      date: this.formatDate(today),
      dateLabel: this.formatLabel(today),
      historyRoutes: decorate(historyRoutes),
      hotRoutes: decorate(hotRoutes),
    });
    // 读取缓存的城市选择
    const saved = wx.getStorageSync('chengjiCity');
    if (saved) {
      const fromCity = saved.fromCity || this.data.fromCity;
      const toCity = saved.toCity || this.data.toCity;
      this.setData({
        fromCity,
        toCity,
        fromLabel: shortName(fromCity),
        toLabel: shortName(toCity),
      });
    }
  },

  formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatLabel(d) {
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${week[d.getDay()]}`;
  },

  onPickCity(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/city/city?from=${type}&current=${type === 'from' ? this.data.fromCity : this.data.toCity}`,
      events: {
        citySelected: (data) => {
          if (type === 'from') {
            this.setData({
              fromCity: data.cityName,
              fromLabel: shortName(data.cityName),
            });
          } else {
            this.setData({
              toCity: data.cityName,
              toLabel: shortName(data.cityName),
            });
          }
          this.saveCity();
        },
      },
    });
  },

  onSwap() {
    this.setData({
      fromCity: this.data.toCity,
      toCity: this.data.fromCity,
      fromLabel: this.data.toLabel,
      toLabel: this.data.fromLabel,
    });
    this.saveCity();
  },

  onDateChange(e) {
    const d = new Date(e.detail.value);
    this.setData({
      date: e.detail.value,
      dateLabel: this.formatLabel(d),
    });
  },

  onChipTap(e) {
    const route = e.currentTarget.dataset.route;
    this.setData({
      fromCity: route.from,
      toCity: route.to,
      fromLabel: route.shortFrom,
      toLabel: route.shortTo,
    });
    this.saveCity();
  },

  saveCity() {
    wx.setStorageSync('chengjiCity', {
      fromCity: this.data.fromCity,
      toCity: this.data.toCity,
    });
  },

  onSearch() {
    const query = [
      'from=' + encodeURIComponent(this.data.fromLabel),
      'to=' + encodeURIComponent(this.data.toLabel),
      'date=' + this.data.date,
    ].join('&');
    wx.navigateTo({
      url: '/pages/ride/ride?' + query,
    });
  },
});
