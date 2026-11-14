const app = getApp();
const BASE_URL = require("../../utils/BASE_URL");
const orderStorage = require("../../utils/orderStorage.js");
var baseUrl = BASE_URL.BASE_URL //配置基础url



Page({
  data: {
    fromCity: '孝义',
    fromCityId: 2,
    toCity: '太原',
    toCityId: 1,
    date: '',
    dateLabel: '',
    dateStart: '',
    dateEnd: '',
    historyRoutes: [],
    hotRoutes: [],
    selectedKey: '',
  },

  // 回到首页 = 本轮下单流程结束（不管下没下单）：清掉下单草稿，登录态与城市偏好保留。
  // 下单成功的清理由各下单页在支付成功回调里做，这里兜底「中途返回不下单」的场景。
  onShow() {
    orderStorage.clearOrderDraft();
    // this.saveCity()
    // 从城市选择页返回时，以 onPickCity 的回传值为准，不用缓存覆盖
    if (this._fromCityPicker) {
      this._fromCityPicker = false;
      return;
    }
    let city_record = wx.getStorageSync('city_record')
    if (!city_record || !city_record.fromCity) return;
    this.setData({
      fromCity: city_record.fromCity,
      fromCityId: city_record.fromCityId,
      toCity: city_record.toCity,
      toCityId: city_record.toCityId,
    })
  },

  onLoad() {
    const accountInfo = wx.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;
    wx.setStorageSync('appId', appId)
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
            hotRoutes: res.data.data
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
      },
      complete() {
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
    console.log(type)
    // 标记本次是从城市选择页返回，onShow 不再用缓存覆盖
    this._fromCityPicker = true;
    wx.navigateTo({
      url: `/pages/city/city?from=${type}&current=${type === 'from' ? this.data.fromCity : this.data.toCity}`,
      events: {
        citySelected: (data) => {
          console.log(data)
          if (type === 'from') {
            this.setData({
              fromCity: data.cityName,
              fromCityId: data.cityId,
              selectedKey: '',
            });
          } else {
            this.setData({
              toCity: data.cityName,
              toCityId: data.cityId,
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
      fromCityId:this.data.toCityId,
      toCity: this.data.fromCity,
      toCityId:this.data.fromCityId,
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
      fromCity: route.startName,
      fromCityId: route.startId,
      toCity: route.endName,
      toCityId: route.endId,
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
    console.log(this.data.fromCity)
    console.log(this.data.toCity)
    if (this.data.fromCity === this.data.toCity) {
      wx.showToast({
        title: '出发地和目的地不能相同',
        icon: 'none',
      });
      return;
    }
    const query = [
      'from=' + encodeURIComponent(this.data.fromCity),
      'fromId=' + this.data.fromCityId,
      'to=' + encodeURIComponent(this.data.toCity),
      'toId=' + this.data.toCityId,
      'date=' + this.data.date,
    ].join('&');
    let city_record = {
      fromCity: this.data.fromCity,
    fromCityId: this.data.fromCityId,
    toCity: this.data.toCity,
    toCityId: this.data.toCityId,
    }
    wx.setStorageSync('city_record', city_record)
    wx.navigateTo({
      url: '/pages/ride/ride?' + query,
    });
  },

  // 返程预约入口（同旧版首页 index.js 的 fancheng）
  fancheng() {
    wx.navigateTo({
      url: '/pages/fancheng/fancheng'
    })
  },
});