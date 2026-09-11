import http from '../../utils/http';
const util = require('../../utils/util.js');

const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const app = getApp();
Page({
  data: {
    title: "乐遍家小程序已新版为新版本，系统还在优化升级中，会员使用过程中如有任何意见建议可在投诉建议提供您的宝贵留言~",
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    size: 28,
    marqueeWidth: 660,
    marqueeMargin: 40,
    type: "pc",
    imgUrl: "",
    autoplay: false,
    interval: 2000,
    duration: 500,
    ischeck: false,
    car_type: 0,
    startTime: "",
    endTime: "",
    startDate: '', //出行日期
    startingCity: '', //出发城市
    endingCity: '', //到达城市
    addArr: [], //路线列表
    endDate: '', // 结束日期，默认为今天之后三天
    isFlipped: false,
    orderWarning: '',
    mainDate: '', // 例如 "07-16"
    weekDay: '', // 例如 "周四"
    relativeDay: '', // 例如 "后天"，如果是大后天则不显示
    busDay:util.getToday(),
    busList:[],
    busLineId:''
  },

  onLoad: async function (opt) {
    console.log(opt)
    if (opt.date) {
      console.log(opt.date)
      this.setData({
        car_type: 3
      })
      this.setDateInfo(opt.date);
    } else {
      this.setDateInfo();
    }
    console.log('onLoad')
    let that = this;
    if (wx.getStorageSync('storageSync')) {
      let storageSync = wx.getStorageSync('storageSync');
      if (storageSync.startingCity) {
        that.setData({
          startingCity: storageSync.startingCity
        })
      }
      if (storageSync.endingCity) {
        that.setData({
          endingCity: storageSync.endingCity
        })
      }
    }
    // 设置起始日期为今天
    let today = new Date().toISOString().split('T')[0]; // 获取今天的日期（格式：YYYY-MM-DD）
    this.setData({
      startDate: today,
      date: today, // 初始选择也为今天
      startTime: today
    });

    // 设置结束日期为今天之后三天
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 增加三天
    let endDateString = endDate.toISOString().split('T')[0]; // 获取格式化后的日期字符串
    this.setData({
      endTime: endDateString
    });
    if (opt) {
      if (opt.typeon == 'pc') {
        this.setData({
          car_type: 0,
          type: 'pc'
        })
      } else if (opt.typeon == 'bc') {
        this.setData({
          car_type: 1,
          type: 'bc'
        })
      } else if (opt.typeon == 'sh') {
        this.setData({
          car_type: 2,
          type: 'sh'
        })
      } else if (opt.typeon == 'cj') {
        this.setData({
          car_type: 3,
          type: 'cj'
        })
      }
    }
    let _this = this;
    _this.getLineList(); //获取路线列表
    await _this.getLunBo();

  },
  setDateInfo(data) {
    let _this = this;
    let year = ''
    let month = ''
    let day = ''
    let now = ''
    if (data) {
      console.log(data)
      _this.setData({
        busDay:data
      })
      now = data.split('-')
      year = now[0]
      console.log(year)
      month = now[1]
      console.log(month)
      day = now[2]
      console.log(day)
    } else {
     
      now = new Date();
      year = now.getFullYear();
      console.log(year)
      month = now.getMonth() + 1;
      console.log(month)
      day = now.getDate();
      console.log(year + '-' + month + '-' +day)
    }

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 格式化月日，补零
    const formatMonth = month < 10 ? '0' + month : month;
    const formatDay = day < 10 ? '0' + day : day;

    // 计算相对天数 (这里模拟获取后天的数据，实际开发中可能是传入的日期字符串)
    // 假设我们要显示的是 "后天" 的数据：
    const targetDate = new Date(year, month - 1, day);

    // 1. 设置主日期
    const tMonth = targetDate.getMonth() + 1;
    const tDay = targetDate.getDate();
    this.setData({
      mainDate: `${tMonth < 10 ? '0'+tMonth : tMonth}-${tDay < 10 ? '0'+tDay : tDay}`
    });

    // 2. 设置星期
    const weekIndex = targetDate.getDay();
    this.setData({
      weekDay: weekDays[weekIndex]
    });

    // 3. 计算并设置相对时间 (今天/明天/后天)
    // 简单算法：比较目标日期和当前日期的天数差
    const newNow = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((targetDate.getTime() - newNow.getTime()) / oneDay);
    let relativeText = '';
    if (diffDays === 0) relativeText = '今天';
    else if (diffDays === 1) relativeText = '明天';
    else if (diffDays === 2) relativeText = '后天';
    // 如果超过后天，通常就不显示这个文字了，或者显示具体日期
    console.log(relativeText)
    this.setData({
      relativeDay: relativeText
    });
  },
  // 是否有未完成订单
  reqHasOrder() {
    let _this = this;
    var userinfo = wx.getStorageSync('userInfo');
    http.postRequest("/Api/DispatchMobile/getRideTicketOrderHome?userId=" + userinfo.Id, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        if (res.data.Id) {
          this.setData({
            orderWarning: '您当前有未完成订单：' + res.data.PassengerLineId_Name,
          })
        }
      }
    }, err => {})
  },
  goOrder() {
    wx.navigateTo({
      url: '/user_center/pages/travelList/travelList',
    })
  },
  handleFlip: function () {
    let that = this;
    that.setData({
      isFlipped: !this.data.isFlipped
    })
    let storedData = wx.getStorageSync('storageSync') || {};
    if (Object.keys(storedData).length != 0) {
      let request = {
        EndLocation_Latitude: storedData.StatingLocation_Latitude,
        EndLocation_Longitude: storedData.StatingLocation_Longitude,
        StatingLocation_Latitude: storedData.EndLocation_Latitude,
        StatingLocation_Longitude: storedData.EndLocation_Longitude,
        endingCity: storedData.startingCity,
        startingCity: storedData.endingCity,
        startDate: storedData.startDate
      }
      wx.setStorageSync('storageSync', request);


      that.setData({
        startingCity: storedData.endingCity,
        endingCity: storedData.startingCity
      })
    }

  },
  onShow() {
    console.log('onShow')
    var _this = this;
    // pcTypeId 车型Id  拼车会默认添加车型  包车需要手动选择车型  所以在每次返回城际页面需要清除一次车型Id 以免评车的默认车型进入到包车界面
    wx.removeStorageSync('pcTypeId')
    wx.removeStorageSync('lineId')
    wx.removeStorageSync('starInfo2')
    wx.removeStorageSync('endInfo2')
    if (wx.getStorageSync('openid')) {
      _this.reqHasOrder();
    }
    _this.getNews();
    var length = _this.data.title.length * _this.data.size; //计算文字的长度
    _this.setData({
      length: length,
      // 当文字长度小于屏幕长度时，需要增加补白
      marqueeMargin: length < _this.data.marqueeWidth ? (_this.data.marqueeWidth - length) / 4 : _this.data.marqueeMargin
    })
    if (_this.data.length > _this.data.marqueeWidth) {
      _this.run1();
    }
    let storedData = wx.getStorageSync('storageSync') || {};
    let updatedData = {
      ...storedData,
      startDate: this.data.startDate
    };
    wx.setStorageSync('storageSync', updatedData);
    //获取大巴线路
    _this.getBusLine()
  },
  //获取大巴线路
  getBusLine() {
    let _this = this;
    http.getRequest("/api/BusMobile/GetBusLineList", '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
       console.log(res.data)
       let data = res.data
       data.forEach(item => {
        const [start, end] = item.LineName.split('-');
        item.start = start;
        item.end = end;
      });
      console.log(data)
        _this.setData({
          busList: data
        })
      }
    }, err => {})
  },
  //切换叫车类型
  car_type(e) {
    let that = this;
    let type = ''
    if (e.currentTarget.dataset.item == 0) {
      type = 'pc'
    } else if (e.currentTarget.dataset.item == 1) {
      type = 'bc'
    } else if (e.currentTarget.dataset.item == 2) {
      type = 'sh'
    } else if (e.currentTarget.dataset.item == 3) {
      type = 'cj'
    }
    this.setData({
      car_type: e.currentTarget.dataset.item,
      type: type,
    })
    //切换拼车、包车。。 清除出发、到达城市数据和缓存
    wx.removeStorageSync('storageSync');
    this.setData({
      startingCity: '',
      endingCity: '',
      startDate: ''
    })
  },
  //点击出发城市
  handleGo() {
    let that = this;
    if(that.data.car_type != 3) {
      wx.navigateTo({
        url: "/user_center/pages/chooseCity/chooseCity?typeon=" + that.data.type + "&direction=startingCity",
      })
    }
    
  },
  //点击目的地
  handleDestination() {
    let that = this;
    if(that.data.car_type != 3) {
      wx.navigateTo({
        url: "/user_center/pages/chooseCity/chooseCity?typeon=" + that.data.type + "&direction=endingCity",
      })
    }
    
  },
  //点击查询预定
  reserve() {
    let _this = this;
    let lineId = wx.getStorageSync('lineld') || '';
    var wxinfo = wx.getStorageSync("userInfo");
    console.log('wxinfo', wxinfo)
    if (!wxinfo) {
      wx.showToast({
        title: "请先登录",
        icon: "none",
        durantion: 1000,
        success: function () {
          wx.navigateTo({
            url: '/user_center/pages/login/login',
          })
        },
      });
      return
    }
    if (this.data.startingCity == '') {
      wx.showToast({
        title: '请选择出发城市',
        icon: "none"
      })
      return
    }
    if (this.data.endingCity == '') {
      wx.showToast({
        title: '请选择到达城市',
        icon: "none"
      })
      return
    }
    if (this.data.car_type == 0) {
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetLineIdByCityName',
        data: {
          startCity: this.data.startingCity,
          endCity: this.data.endingCity,
        },
        method: "GET",
        success: (res) => {
          if (res.data.code == 0) {
            wx.setStorageSync('lineId', res.data.data.Id)
            wx.navigateTo({
              url: '/user_center/pages/reserve/reserve?typeon=pc&startingCity=' + this.data.startingCity + "&endingCity=" + this.data.endingCity
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            })
          }
        }
      })

    } else if (this.data.car_type == 1) {
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetLineIdByCityName',
        data: {
          startCity: this.data.startingCity,
          endCity: this.data.endingCity,
        },
        method: "GET",
        success: (res) => {
          if (res.data.code == 0) {
            wx.setStorageSync('lineId', res.data.data.Id)
            wx.navigateTo({
              url: '/user_center/pages/baoche/baoche?typeon=bc&startingCity=' + this.data.startingCity + "&endingCity=" + this.data.endingCity + "&lineId=" + res.data.data.Id,
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            })
          }
        }
      })


    } else if (this.data.car_type == 2) {
      // GetGoodsLineIdByCityName
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetGoodsLineIdByCityName',
        data: {
          startCity: this.data.startingCity,
          endCity: this.data.endingCity,
        },
        method: "GET",
        success: (res) => {
          console.log(res)
          if (res.data.code == 0) {
            wx.setStorageSync('lineId', res.data.data.Id)
            wx.navigateTo({
              url: '/user_center/pages/shaohuo/shaohuo?typeon=sh&startingCity=' + this.data.startingCity + "&endingCity=" + this.data.endingCity + "&lineld=" + res.data.data.Id,
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            })
          }
        }
      })

    } else if (this.data.car_type == 3) {
      wx.navigateTo({
        url: '/user_center/pages/busList/busList?busDay=' + _this.data.busDay + '&LineId=' + _this.data.busLineId,
      })
      return
      const validCities = ["太原市", "孝义市"];
      if (
        !validCities.includes(this.data.startingCity) ||
        !validCities.includes(this.data.endingCity)
      ) {
        return;
      }
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetLineIdByCityName',
        data: {
          startCity: this.data.startingCity,
          endCity: this.data.endingCity,
        },
        method: "GET",
        success: (res) => {
          console.log(res)
          if (res.data.code == 0) {

            wx.navigateTo({
              url: '/user_center/pages/intercity/intercity?typeon=cj&startingCity=' + this.data.startingCity + "&endingCity=" + this.data.endingCity + "&lineld=" + res.data.data.Id,
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            })
          }
        }
      })

    }

  },
  //点击出行日期
  bindDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
    let storedData = wx.getStorageSync('storageSync') || {};
    let updatedData = {
      ...storedData,
      startDate: e.detail.value
    };
    wx.setStorageSync('storageSync', updatedData);
  },
  //点击热门路线
  bindHotRoute(e) {
    let res = this.data.addArr[e.currentTarget.dataset.index]
    let storedData = wx.getStorageSync('storageSync') || {};
    let request = {
      startingCity: res.StatingLocation_Name,
      endingCity: res.EndLocation_Name,
      EndLocation_Latitude: res.EndLocation_Latitude,
      EndLocation_Longitude: res.EndLocation_Longitude,
      StatingLocation_Latitude: res.StatingLocation_Latitude,
      StatingLocation_Longitude: res.StatingLocation_Longitude
    }
    let updatedData = {
      ...storedData,
      ...request
    };
    wx.setStorageSync('storageSync', updatedData);
    this.setData({
      startingCity: res.StatingLocation_Name,
      endingCity: res.EndLocation_Name,
      lineld: res.Id
    })
  },
  bindHotRoute2(e) {
    let res = e.currentTarget.dataset
    console.log(res)
    let storedData = wx.getStorageSync('storageSync') || {};
    let request = {
      startingCity: res.start,
      endingCity: res.end
    }
    let updatedData = {
      ...storedData,
      ...request
    };
    wx.setStorageSync('storageSync', updatedData);
    this.setData({
      busLineId:res.lineid,
      startingCity: res.start,
      endingCity: res.end
    })
  },
  //获取路线列表
  getLineList() {
    wx.showLoading({
      title: '',
    })
    let that = this;
    http.getRequest('/Api/DispatchMobile/getPassengerLine?page=1&limit=10&city=', '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        if (res.data.length > 0) {
          that.setData({
            addArr: res.data,
          });
        }
        wx.hideLoading()
      } else {
        wx.showToast({
          title: '数据请求失败，请稍后重试',
          icon: "none"
        })
        wx.hideLoading()
      }
    }, err => {
      wx.hideLoading()
      console.log(err)
    })
  },
  getLunBo() {
    http.getRequest("/Api/Mobile/getCompanyDetail?type=1&Id=300007-fa5b6d0d40594f02ad91425ef44141eb", '', '', res => {
      if (res.s) {
        if (res.data.configList) {
          this.setData({
            lunBoImg: res.data.configList,
            imgUrl: app.globalData.httpsUrl,
            autoplay: true,
            indicatorDots: false,
            interval: 3000,
            duration: 500
          })
        }
      }
    }, err => {
      console.log(err)
    })
  },
  run1: function () {
    var that = this;
    var mytime = setInterval(function () {
      if (-that.data.marqueeDistance < that.data.length) {
        that.setData({
          marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
        })
      } else {
        clearInterval(mytime);
        that.setData({
          marqueeDistance: that.data.marqueeWidth
        });
        that.run1();
      }
    }, 30)
  },

  getNews() {
    var data = {
      "FormTypeId": app.globalData.formIdType,
      "page": "1",
      "limit": "10",
    };
    http.postRequest("/Api/DispatchMobile/GetRideTicket", data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        var data = res.data;
        this.setData({
          title: data[0].MainContent
        })
      }
    }, err => {
      console.log(err)
    })
  },
  handleCalendar() {
    console.log('dianji')
    wx.navigateTo({
      url: '/user_center/pages/dateSelection/dateSelection',
    })
  },
  onUnload() {

  }
})