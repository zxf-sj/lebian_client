import http from '../../utils/http';
import dateTimePicker from '../../utils/datepicker.js';
let d30 = new Date().getTime() + 1800000;
let date = new Date(d30);
let weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
let currentHours = date.getHours();
let currentMinute = date.getMinutes();
let toUserTimer = null;
import qqmapsdk from '../../libs/qqMap';
let SCREEN_WIDTH = 750;
let RATE = wx.getWindowInfo().screenHeight / wx.getWindowInfo().screenWidth;
const app = getApp();
Page({
  data: {
    //fromScan: false,
    ScreenTotalW: SCREEN_WIDTH,
    ScreenTotalH: SCREEN_WIDTH * RATE - 440, //地图高度自适应 508 = 导航 + footer
    //navScrollLeft: 0,
    currentTab: 0,
    //isLoading: true,
    color: "#cccccc",
    destination: '',
    startAddress: '',
    longitude: null,
    latitude: null,
    endLongitude: null,
    endLatitude: null,
    scale: 16,
    markers: [],
    canChooseStatus: false,
    changeTab: 1,
    showCoupon: false,
    isDriverFriends: false,
    fromFriendUseCart: false,
    onlyNowTime: true,
    //onlyAppointmentTime: false,
    //canAppointment: false,
    startDate: "点击选择预约时间",
    multiArray: [
      ['今天', '明天', '后天'],
      ['07','08','09','10','11','12','13','14','15','16','17','18'],
      ['00','15','30','45']
    ],
    multiIndex: [0, 0, 0],
    showNotice: false,
    noticeCont: null,
    driverImg: '/assets/images/driver.png',
    //reqRecoverOrder: 0,
    // 远程
    fixedLine: false,
    loading: false,
    noMore: false,
    lineCurrentPage: 1,
    hideCityNoService: true,
    currentBusinessType: 1,
    avatar:"/assets/images/touxiang.png",
    estimate_in_time: '',
    dateTime: null,
    dateTimeArray: null,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 10,
    startCity:"",
    endCity:"",
  },
  onLoad: async function (opt) {
    let that = this;
    // var liji = opt.liji;
    // if(liji==1){
    //   that.setData({
    //     changeTab:1
    //   })
    // }else{
    //   wx.setStorageSync('isyue', true);
    //   that.setData({
    //     changeTab:2
    //   })
    // }
    var obj  = dateTimePicker.dateTimePicker(that.data.startYear, that.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(that.data.startYear, that.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    that.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray
    });
    await that.getSystemInfo();
    await that.getCurrentLocation();
    if (that.data.currentTab == 0 && !that.data.fromFriendUseCart) {
      app.globalData.nowOrFutureId = null;
      app.globalData.friendDriver = null;
      app.globalData.friendStartDate = null;
    }
    if (app.globalData.nowOrFutureId === null) {
      wx.removeStorageSync('startDate')
    }
    that.getNotice();
    that.getFormTypeId();
  },
  onShow() {
    var _this = this;
    wx.removeStorageSync('siteStr');
    _this.getUserLocation()
    var add = ''
    if (app.globalData.strAddress) {
      add = app.globalData.strAddress
    } else {
      add = app.globalData.originAddress
    }
    _this.setData({
      startAddress: add,
      currentCity: app.globalData.lineStartCity,
      EXC_city: app.globalData.exclusiveCarStartCity,
      endCity:wx.getStorageSync('endCity'),
      lineCurrentPage: 1,
      usedLineList: null,
      allLineList: null,
    })
    wx.checkSession({
      success: () => {
        if (!_this.data.notLogin) {
          if (app.globalData.reqNotice && wx.getStorageSync('token') && !wx.getStorageSync('needLogin')) {
            _this.getNotice();
          }
        }
      }
    })
    var openid = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userInfo');
    if(openid){
      _this.setData({
        avatar:userinfo.HeadIcon?'https://www.qierchuxing.com'+userinfo.HeadIcon:"/assets/images/touxiang.png"
      })
    }
  },
  getFormTypeId(){
    var code = app.globalData.companyCode;
    http.getRequest("/Api/DispatchMobile/CompanyConfig?Code="+code,'', wx.getStorageSync('header'), res => {
      if(res.code==0){
        this.setData({
          FormTypeId:res.data[0].ConfigContent
        })
        wx.setStorageSync('FormTypeId', res.data[0].ConfigContent);
      }
    }, err => {
      console.log(err)
    })
  },
  // changeDateTime(e) {
  //   this.setData({
  //     dateTime: e.detail.value
  //   });
  //   var arr = this.data.dateTime,
  //   dateArr = this.data.dateTimeArray;
  //   dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
  //   var year = dateArr[0][arr[0]];
  //   var newyear = year.replace('年',"");
  //   var yue = dateArr[1][arr[1]];
  //   var newyue = yue.replace('月',"");
  //   var ri = dateArr[2][arr[2]];
  //   var newri = ri.replace('日',"");
  //   var shi =dateArr[3][arr[3]];
  //   var newshi = shi.replace('时',"");
  //   var fen = dateArr[4][arr[4]]
  //   var newfen = fen.replace('分',"");
  //   var estimate_in_time = newyear+'-'+newyue+'-'+newri+' '+newshi+':'+newfen;
  //   var nowtime = new Date();
  //   var timestp = nowtime.getTime();
  //   var checktime = new Date(estimate_in_time.replace(/-/g, '/')).getTime();
  //   if(checktime>timestp){
  //     this.setData({
  //       dateTimeArray: dateArr,
  //       dateTime: arr,
  //       estimate_in_time,
  //     });
  //     wx.setStorageSync('startDate', estimate_in_time);
  //   }else{
  //     wx.showToast({
  //       title: '您选择的预约时间不正确，请重新选择',
  //       icon:'none',
  //       duration:2000
  //     })
  //   }
  // },
  // run1: function () {
  //   var that = this;
  //   var mytime = setInterval(function () {
  //     if (-that.data.marqueeDistance < that.data.length) {
  //       that.setData({
  //         marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
  //       })
  //     } else {
  //       clearInterval(mytime);
  //       that.setData({
  //         marqueeDistance: that.data.marqueeWidth       
  //       });
  //       that.run1();
  //     }
  //   },30)
  // },
  onReady: function () {
    this.mapCtx = wx.createMapContext("indexMap"); // 地图组件的id
  },
  onHide() {
    app.globalData.strAddress = this.data.startAddress;
    app.globalData.strLatitude = this.data.latitude;
    app.globalData.strLongitude = this.data.longitude;
    //app.globalData.clientDriving = null;
    //curPageOnShow = false;
  },

  onUnload(){
    //curPageOnShow = false;
    // if(client) client.end();
    // if (app.globalData.clientDriving) {
    //   app.globalData.clientDriving.unsubscribe(app.globalData.pubTopic, (err) => {
    //     if (!err) {
    //       console.log('退订成功')
    //     } else console.log('请先连接服务器')
    //   })
    // }
    // app.globalData.clientDriving = null;
  },

  // 转发
  onShareAppMessage(e) {
    return {
      title: '乐遍出行',
      imageUrl: "/assets/images/banner.jpg",
      path: "/pages/index/index",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  //获取地理位置
  getUserLocation() {
    let _self = this
    //重新选择起点 需要重新定位
    if (app.globalData.strAddress) {
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: app.globalData.strLatitude,
          longitude: app.globalData.strLongitude,
        },
        success(addressRes) {
          let res = addressRes.result;
          app.globalData.strLatitude = res.location.lat;
          app.globalData.strLongitude = res.location.lng;
          app.globalData.strAddress = res.formatted_addresses.recommend;
          app.globalData.startCity = res.address_component.city;
          app.globalData.startCityAdcode = res.ad_info.adcode;
          app.globalData.lineStartCity = res.address_component.city;
          if (!app.globalData.exclusiveCarStartCity) {
            app.globalData.exclusiveCarStartCity = res.address_component.city;
            app.globalData.exclusiveCarCityCode = res.ad_info.city_code.substr(3);
          }

          if (_self.data.currentTab == 1 && app.globalData.lineCityCode == res.ad_info.city_code.substr(3)) {
            _self.remoteLineList(false)
          }
          app.globalData.lineCityCode = res.ad_info.city_code.substr(3);
          wx.setStorageSync('areaCodeIndex', res.ad_info.adcode);
          wx.setStorageSync('locationCity', res.address_component.city);
          _self.setData({
            latitude: res.location.lat,
            longitude: res.location.lng,
            startAddress: res.formatted_addresses.recommend,
            scale: 16,
            startCity:res.address_component.city
          })
          if(_self.data.currentTab == 0 || _self.data.currentTab == 3){
            _self.checkCityStatus(_self.data.currentBusinessType);
          }
          _self.navNumReq(app.globalData.startCityAdcode);
            
        },
        fail() {
          _self.setData({})
          console.log("获取位置失败");
        }
      })
    } else {
      this.getCurrentLocation()
    }
  },

  getCurrentLocation() {
    let _self = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          let _latitude = res.latitude
          let _longitude = res.longitude
          _self.setData({
            latitude: _latitude,
            longitude: _longitude,
          })
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: _latitude,
              longitude: _longitude
            },
            success(addressRes) {
              let obj = addressRes.result.address_component
              app.globalData.originCity = obj.city; //市
              app.globalData.originAddress = addressRes.result.formatted_addresses.recommend;
              app.globalData.originLongitude = _longitude;
              app.globalData.originLatitude = _latitude;
              app.globalData.strLongitude = _longitude;
              app.globalData.strLatitude = _latitude;
              app.globalData.startCity = obj.city;
              app.globalData.startCityAdcode = addressRes.result.ad_info.adcode;
              app.globalData.lineStartCity = obj.city;
              if (!app.globalData.exclusiveCarStartCity) {
                app.globalData.exclusiveCarStartCity = obj.city;
                app.globalData.exclusiveCarCityCode = addressRes.result.ad_info.city_code.substr(3);
              }
              if (_self.data.currentTab == 1 && app.globalData.lineCityCode == addressRes.result.ad_info.city_code.substr(3)) {
                _self.remoteLineList(false)
              }
              app.globalData.lineCityCode = addressRes.result.ad_info.city_code.substr(3);
              wx.setStorageSync('areaCodeIndex', addressRes.result.ad_info.adcode)
              wx.setStorageSync('locationCity', addressRes.result.address_component.city);
              //if (wx.getStorageSync('token') && !wx.getStorageSync('needLogin')) _self.reqFriendsList()
              _self.setData({
                latitude: addressRes.result.location.lat,
                longitude: addressRes.result.location.lng,
                startAddress: addressRes.result.formatted_addresses.recommend,
                currentCity: app.globalData.lineStartCity,
                EXC_city: app.globalData.exclusiveCarStartCity,
                startCity:addressRes.result.address_component.city
              })
              if(_self.data.currentTab == 0 || _self.data.currentTab == 3){
                _self.checkCityStatus(_self.data.currentBusinessType);
              }
              _self.navNumReq(app.globalData.startCityAdcode);
              resolve();
            },
            fail(res) {
              console.log("获取位置失败",res);
              //reject()
            }
          })
        },
        fail() {
          wx.getSetting({
            success(res) {
              if (!res.authSetting["scope.userLocation"]) { //用户未授权获取地理位置
                wx.showModal({
                  title: '提醒',
                  content: '您拒绝了位置授权，将无法使用大部分功能，点击确定重新获取授权',
                  success(res) {
                    //如果点击确定
                    if (res.confirm) {
                      wx.openSetting({ //打开设置页
                        success(res) { //成功，返回页面回调
                          //如果同意了位置授权则userLocation=true
                          if (res.authSetting["scope.userLocation"]) { //授权中如果有位置授权则执行逻辑
                            _self.getUserLocation()
                          }
                        }
                      })
                    }
                  }
                })
              } else { //用户手机未打开定位
                wx.showModal({
                  title: '',
                  content: '请在系统定位中打开位置服务',
                })
              }
            }
          })
        }
      })
    })
  },

  //改变地图中心位置
  bindregionchange: function (e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      if (app.globalData.strLongitude && app.globalData.strLatitude) {
        this.getCurLocationChange()
      }
    }
  },

  getCurLocationChange() {
    let _this = this;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: function (res) {
            let adRes = res.result;
            app.globalData.strLongitude = adRes.location.lng;
            app.globalData.strLatitude = adRes.location.lat;
            app.globalData.strAddress = adRes.formatted_addresses.recommend;
            app.globalData.startCity = adRes.address_component.city;
            app.globalData.startCityAdcode = adRes.ad_info.adcode;

            if(_this.data.currentTab == 0 || _this.data.currentTab == 3) {
                _this.checkCityStatus(_this.data.currentBusinessType);
              }
            _this.setData({
              latitude: adRes.location.lat,
              longitude: adRes.location.lng,
              startAddress: adRes.formatted_addresses.recommend,
            })
          },
        });
      }
    })
  },

  //重回当前位置
  getMyLocation() {
    var _self = this
    wx.getLocation({
      type: "gcj02",
      success(res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: function (res1) {
            let adRes = res1.result;
            app.globalData.strLongitude = adRes.location.lng;
            app.globalData.strLatitude = adRes.location.lat;
            app.globalData.strAddress = adRes.formatted_addresses.recommend;
            app.globalData.startCity = adRes.address_component.city;
            app.globalData.startCityAdcode = adRes.ad_info.adcode;
            _self.setData({
              latitude: adRes.location.lat,
              longitude: adRes.location.lng,
              startAddress: adRes.formatted_addresses.recommend
            })
            if(_self.data.currentTab == 0 || _self.data.currentTab == 3){
              _self.checkCityStatus(_self.data.currentBusinessType);
            }
          },
        });
      },
      fail(err) {
        console.log(err);
      }
    })
  },

  //现在打车/预约打车
  // footerTab(e) {
  //   this.setData({
  //     changeTab: e.currentTarget.dataset.current
  //   })
  //   app.globalData.nowOrFutureId = this.data.changeTab;
  //   if (e.currentTarget.dataset.current == 1) {
  //     wx.removeStorageSync('startDate');
  //     this.setData({
  //       onlyNowTime: true
  //     })
  //   } else {
  //     wx.setStorageSync('startDate', this.data.startDate)
  //     this.dateReq();
  //     this.setData({
  //       onlyNowTime: false
  //     })
  //   }
  // },


  showUser() {
    var openid = wx.getStorageSync('openid');
    if (openid) {
      wx.navigateTo({
        url: "/user_center/pages/personalCenter/personalCenter",
      })
    } else {
      wx.navigateTo({
        url: "/user_center/pages/login/login",
      })
    }
  },

  //关闭优惠券弹窗
  closeCoupon() {
    this.setData({
      showCoupon: false
    })
  },
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
      success() {
        console.log('拨打成功')
      }
    })
  },

  // 时间限制请求
  dateReq() {
    let data = {"appointmentTime":1,"appointmentDay":3,"ridingTimeStart":"00:00:00","ridingTimeEnd":"23:59:59"}
    this.setData({
      dateReqInfo:data
    })
  },

  // 预约日期
  pickerTap: function () {
    this.dateReq();
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    let day1 = (date.getMonth() + 1) + "月" + date.getDate() + "日" + ' ' + '今天';
    let day2 = (new Date(date.getTime() + 24 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 24 * 3600000).getDate() + "日" + ' ' + '明天';
    let day3 = (new Date(date.getTime() + 48 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 48 * 3600000).getDate() + "日" + ' ' + '后天';
    var monthDay = [day1, day2, day3];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    // 月-日
    let maxDate = this.data.dateReqInfo.appointmentDay;
    if (maxDate >= 4) {
      for (var i = 3; i <= maxDate - 1; i++) {
        var date1 = new Date(date);
        date1.setDate(date.getDate() + i);
        var md = (date1.getMonth() + 1) + "月" + date1.getDate() + "日" + " " + weekday[date1.getDay()];
        monthDay.push(md);
      }
    } else if (maxDate == 2) {
      monthDay = ['今天', '明天'];
    } else if (maxDate == 1) {
      monthDay = ['今天'];
    }

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };

    if (data.multiIndex[0] === 0) {
      if (data.multiIndex[1] === 0) {
        this.loadData(hours, minute);
      } else {
        this.loadMinute(hours, minute);
      }
    } else {
      this.loadHoursMinute(hours, minute);
    }
    hours = hours.map(val => {
      return val + '点'
    })

    minute = minute.map(val => {
      return val + '分'
    })
    data.multiArray[0] = monthDay;
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;

    this.setData(data);
  },
  bindMultiPickerColumnChange: function (e) {
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    var that = this;
    var monthDay = ['今天', '明天', '后天'];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    // 把选择的对应值赋值给 multiIndex
    data.multiIndex[e.detail.column] = e.detail.value;
    // 然后再判断当前改变的是哪一列,如果是第1列改变
    if (e.detail.column === 0) {
      // 如果第一列滚动到第一行
      if (e.detail.value === 0) {

        that.loadData(hours, minute);

      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[1] = 0;
      data.multiIndex[2] = 0;
      // 如果是第2列改变
    } else if (e.detail.column === 1) {
      // 如果第一列为今天
      if (data.multiIndex[0] === 0) {
        if (e.detail.value === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
        // 第一列不为今天
      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[2] = 0;
      // 如果是第3列改变
    } else {
      // 如果第一列为'今天'
      if (data.multiIndex[0] === 0) {
        // 如果第一列为 '今天'并且第二列为当前时间
        if (data.multiIndex[1] === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
      } else {
        that.loadHoursMinute(hours, minute);
      }
    }
    hours = hours.map(val => {
      return val + ' 点'
    })
    minute = minute.map(val => {
      return val + ' 分'
    })
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },

  loadData: function (hours, minute) {
    var minuteIndex;
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = 0; i < 60; i += 10) {
        minute.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = minuteIndex; i < 60; i += 10) {
        minute.push(i);
      }
    }
  },

  loadHoursMinute: function (hours, minute) {
    let start = this.data.dateReqInfo.ridingTimeStart.split(':');
    let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
    // 时
    for (var i = parseInt(start[0]); i <= parseInt(end[0]); i++) {
      hours.push(i);
    }
    // 分
    for (var i = parseInt(start[1]); i <= parseInt(end[1]); i += 10) {
      minute.push(i);
    }
  },

  loadMinute: function (hours, minute) {
    var minuteIndex;
    let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i <= parseInt(end[0]); i++) {
        hours.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i <= parseInt(end[0]); i++) {
        hours.push(i);
      }
    }
    // 分
    for (var i = 0; i <= parseInt(end[1]); i += 10) {
      minute.push(i);
    }
  },

  bindStartMultiPickerChange: function (e) {
    var that = this;
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    var monthDay = that.data.multiArray[0][e.detail.value[0]];
    var hours = that.data.multiArray[1][e.detail.value[1]];
    var minute = that.data.multiArray[2][e.detail.value[2]];
    var globalMonthDay;

    if (monthDay.split(' ')[1] === "今天") {
      var month = date.getMonth() + 1;
      var day = date.getDate();
      monthDay = month + "月" + day + "日";
      globalMonthDay = date.getFullYear() + '-' + month + "-" + day
    } else if (monthDay.split(' ')[1] === "明天") {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + 1);
      monthDay = (date1.getMonth() + 1) + "月" + date1.getDate() + "日";
      globalMonthDay = date.getFullYear() + '-' + (date1.getMonth() + 1) + "-" + date1.getDate()

    } else if (monthDay.split(' ')[1] === "后天") {
      var date2 = new Date(date);
      date2.setDate(date.getDate() + 2);
      monthDay = (date2.getMonth() + 1) + "月" + date2.getDate() + "日";
      globalMonthDay = date.getFullYear() + '-' + (date2.getMonth() + 1) + "-" + date2.getDate()

    } else {
      var month = monthDay.split("月")[0]; // 返回月
      var day = monthDay.split("月")[1].split("日")[0]; // 返回日
      globalMonthDay = date.getFullYear() + '-' + month + "-" + day
    }
    console.log(globalMonthDay);
    let resHours = parseInt(hours) < 10 ? '0' + parseInt(hours) : parseInt(hours);
    let resMinute = parseInt(minute) < 10 ? '0' + parseInt(minute) : parseInt(minute);
    var startDate = monthDay + " " + resHours + ":" + resMinute;
    var startDate1 = globalMonthDay+" "+resHours+":"+resMinute;
    that.setData({
      startDate: startDate
    })
    wx.setStorageSync('startDate', startDate1)
    //app.globalData.friendStartDate = parseInt(new Date(globalStartDate).getTime(globalStartDate));
  },
  getNotice() {
    // http.getRequest("/v1/passenger/user/notice", {}, wx.getStorageSync('header'), res => {
    //   if (res.code === '1' && res.content.length > 0) {
    //     this.setData({
    //       showNotice: true,
    //       noticeCont: res.content
    //     })
    //     app.globalData.reqNotice = false;
    //   }
    // }, err => {
    //   console.log(err)
    // })
    let that = this;
    that.setData({
      showNotice:false,
      noticeCont:"太交专车上线啦！！！"
    })
    app.globalData.reqNotice = false;
  },
  closeNotice() {
    this.setData({
      showNotice: false,
    })
  },
  toOut(e) {
    let href = e.currentTarget.dataset.href;
    if (href) {
      wx.navigateTo({
        url: '../out/out?href=' + href,
      })
    }
  },
  toMsg() {
    wx.navigateTo({
      url: '/pages/notice/notice',
    })
  },
  closeCoupon() {
    this.setData({
      showCoupon: false
    })
  },
  couponCheck() {
    wx.navigateTo({
      url: '/user_center/pages/coupon/coupon',
    })
  },
  toStarting() {
    if (this.data.currentTab == 3) {
      wx.navigateTo({
        url: '/pages/starting/starting?from=taxi',
      })
    } else {
      wx.navigateTo({
        url: '/pages/starting/starting',
      })
    }

  },

  // 点击选择终点
  toDestination(e) {
    app.globalData.nowOrFutureId = this.data.changeTab;
    if (this.data.hideCityNoService) {
      if ((app.globalData.nowOrFutureId == 2 || app.globalData.nowOrFutureId === null) && this.data.fromFriendUseCart && app.globalData.friendStartDate == null) {
        wx.showModal({
          content: '请选择预约时间',
          showCancel: false
        })
      } else {
        if (e.currentTarget.dataset.from === 'scan') {
          wx.navigateTo({
            url: '/pages/destination/destination?from=scan',
          })
        } else {
          if (this.data.currentTab == 3) { // 出租车
            wx.navigateTo({
              url: '/pages/destination/destination?from=taxi&friendsDriverType=' + this.data.friendsDriverType,
            })
          } else if (this.data.currentTab == 4) { // 好友司机
            wx.redirectTo({
              url: '/pages/destination/destination?friendsDriverType=' + this.data.friendsDriverType,
            })
          } else {
            wx.navigateTo({
              url: '/pages/destination/destination?friendsDriverType=' + this.data.friendsDriverType,
            })
          }
          this.setData({
            friendsDriverType: null
          })
        }
      }
    }
  },
  toDestination1(e) {
    let that = this;
    var endCity = that.data.endCity;
    var userinfo = wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
    }else{
      if(userinfo.IdentityCard){
        if(endCity==''){
          wx.navigateTo({
            url: '/pages/destination/destination',
          })
        }else{
          wx.navigateTo({
            url: '/pages/ending/ending',
          })
        }
      }else{
        wx.showToast({
          title: '您还未实名认证，请先实名认证',
          icon:'none',
          duration:2000,
          success:function(){
            wx.navigateTo({
              url: '/user_center/pages/renzheng/renzheng',
            })
          }
        })
      }
    }
  },
  //到达底部
  scrollToLower: function (e) {
    if (!this.data.loading && !this.data.noMore) {
      if (this.data.fixedLine) { // 远程
        this.setData({
          loading: true,
          lineCurrentPage: this.data.lineCurrentPage + 1
        });
        this.remoteLineList(true);
      } else if (this.data.exclusiveCar) { // 包车
        this.setData({
          loading: true,
          EXC_currentPage: this.data.EXC_currentPage + 1
        });
        this.EXC_lineList(true);
      }
    }
  },

  // 远程站点列表
  // remoteLineList(isPage) {
  //   const _this = this;
  //   http.postRequest('/v2/passenger/remote/getBaseLineListByCityCode?cityCode=' + app.globalData.lineCityCode + '&pageSize=30&currentPage=' + this.data.lineCurrentPage, '', wx.getStorageSync('header'), res => {
  //     this.setData({
  //       loading: false,
  //       fixedLine: true
  //     })
  //     let historyLine = res.content.filter(item => item.type === 0);
  //     let allLine = res.content.filter(item => item.type === 1);
  //     if (isPage) {
  //       if (allLine.length === 0) {
  //         _this.setData({
  //           noMore: true
  //         })
  //       }
  //       _this.setData({
  //         allLineList: this.data.allLineList.concat(allLine),
  //         hasCityLine: true
  //       })
  //     } else {
  //       if (allLine.length === 0) {
  //         _this.setData({
  //           hasCityLine: false
  //         })
  //       } else {
  //         _this.setData({
  //           usedLineList: historyLine,
  //           allLineList: allLine,
  //           hasCityLine: true
  //         })
  //       }
  //     }
  //   }, err => {
  //     console.log(err)
  //   })
  // },

  // 远程选择城市
  // chooseLineCity() {
  //   wx.navigateTo({
  //     url: '/pages/searchCity/searchCity?urlFrom=3',
  //   })
  // },

  // 远程选择线路
  // chooseStation(e) {
  //   let item = e.currentTarget.dataset.item;
  //   console.log('远程站点选择：', item)
  //   if (item) {
  //     wx.navigateTo({
  //       url: '/pages/remoteLineCallCar/remoteLineCallCar?lineItem=' + JSON.stringify(item),
  //     })
  //   }
  // },

  // 包车选择城市
  chooseEXCCity() {
    wx.navigateTo({
      url: '/pages/searchCity/searchCity?urlFrom=4',
    })
  },

  // 包车列表
  // EXC_list(isPage) {
  //   let url = '/v2/passenger/charteredCar/getLineListByCityCode?cityCode=' + app.globalData.exclusiveCarCityCode + '&pageSize=20&currentPage=' + this.data.EXC_currentPage;
  //   http.postRequest(url, '', wx.getStorageSync('header'), res => {

  //     this.setData({
  //       loading: false,
  //       exclusiveCar: true
  //     })
  //     if (isPage) {
  //       if (res.content.length === 0) {
  //         this.setData({
  //           noMore: true
  //         })
  //       }
  //       this.setData({
  //         EXC_lineList: this.data.EXC_lineList.concat(res.content),
  //         hasCityLine: true
  //       })
  //     } else {
  //       if (res.content.length === 0) {
  //         this.setData({
  //           noMore: true,
  //           hasCityLine: false
  //         })
  //       } else {
  //         this.setData({
  //           EXC_lineList: res.content,
  //           hasCityLine: true
  //         })
  //       }
  //     }
  //   }, err => {
  //     console.log(err)
  //   })
  // },

  // 包车选择线路
  // chooseExclusiveCarLine(e) {
  //   let item = e.currentTarget.dataset.item;
  //   wx.navigateTo({
  //     url: '/pages/exclusiveCar/exclusiveCar?lineInfo=' + JSON.stringify(item),
  //   })
  // },

  // 查询城市业务是否开通
  checkCityStatus(businessType) {
    let _this = this;
    if (app.globalData.startCityAdcode && wx.getStorageSync('token')) {
      let driverId = 0;
      if(businessType == 5 && this.data.driverFriend){
        driverId = this.data.driverFriend.cart_id;
      }
      if((businessType == 5 && this.data.driverFriend) || businessType != 5){
        let url = "/v2/passenger/cityAreaBusinessManager/checkOpenCityBusiness?areaCode=" + app.globalData.startCityAdcode + "&businessType=" + businessType+"&driverId="+driverId;
        return new Promise((resolve, reject) => {
          // http.postRequest(url, '', wx.getStorageSync('header'), res => {
          //   if (res.content.isOpen === 0) {
          //     _this.setData({
          //       hideCityNoService: false
          //     })
          //     app.globalData.hideCityNoService = false;
          //   } else {
          //     _this.setData({
          //       hideCityNoService: true
          //     })
          //     app.globalData.hideCityNoService = true;
          //   }
          //   resolve(res.content.isOpen);
          // }, err => {
          //   console.log(err);
          //   reject();
          // })
          _this.setData({
            hideCityNoService: true
          })
          app.globalData.hideCityNoService = true;
        })
      }
    }
  },
  navNumReq(code) {
    let navData = [{
      "id": 1,
      "businessType": 1,
      "name": "专车",
    },
    // {
    //   "id": 1,
    //   "businessType": 6,
    //   "name": "远程",
    // },
    // {
    //   "id": 2,
    //   "businessType": 9,
    //   "name": "包车",
    // },
    // {
    //   "id": 3,
    //   "businessType": 10,
    //   "name": "出租车",
    // },
    // {
    //   "id": 4,
    //   "businessType": 5,
    //   "name": "好友司机",
    // }
    ]
    this.setData({
       navData
    })
    // http.postRequest("/v2/passenger/cityAreaBusinessManager/getCityAreaBusinessManagerByCityCode?cityCode=" + code, "", wx.getStorageSync('header'), res => {
    //   if (res.content.length > 0) {
    //     let tempArr = [],
    //       resArr = [];
    //     for (let i = 0; i < res.content.length; i++) {
    //       tempArr = navData.filter(val => {
    //         return val.businessType == res.content[i];
    //       })
    //       resArr = resArr.concat(tempArr);
    //     }
    //     this.setData({
    //       navData:resArr
    //     })
    //   }
    // }, err => {
    //   console.log(err)
    // })
  },
  
  toMyIntegral() {
    wx.navigateTo({
      url: '/user_center/pages/integral/integral',
    })
  },
  kefu(){
    var tel = wx.getStorageSync("servicePhone");
    wx.showModal({
      title: '联系客服',
      content: '客服电话'+wx.getStorageSync("servicePhone"),
      success(res) {
         if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: wx.getStorageSync('servicePhone') // 你要拨打的电话号码
            })
         } else if (res.cancel) {
           wx.showToast({
             title: '取消拨打客服电话',
             icon:"error"
           })
         }
      }
    })
  },
  getSystemInfo(){
     http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
         wx.setStorageSync('servicePhone',res.data.Phone);
         wx.setStorageSync('LayerOrder',res.data.LayerOrder);
      }
    }, err => {
      console.log(err)
    })
  },
  getNews() {
    var data = {
      "FormTypeId":app.globalData.formIdType,//贝壳
      "page": "1",
      "limit": "10",
    };
    http.postRequest("/Api/DispatchMobile/GetRideTicket",data, wx.getStorageSync('header'), res => {
      if(res.code==0){
        var data = res.data;
        this.setData({
          title: data[0].MainContent
        })
      }
    }, err => {
      console.log(err)
    })
  },
})