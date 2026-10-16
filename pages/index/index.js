const app = getApp();
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url



Page({
  data: {
    fromCity: '孝义市',
    toCity: '太原市',
    date: '',
    dateLabel: '',
    dateStart: '',
    dateEnd: '',
    historyRoutes: [],
    hotRoutes: [],
    selectedKey: '',
  },

  onLoad() {
    
    const today = new Date();
    const maxDate = new Date(today.getTime());
    maxDate.setDate(maxDate.getDate() + 3);
    this.setData({
      date: this.formatDate(today),
      dateLabel: this.formatLabel(today),
      dateStart: this.formatDate(today),
      dateEnd: this.formatDate(maxDate),
  
    });
    // 读取缓存的城市选择
    const saved = wx.getStorageSync('chengjiCity');
    if (saved) {
      const fromCity = saved.fromCity || this.data.fromCity;
      const toCity = saved.toCity || this.data.toCity;
      this.setData({
        fromCity,
        toCity,
      });
    }
    this.getLineList()
  },
//获取路线列表
getLineList() {
  wx.showLoading({
    title: '',
  })
  let _this = this;
  
  wx.request({
    url: baseUrl + '/api/BusMobile/GetHotLineCityList',
    data: {},
    method: "GET",
    success: (res) => {
      
      if (res.data.code == 0) {
       console.log(res)
        _this.setData({
          hotRoutes:res.data.data
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: "none"
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
              selectedKey: '',
            });
          } else {
            this.setData({
              toCity: data.cityName,
              selectedKey: '',
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
      selectedKey: '',
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
    const ds = e.currentTarget.dataset;
    const route = ds.route;
    this.setData({
      fromCity: route.StatingLocation_Name,
      toCity: route.EndLocation_Name,
      selectedKey: ds.group + '-' + ds.index,
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
    // 出发地与目的地相同不允许查询
    if (this.data.fromCity === this.data.toCity) {
      wx.showToast({
        title: '出发地和目的地不能相同',
        icon: 'none',
      });
      return;
    }
    const query = [
      'from=' + encodeURIComponent(this.data.fromCity),
      'to=' + encodeURIComponent(this.data.toCity),
      'date=' + this.data.date,
    ].join('&');
    wx.navigateTo({
      url: '/pages/ride/ride?' + query,
    });
  },
});
