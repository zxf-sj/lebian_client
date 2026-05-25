const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
import http from '../../utils/http.js';
import qqmapsdk from '../../libs/qqMap';
import dateTimePicker from '../../utils/datepicker.js';
let SCREEN_WIDTH = 750;
let RATE = wx.getWindowInfo().screenHeight / wx.getWindowInfo().screenWidth;
const app = getApp();
let callCarTimer = null;
let d30 = new Date().getTime() + 1800000;
let date = new Date(d30);
let weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
let currentHours = date.getHours();
let currentMinute = date.getMinutes();
Page({
  data: {
    ScreenTotalW: SCREEN_WIDTH,
    //ScreenTotalH: SCREEN_WIDTH * RATE - 550,
    longitude: '',
    latitude: '',
    markers: [],
    points: [],
    modalHidden: true,
    walkingDis: 0,
    strAddress: '', //起点
    endAddress: '', //终点
    currentTab: 0,
    totalPrice: null,
    preferentialPrice: null,
    areaCode: null,
    taxi: false,
    fromFriendUseCart: false,
    driverFriend: null,
    showCoupon: false,
    isFromIcon: true,
    curCouponData: null,
    hasChooseId: null,
    exchangeItem: null,
    isBack:false,
    showMovable:false,
    TicketPrice:0.00,
    yjTimes:0,
    personNum:0,
    siteStr:"",
    showcar:true,
    carvalue:"",
    array:[],
    carName:"",
    dispatchListId:"",
    showList:false,
    nomore:false,
    tuijian:"点击选择推荐车辆",
    countLen:0,
    //orderType:[{'name':'拼车','id':'0001'},{'name':'独享','id':'00002'}],
    Tindex:0,//是否独享
    isYue:false,
    //showCarType:true,
    ygprice:0.00,
    yhprice:0.00,
    showCoupon:false,
    couponName:"",
    PersonalIds:"",
    OnLineCarTypeId:"",
    Note:"",
    siteInfoStr:"",
    isTui:false,
    yehprice:0,
    renNum:0,
    changeTab:1,
    startDate: "点击选择预约时间",
    multiArray: [
      ['今天', '明天', '后天'],
      ['07','08','09','10','11','12','13','14','15','16','17','18'],
      ['00','15','30','45']
    ],
    multiIndex: [0, 0, 0],
    peakPriceStr:"",
    estimate_in_time: '',
    dateTime: null,
    dateTimeArray: null,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 99,
  },
  onLoad: function (opt) {
    let _this = this;
    _this.mapCtx = wx.createMapContext("myMap");
    // let startDate = wx.getStorageSync('startDate');
    // if (startDate) {
    //   _this.setData({
    //     isAppointment: true,
    //     startDate
    //   })
    // }
    _this.setData({
      httpsUrl:app.globalData.httpsUrl,
      strAddress: app.globalData.strAddress,
      endAddress: app.globalData.destination,
      markers: [{
          id: 0,
          latitude: app.globalData.strLatitude,
          longitude: app.globalData.strLongitude,
          iconPath: '/assets/images/end.png',
          width: 30,
          height: 30,
          callout: {
            content: "从这里出发", //文本
            bgColor: "#fff", //背景色
            padding: "10px 30px", //文本边缘留白
            borderRadius: "15px", //边框圆角
            borderWidth: "1px", //边框宽度
            borderColor: "#ccc", //边框颜色
            color: '#000', //文字颜色
            textAlign: 'center', //对其方式,
            display: 'ALWAYS', //常显  BYCLICK点击显示
          }
        },
        {
          id: 1,
          latitude: app.globalData.endLatitude,
          longitude: app.globalData.endLongitude,
          iconPath: "/assets/images/start.png",
          width: 30,
          height: 30,
        },
      ]
    })
    _this.driving(app.globalData.strLatitude, app.globalData.strLongitude, app.globalData.endLatitude, app.globalData.endLongitude);
  },

  onShow(){
    this.setData({
      strAddress: app.globalData.strAddress,
    })
    this.driving(app.globalData.strLatitude, app.globalData.strLongitude, app.globalData.endLatitude, app.globalData.endLongitude);
    //this.checkIntegral();
    if(wx.getStorageSync('siteStr')){
      this.setData({
        siteStr:wx.getStorageSync('siteStr'),
        siteInfoStr:wx.getStorageSync('siteInfoStr'),
        PersonalIds:wx.getStorageSync('personStr'),
        OnLineCarTypeId:wx.getStorageSync('cartypeId')
      })
      this.getPriceInfo();
    }
    if(wx.getStorageSync('Tindex')){
      this.setData({
        Tindex:wx.getStorageSync('Tindex'),
      })
      //this.getPriceInfo();
    }
    if(wx.getStorageSync('totalNum')){
      this.setData({
        personNum:wx.getStorageSync('totalNum'),
        Note:wx.getStorageSync('note')?wx.getStorageSync('note'):"",
        PersonalIds:wx.getStorageSync('personStr')
      })
      this.getPriceInfo();
      // if(this.data.changeTab==1){
      //   this.getTongLine();
      // }
    }
    if(wx.getStorageSync('isyue')){
      this.setData({
        isYue:wx.getStorageSync('isyue')
      })
    }
    if(wx.getStorageSync('renNum')){
      this.setData({
        renNum:wx.getStorageSync('renNum')
      })
    }
    if(wx.getStorageSync('dispatchListId')){
      this.setData({
        dispatchListId:wx.getStorageSync('dispatchListId'),
        tuijian:wx.getStorageSync('tuijian')+"---座位："+wx.getStorageSync('siteStr'),
        isTui:wx.getStorageSync('isTui'),
        //showCarType:wx.getStorageSync('showCarType'),
        showList:wx.getStorageSync('showList')
      })
    }
    //this.getPriceInfo();
  },

  // 驾车路线
  driving(str1, str2, end1, end2) {
    var _this = this;
    var data = {
      "origin":str1+","+str2,
      "destination":end1+","+end2
    }
    http.postRequest('/Api/MapWebApi/GetBaiduDrivingTotalLine?origin='+data.origin+"&destination="+data.destination,"","", res => {
      if(res.code==0){
        var datas = res.data.result.routes[0];
        var arr = datas.steps;
        var pl = [];
        for (var i = 0; i < arr.length; i++) {
          pl.push({
            latitude: arr[i].start_location.lat,
            longitude: arr[i].start_location.lng
          })
        }
        let _points = [{
            latitude: parseFloat(str1),
            longitude: parseFloat(str2)
          }, {
            latitude: parseFloat(end1),
            longitude: parseFloat(end2)
          }];
          _this.setData({
            polyline: [{
              points: pl,
              color: '#4dd08b',
              width: 4,
              arrowLine: true
            }],
            yjTimes:(datas.duration/60).toFixed(2),
            countLen:(datas.distance/1000).toFixed(2)
          })
  
          _this.mapCtx.includePoints({
            padding: [120],
            points: _points,
          })
      }
    }, err => {
      console.log(1111,err)
    })
    //调用距离计算接口
    // qqmapsdk.direction({
    //   mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
    //   //from参数不填默认当前地址
    //   from: {
    //     'latitude': str1,
    //     'longitude': str2
    //   },
    //   to: {
    //     'latitude': end1,
    //     'longitude': end2
    //   },
    //   success: function (res) {
    //     var ret = res;
    //     var coors = ret.result.routes[0].polyline,
    //       pl = [];
    //     //坐标解压（返回的点串坐标，通过前向差分进行压缩）
    //     var kr = 1000000;
    //     for (var i = 2; i < coors.length; i++) {
    //       coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
    //     }
    //     //将解压后的坐标放入点串数组pl中
    //     for (var i = 0; i < coors.length; i += 2) {
    //       pl.push({
    //         latitude: coors[i],
    //         longitude: coors[i + 1]
    //       })
    //     }
    //     let _points = [{
    //       latitude: parseFloat(str1),
    //       longitude: parseFloat(str2)
    //     }, {
    //       latitude: parseFloat(end1),
    //       longitude: parseFloat(end2)
    //     }]

    //     _this.setData({
    //       polyline: [{
    //         points: pl,
    //         color: '#3091e0DD',
    //         width: 4,
    //         arrowLine: true
    //       }],
    //       markers: [{
    //         iconPath: "/assets/images/end.png",
    //         id: 0,
    //         latitude: str1,
    //         longitude: str2,
    //         width: 45,
    //         height: 45,
    //         callout: {
    //           content: app.globalData.strAddress, //文本
    //           bgColor: "#fff", //背景色
    //           padding: "10px 30px", //文本边缘留白
    //           borderRadius: "15px", //边框圆角
    //           borderWidth: "1px", //边框宽度
    //           borderColor: "#ccc", //边框颜色
    //           color: '#000', //文字颜色
    //           textAlign: 'center', //对其方式,
    //           display: 'ALWAYS', //常显  BYCLICK点击显示
    //         },
    //       }, {
    //         iconPath: "/assets/images/start.png",
    //         id: 1,
    //         latitude: end1,
    //         longitude: end2,
    //         width: 45,
    //         height: 45,
    //         callout: {
    //           content: app.globalData.destination, //文本
    //           bgColor: "#fff", //背景色
    //           padding: "10px 30px", //文本边缘留白
    //           borderRadius: "15px", //边框圆角
    //           borderWidth: "1px", //边框宽度
    //           borderColor: "#ccc", //边框颜色
    //           color: '#000', //文字颜色
    //           textAlign: 'center', //对其方式,
    //           display: 'ALWAYS', //常显  BYCLICK点击显示
    //         },
    //       }],
    //       yjTimes:res.result.routes[0].duration,
    //       countLen:(res.result.routes[0].distance/1000).toFixed(2)
    //     })

    //     _this.mapCtx.includePoints({
    //       padding: [120],
    //       points: _points,
    //     })
    //   },
    //   fail: function (error) {
    //     console.log(error);
    //   }
    // });
  },

  // 叫车
  callCar() {
    var openid = wx.getStorageSync('openid');
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    if(this.data.strAddress=='出发地'){
      wx.showToast({
        title: '请选择出发乘车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(this.data.changeTab==2){
      if(this.data.startDate=='点击选择预约时间'){
        wx.showToast({
          title: '请选择预约时间',
          icon:'none'
        })
        return false;
      }
    }
    var phoneNumber = wx.getStorageSync('phoneNumber')
    var user = wx.getStorageSync('userInfo');
    var line_id = wx.getStorageSync('line_id');
    var yjtime = this.getYjtimes(this.data.yjTimes);
    var personNum = this.data.renNum>0?this.data.renNum:this.data.personNum;
    var sitestr = this.data.siteStr;
    var sitearr = sitestr.split(",");
    if(personNum==0){
      wx.showToast({
        title: '请填写乘车人数',
        icon:'error'
      })
      return false;
    }
    if(this.data.Tindex==0){
      if(personNum != sitearr.length){
        wx.showToast({
          title: '您选择的座位数与乘车人数不符',
          icon:'none',
          duration:2000
        })
        return false;
      }
    }
    let reqData = {
      PassengerLineId:line_id,
      IntoLocation:app.globalData.strAddress,
      IntoLongitude:app.globalData.strLongitude,
      IntoLatitude:app.globalData.strLatitude,
      OffLocation:app.globalData.destination,
      OffLongitude:app.globalData.endLongitude,
      OffLatitude:app.globalData.endLatitude,
      PassengerNumber:personNum,
      Departure:app.globalData.nowOrFutureId==1?"100004-0000980001":"100004-0000980002",
      ArrivalTime:this.data.startDate=="点击选择预约时间"?yjtime:this.data.startDate,
      Personal:user.Id,
      SeatNumber:this.data.siteStr,
      DispatchListId:this.data.dispatchListId,
      IsReservation:this.data.changeTab==1?"100004-0000010002":"100004-0000010001",
      CouponDetailsId:this.data.hasChooseId?this.data.hasChooseId:"",
      OnLineCarTypeId:this.data.OnLineCarTypeId,
      PersonalIds:this.data.PersonalIds,
      Note:this.data.No,
      IsExclusive:this.data.Tindex==1?"100004-0000010001":"100004-0000010002",
      IsPickGoods:'100004-0000010002'
    }
    if(this.data.dispatchListId){
      wx.showLoading({
        title: '车辆调度中',
      })
    }else{
      wx.showLoading({
        title: '加载中...',
      })
    }
    let that = this;
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/saveRideTicketOrder',
      data:reqData,
      method:"POST",
      success(res) {
        var ress = res.data
        if (ress.code == '0') {
          wx.removeStorageSync('siteStr');
          wx.removeStorageSync('siteInfoStr');
          wx.removeStorageSync('line_id');
          wx.removeStorageSync('endCity');
          wx.removeStorageSync('endlong');
          wx.removeStorageSync('endlati');
          wx.removeStorageSync('TicketPrice');
          wx.removeStorageSync('totalNum');
          wx.removeStorageSync('goType');
          wx.removeStorageSync('cartypeId');
          wx.removeStorageSync('note');
          wx.removeStorageSync('personStr');
          wx.removeStorageSync('ReservationDelay');
          wx.hideLoading();
          that.setSubscribeMessage();
          wx.reLaunch({
            url: '/driving_status/pages/orderService/orderService?order_id='+ress.data.Id+"&from=call"
          })
        }else{
          wx.showToast({
            title: ress.msg,
            icon:'none',
            duration:2000
          })
        }
      },
    })
  },
  setSubscribeMessage:function(){
    wx.showModal({
      title: '提示',
      content: '即将为您开启消息提醒',
      complete: (res) => {
        if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA',"LhKVmpSKt-FGzwYVDHB6UQpVrdZmMklLzcFJ6Ln_oJU"],
            success(res) {
              if (res['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'] === 'accept') {
                console.log('用户同意接收订阅消息');
              } else {
                wx.showModal({
                  title: '订阅消息',
                  content: '您当前拒绝接受消息通知，是否去开启',
                  confirmText: '开启授权',
                  confirmColor: '#345391',
                  cancelText: '仍然拒绝',
                  cancelColor: '#999999',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {
                          console.log(res.authSetting);
                        },
                        fail(err) {
                          //失败
                          console.log(err);
                        }
                      });
                    } else if (res.cancel) {
                      console.log('用户点击取消');
                    }
                  }
                });
              }
            },
            fail(err) {
              console.log('请求订阅消息权限失败：', err);
            }
          });
        }
       
      }
    })
  },
  //重新修改
  modalCancel: function () {
    console.log("modalCancel")
    this.setData({
      modalHidden: true
    })
  },

  //继续叫车
  modalConfirm: function () {
    this.setData({
      modalHidden: true
    })
    wx.navigateTo({
      url: '/driving_status/pages/orderService/orderService?from=call',
    })
  },
  onExchangeItem(item){
    this.setData({
      hasChooseId:item.detail.Id,
      couponName:item.detail.CouponType_Name+' 优惠'+item.detail.CouponMoney+"元"
    })
    this.getPriceInfo();
  },
  //查看估价
  bindPriceDetail() {
    let data = {
      strLat: app.globalData.strLatitude,
      strLng: app.globalData.strLongitude,
      endLat: app.globalData.endLatitude,
      endLng: app.globalData.endLongitude,
    }
    let replaceList;
    if(this.data.curCouponData && this.data.curCouponData.costList){
      replaceList = JSON.stringify(this.data.curCouponData.costList);
    }else{
      replaceList = '';
    }
    wx.navigateTo({
      url: '/user_center/pages/budgetPrice/budgetPrice?valuationData=' + JSON.stringify(data)+'&replaceList='+replaceList,
    })
  },
  //定位当前位置
  getMyLocation() {
    var _self = this
    wx.getLocation({
      type: "wgs84",
      success(res) {
        _self.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  // showSlideCoupon() {
  //   let businessType;
  //   if (this.data.taxi) {
  //     businessType = app.globalData.friendDriver ? 5 : 10;
  //   } else {
  //     businessType = app.globalData.friendDriver ? 5 : 1;
  //   }
  //   let slideCouponParams = {
  //     businessType,
  //     cityCode: app.globalData.startCityAdcode
  //   }
  //   let data = {
  //     businessType:1,
  //     cityCode:app.globalData.startCityAdcode.substr(0,6),
  //     pageSize:20,
  //     currentPage:1,
  //   }
  //   http.postRequest("/v2/passenger/integral/verifyChangeCoupon",data,wx.getStorageSync('header'),res=>{
  //     if(res.content.change){
  //       this.setData({
  //         showCoupon: true,
  //         isFromIcon: true,
  //         slideCouponParams
  //       })
  //     }else{
  //       this.setData({
  //         showIntegralExchangeModal:true,
  //         abnormalData:res.content.describe
  //       })
  //     }
  //   })
  // },

  // onHasChooseCouponData(e) {
  //   this.setData({
  //     curCouponData: e.detail.data,
  //     totalPrice: e.detail.data.singlePrice,
  //   })
  // },

  // chooseCoupon() {
  //   if (this.data.curCouponData) {
  //     this.setData({
  //       hasChooseId: this.data.curCouponData.couponId
  //     })
  //   }
  //   let businessType;
  //   if (this.data.taxi) {
  //     businessType = app.globalData.friendDriver ? 5 : 10;
  //   } else {
  //     businessType = app.globalData.friendDriver ? 5 : 1;
  //   }
  //   let slideCouponParams = {
  //     businessType,
  //     cityCode:app.globalData.startCityAdcode
  //   }
  //   this.setData({
  //     showCoupon: true,
  //     isFromIcon: false,
  //     slideCouponParams
  //   })
  // },
  searchInputend(e) {
    var _this = this;
    var value = e.detail.value
    if (value) {
      qqmapsdk.getSuggestion({
        keyword: value,
        region: _this.data.destinationCity,
        success: function (res) {
          console.log(res)
          let data = res.data
          _this.setData({
            address: data,
          })
        }
      })
    }
  },
  clickAddress(e) {
    let data = e.currentTarget.dataset.item;
    app.globalData.destinationCity = data.city;
    app.globalData.endLatitude = data.location.lat;
    app.globalData.endLongitude = data.location.lng;
    app.globalData.destination = data.title;
    app.globalData.endAddress = data.title;
    this.setData({
      endAddress:data.title
    })
    this.driving(app.globalData.strLatitude, app.globalData.strLongitude, app.globalData.endLatitude, app.globalData.endLongitude);
  },
  getYjtimes(miuntes){
    let d = new Date().getTime() + (miuntes* 60000);
    var now = new Date(d);
    let year = now.getFullYear();  
    let month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以加1，并补零  
    let day = String(now.getDate()).padStart(2, '0'); // 补零  
    let hours = String(now.getHours()).padStart(2, '0'); // 补零  
    let minutes = String(now.getMinutes()).padStart(2, '0'); // 补零  
    let seconds = String(now.getSeconds()).padStart(2, '0'); // 补零  
    let formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;  
    return formattedDate;
  },
  toStarting() {
    wx.redirectTo({
      url: '/pages/starting/starting',
    })
  },
  toEnding() {
    wx.redirectTo({
      url: '/pages/ending/ending',
    })
  },
  choosePerson(){
    wx.removeStorageSync('siteStr');
    wx.removeStorageSync('siteInfoStr');
    wx.removeStorageSync('cartypeId');
    //wx.removeStorageSync('showCarType');
    wx.removeStorageSync('dispatchListId');
    wx.removeStorageSync('showList');
    wx.removeStorageSync('tuijian');
    wx.removeStorageSync('isTui');
    this.setData({
      siteInfoStr:'',
      isTui:false
    })
    wx.navigateTo({
      url: '/pages/choosePerson/choosePerson'
    })
  },
  chooseSit(){
    var that = this;
    if(that.data.personNum){
      wx.navigateTo({
        url: '/pages/choosesit/choosesit?personNum='+this.data.personNum+'&isAlone='+that.data.Tindex,
      })
    }else{
      wx.showToast({
        title: '请填写乘车人数',
        icon:'error',
        duration:2000
      })
    }
  },
  chooseSit1(){
    var that = this;
    if(that.data.personNum){
      wx.navigateTo({
        url: '/pages/chooseSeat/chooseSeat?personNum='+this.data.personNum+'&isAlone='+that.data.Tindex,
      })
    }else{
      wx.showToast({
        title: '请填写乘车人数',
        icon:'error',
        duration:2000
      })
    }
  },
  getTongLine(){
    let that =this;
    var nums = that.data.personNum;
    var line_id = wx.getStorageSync('line_id');
    var IsExclusive = that.data.Tindex;
    if(!nums){
      wx.showToast({
        title: '请先填写乘车人数',
        icon:'none',
        duration:2000
      })
    }else{
      // http.getRequest("/Api/DispatchMobile/getNowDispatchForLine?lineId="+line_id+"&planNum="+nums,'',wx.getStorageSync('header'),res=>{ 
      http.getRequest("/Api/DispatchMobile/getDistanceCars?Longitude="+app.globalData.strLongitude+"&latitude="+app.globalData.strLatitude+"&PassengerlineId="+line_id+"&SeatNum="+nums+"&IsExclusive="+IsExclusive,'',wx.getStorageSync('header'),res=>{
        if(res.code==0){
          var data = res.data;
          if(data.length>0){
            data.forEach((value, index) => {
              var siteArr = value.seatList;
              console.log(siteArr);
              var arr = ["A","B","C","D","E","F"];
              var arr1 = ["A","B","C","D"];
              if(value.TypeSeatNum==4){
                let result = [];
                for (let i = 0; i < siteArr.length; i++) {
                  if (siteArr[i] !== "1") {
                    result.push(arr1[i]);
                  }
                }
                var str = result.join(",");
                data[index].seatListStr = str;
                console.log(str);
              }else if(value.TypeSeatNum==6){
                let result = [];
                for (let i = 0; i < siteArr.length; i++) {
                  if (siteArr[i] !== "1") {
                    result.push(arr[i]);
                  }
                }
                var str = result.join(",");
                data[index].seatListStr = str;
              }
            });
            data.forEach((value, index) => {
              data[index]['TypeSeatNum'] = Number(value['TypeSeatNum'])+1;
              var distance = value['distance']?value['distance']:0.00;
              data[index]['distance'] = distance.toFixed(2);
            });
            if(wx.getStorageSync('tuijian')){
              that.setData({
                array:data,
                tuijian:wx.getStorageSync('tuijian')+"---座位："+wx.getStorageSync('siteStr')
              })
            }else{
              that.setData({
                array:data,
                tuijian:'点击选择推荐车辆',
                showList:true
              })
            }
          }else{
            that.setData({
              nomore:true,
              tuijian:'暂无推荐车辆',
              showList:true
            })
          }
        }else{
          wx.showToast({
            title: '暂无推荐车辆',
            icon:'none',
            duration:2000
          })
          that.setData({
            nomore:true,
            tuijian:'暂无推荐车辆',
            showList:false
          })
        }
      })
    }
  },
  showTongLine(){
    let that = this;
    that.setData({
      showList:true
    })
    this.getTongLine();
  },
  closePopup(){
    this.setData({
      showList:false
    })
  },
  chooseCar(e){
    var item = e.currentTarget.dataset.item;
    console.log(item);
    // var data = {
    //   seatList:item.seatList,
    //   CarDirId_PersonNumber:item.CarDirId_PersonNumber,
    //   seatRule:item.seatRule
    // }
    var data = {
      seatList:item.seatList,
      CarDirId_PersonNumber:item.TypeSeatNum,
      seatRule:item.seatRule,
    }
    wx.setStorageSync('dispatchListId', item.Id);
    wx.setStorageSync('tuijian',"车牌号："+item.CarDirId_Name+" ");
    wx.setStorageSync('isTui',true);
    //wx.setStorageSync('showCarType',false);
    wx.setStorageSync('showList',false);
    wx.setStorageSync('cartypeId',item.onlinecartypeid);
    wx.navigateTo({
      url: '/pages/siteChoose/siteChoose?personNum='+wx.getStorageSync('totalNum')+'&item='+JSON.stringify(data)
    })
  },
  chuTui(){
    wx.removeStorageSync('dispatchListId');
    wx.removeStorageSync('tuijian');
    wx.removeStorageSync('isTui');
    //wx.removeStorageSync('showCarType');
    wx.removeStorageSync('siteStr');
    this.setData({
      dispatchListId:null,
      showList:false,
      tuijian:"点击选择推荐车辆",
      //showCarType:true
    })
  },
  scrollToLower: function (e) {
    // if (!this.data.loading && !this.data.noMore) {
    //   this.setData({
    //     loading: true,
    //     pageNo: this.data.pageNo + 1
    //   });
    //   this.getOrderList(true,this.data.FormTypeId);
    // }
  },
  // bindPickerChange(e){
  //   this.setData({
  //     Tindex:e.detail.value
  //   })
  // },
  changeCarType(e){
    var type = e.currentTarget.dataset.type;
    wx.setStorageSync('Tindex', type);
    wx.removeStorageSync('siteStr');
    wx.removeStorageSync('cartypeId');
    wx.removeStorageSync('siteInfoStr');
    wx.removeStorageSync('renNum');
    // wx.removeStorageSync('totalNum');
    // wx.removeStorageSync('renNum');
    this.setData({
      Tindex:e.currentTarget.dataset.type,
      siteInfoStr:'请选择车型',
      siteStr:"",
      renNum:0,
      ygprice:0,
      yhprice:0,
      yehprice:0,
      tuijian:"请选择车型"
    })
  },
  getPriceInfo() {
    let that = this;
    var openid = wx.getStorageSync('openid');
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    var user = wx.getStorageSync('userInfo');
    var line_id = wx.getStorageSync('line_id');
    var yjtime = that.getYjtimes(that.data.yjTimes);
    var personNum = wx.getStorageSync('renNum')>0?wx.getStorageSync('renNum'):that.data.personNum;
    let reqData = {
      PassengerLineId:line_id,
      IntoLocation:app.globalData.strAddress,
      IntoLongitude:app.globalData.strLongitude,
      IntoLatitude:app.globalData.strLatitude,
      OffLocation:app.globalData.destination,
      OffLongitude:app.globalData.endLongitude,
      OffLatitude:app.globalData.endLatitude,
      PassengerNumber:personNum,
      Departure:app.globalData.nowOrFutureId==1?"100004-0000980001":"100004-0000980002",
      ArrivalTime:this.data.startDate!='点击选择预约时间'?this.data.startDate:yjtime,
      Personal:user.Id,
      SeatNumber:this.data.siteStr,
      DispatchListId:this.data.dispatchListId,
      IsReservation:this.data.changeTab==1?"100004-0000010002":"100004-0000010001",
      CouponDetailsId:this.data.hasChooseId?this.data.hasChooseId:"",
      OnLineCarTypeId:this.data.OnLineCarTypeId,
      PersonalIds:this.data.PersonalIds,
      Note:this.data.Note,
      IsExclusive:this.data.Tindex==1?"100004-0000010001":"100004-0000010002",
      IsPickGoods:'100004-0000010002'
    }
    http.postRequest('/Api/DispatchMobile/RideTicketMoney', reqData, wx.getStorageSync('header'), (res) => {
      if (res.code == '0') {
        var CouponInfo = res.data.CouponInfo;
        if(CouponInfo){
          that.setData({
            hasChooseId:CouponInfo.Id,
            couponName:CouponInfo.CouponType_Name+" "+"优惠"+CouponInfo.CouponMoney+"元"
          })
        }
        that.setData({
          ygprice:Number(res.data.CalcAfter),
          yhprice:res.data.CalcCoupon,
          yehprice:res.data.CalcBalance,
          peakPriceStr:res.data.peakPriceStr
        })
      }
    }, (err) => {
      console.log(err)
    })
  },
  showCoupon(){
    this.setData({
      showCoupon: true,
      isFromIcon: true,
      slideCouponParams:{
        money:this.data.ygprice
      }
    })
  },
  changePlay(){
    let flag = !this.data.play;
    this.setData({
      play:flag
    });
    //start title
    let titleOpenAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    titleOpenAn.opacity(0).step();
    this.setData({
      titleOpenAn:titleOpenAn.export()
    });
    let titleCloseAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    titleCloseAn.opacity(1).step();
    this.setData({
      titleCloseAn:titleCloseAn.export()
    });
    //end title
    // start 第一条line
    let line1OpenAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    line1OpenAn.translateY(12).rotate(45).scale(1.4, 1).step();
    this.setData({
      line1OpenAn:line1OpenAn.export()
    });
    let line1CloseAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '12rpx 50%'
    });
    line1CloseAn.translateY(0).rotate(0).scale(1, 1).step();
    this.setData({
      line1CloseAn:line1CloseAn.export()
    });
    //end 第一条line

    // start 第二条line
    let line2OpenAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '100% 0'
    });
    line2OpenAn.translateY(-6.5).translateX(-1).rotate(-45).scale(1.4, 1).step();
    this.setData({
      line2OpenAn:line2OpenAn.export()
    });

    let line2CloseAn = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '46rpx 50%'
    });
    line2CloseAn.translateY(0).rotate(0).scale(1, 1).step();
    this.setData({
      line2CloseAn:line2CloseAn.export()
    });
    //end 第二条line

    //start 第一个按钮
    let btn1Open = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '100% 0'
    });
    btn1Open.translateX(-60).opacity(1).step();
    this.setData({
      btn1Open:btn1Open.export()
    });

    let btn1Close = wx.createAnimation({
      duration: 300,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '46rpx 50%'
    });
    btn1Close.translateX(0).opacity(0).step();
    this.setData({
      btn1Close:btn1Close.export()
    });
    //end 第一个按钮
    //start 第二个按钮
    let btn2Open = wx.createAnimation({
      duration: 500,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '100% 0'
    });
    btn2Open.translateX(-120).opacity(1).step();
    this.setData({
      btn2Open:btn2Open.export()
    });

    let btn2Close = wx.createAnimation({
      duration: 500,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '46rpx 50%'
    });
    btn2Close.translateX(0).opacity(0).step();
    this.setData({
      btn2Close:btn2Close.export()
    });
    //end 第二个按钮
    //start 第三个按钮
    let btn3Open = wx.createAnimation({
      duration: 700,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '100% 0'
    });
    btn3Open.translateX(-180).opacity(1).step();
    this.setData({
      btn3Open:btn3Open.export()
    });

    let btn3Close = wx.createAnimation({
      duration: 700,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '46rpx 50%'
    });
    btn3Close.translateX(0).opacity(0).step();
    this.setData({
      btn3Close:btn3Close.export()
    });
    //end 第三个按钮
    //start 第四个按钮
    let btn4Open = wx.createAnimation({
      duration: 700,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '100% 0'
    });
    btn4Open.translateX(-240).opacity(1).step();
    this.setData({
      btn4Open:btn4Open.export()
    });

    let btn4Close = wx.createAnimation({
      duration: 700,
      timingFunction: 'forwards',
      delay: 0,
      transformOrigin: '46rpx 50%'
    });
    btn4Close.translateX(0).opacity(0).step();
    this.setData({
      btn4Close:btn4Close.export()
    });
    //end 第四个按钮
  },
  footerTab(e) {
    wx.removeStorageSync('startDate');
    wx.removeStorageSync('siteStr');
    wx.removeStorageSync('siteInfoStr');
    wx.removeStorageSync('cartypeId');
    wx.removeStorageSync('tuijian');
    wx.removeStorageSync('isTui');
    if (e.currentTarget.dataset.current == 1) {
      this.setData({
        changeTab: e.currentTarget.dataset.current,
        startDate:'点击选择预约时间',
        tuijian:"点击选择推荐按车辆及座位",
        siteInfoStr:"请选择车型座位"
      })
    } else {
      //wx.setStorageSync('startDate', this.data.startDate)
      this.dateReq();
      this.setData({
        changeTab: e.currentTarget.dataset.current,
        tuijian:"点击选择推荐按车辆及座位"
      })
    }
  },
  dateReq() {
    let _this = this;
    //let data = {"appointmentTime":0,"appointmentDay":3,"ridingTimeStart":"00:00:00","ridingTimeEnd":"23:59:59"}
    var yanshi = wx.getStorageSync('ReservationDelay')?wx.getStorageSync('ReservationDelay'):0;
    // data.appointmentTime = yanshi*60;
    // this.setData({
    //   dateReqInfo:data
    // })
    // 获取当前时间的时间戳（毫秒级）
    if(yanshi !=0){
      var currentTimestamp = new Date().getTime();
      // 获取三小时后的时间戳
      var threeHoursLaterTimestamp = currentTimestamp + yanshi * 60 * 60 * 1000;
      var time = new Date(threeHoursLaterTimestamp);
      var y = time.getFullYear();
      var m = time.getMonth()+1;
      var d = time.getDate();
      var h = time.getHours();
      var mm = time.getMinutes();
      if(m<10){
        m = '0'+m;
      }
      if(d<10){
        d = '0'+d;
      }
      if(mm<10){
        mm = '0'+mm;
      }
      var yanshiTime = y+'年-'+m+'月-'+d+'日'+' '+h+'时:'+mm+'分';
      var obj  = dateTimePicker.dateTimePicker(_this.data.startYear, _this.data.endYear,yanshiTime);
    }else{
      var obj  = dateTimePicker.dateTimePicker(_this.data.startYear, _this.data.endYear);
    };
    _this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray
    });
  },
  // loadData: function (hours, minute) {
  //   var minuteIndex;
  //   if (currentMinute > 0 && currentMinute <= 10) {
  //     minuteIndex = 10;
  //   } else if (currentMinute > 10 && currentMinute <= 20) {
  //     minuteIndex = 20;
  //   } else if (currentMinute > 20 && currentMinute <= 30) {
  //     minuteIndex = 30;
  //   } else if (currentMinute > 30 && currentMinute <= 40) {
  //     minuteIndex = 40;
  //   } else if (currentMinute > 40 && currentMinute <= 50) {
  //     minuteIndex = 50;
  //   } else {
  //     minuteIndex = 60;
  //   }

  //   if (minuteIndex == 60) {
  //     // 时
  //     for (var i = currentHours + 1; i < 24; i++) {
  //       hours.push(i);
  //     }
  //     // 分
  //     for (var i = 0; i < 60; i += 10) {
  //       minute.push(i);
  //     }
  //   } else {
  //     // 时
  //     for (var i = currentHours; i < 24; i++) {
  //       hours.push(i);
  //     }
  //     // 分
  //     for (var i = minuteIndex; i < 60; i += 10) {
  //       minute.push(i);
  //     }
  //   }
  // },

  // loadHoursMinute: function (hours, minute) {
  //   let start = this.data.dateReqInfo.ridingTimeStart.split(':');
  //   let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
  //   // 时
  //   for (var i = parseInt(start[0]); i <= parseInt(end[0]); i++) {
  //     hours.push(i);
  //   }
  //   // 分
  //   for (var i = parseInt(start[1]); i <= parseInt(end[1]); i += 10) {
  //     minute.push(i);
  //   }
  // },

  // loadMinute: function (hours, minute) {
  //   var minuteIndex;
  //   let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
  //   if (currentMinute > 0 && currentMinute <= 10) {
  //     minuteIndex = 10;
  //   } else if (currentMinute > 10 && currentMinute <= 20) {
  //     minuteIndex = 20;
  //   } else if (currentMinute > 20 && currentMinute <= 30) {
  //     minuteIndex = 30;
  //   } else if (currentMinute > 30 && currentMinute <= 40) {
  //     minuteIndex = 40;
  //   } else if (currentMinute > 40 && currentMinute <= 50) {
  //     minuteIndex = 50;
  //   } else {
  //     minuteIndex = 60;
  //   }

  //   if (minuteIndex == 60) {
  //     // 时
  //     for (var i = currentHours + 1; i <= parseInt(end[0]); i++) {
  //       hours.push(i);
  //     }
  //   } else {
  //     // 时
  //     for (var i = currentHours; i <= parseInt(end[0]); i++) {
  //       hours.push(i);
  //     }
  //   }
  //   // 分
  //   for (var i = 0; i <= parseInt(end[1]); i += 10) {
  //     minute.push(i);
  //   }
  // },
  // pickerTap: function () {
  //   this.dateReq();
  //   let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
  //   date = new Date(d);
  //   let day1 = (date.getMonth() + 1) + "月" + date.getDate() + "日" + ' ' + '今天';
  //   let day2 = (new Date(date.getTime() + 24 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 24 * 3600000).getDate() + "日" + ' ' + '明天';
  //   let day3 = (new Date(date.getTime() + 48 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 48 * 3600000).getDate() + "日" + ' ' + '后天';
  //   var monthDay = [day1, day2, day3];
  //   var hours = [];
  //   var minute = [];
  //   currentHours = date.getHours();
  //   currentMinute = date.getMinutes();
  //   // 月-日
  //   let maxDate = this.data.dateReqInfo.appointmentDay;
  //   if (maxDate >= 4) {
  //     for (var i = 3; i <= maxDate - 1; i++) {
  //       var date1 = new Date(date);
  //       date1.setDate(date.getDate() + i);
  //       var md = (date1.getMonth() + 1) + "月" + date1.getDate() + "日" + " " + weekday[date1.getDay()];
  //       monthDay.push(md);
  //     }
  //   } else if (maxDate == 2) {
  //     monthDay = ['今天', '明天'];
  //   } else if (maxDate == 1) {
  //     monthDay = ['今天'];
  //   }

  //   var data = {
  //     multiArray: this.data.multiArray,
  //     multiIndex: this.data.multiIndex
  //   };

  //   if (data.multiIndex[0] === 0) {
  //     if (data.multiIndex[1] === 0) {
  //       this.loadData(hours, minute);
  //     } else {
  //       this.loadMinute(hours, minute);
  //     }
  //   } else {
  //     this.loadHoursMinute(hours, minute);
  //   }
  //   hours = hours.map(val => {
  //     return val + '点'
  //   })

  //   minute = minute.map(val => {
  //     return val + '分'
  //   })
  //   data.multiArray[0] = monthDay;
  //   data.multiArray[1] = hours;
  //   data.multiArray[2] = minute;
  //   this.setData(data);
  // },
  // bindMultiPickerColumnChange: function (e) {
  //   let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
  //   date = new Date(d);
  //   var that = this;
  //   var monthDay = ['今天', '明天', '后天'];
  //   var hours = [];
  //   var minute = [];
  //   currentHours = date.getHours();
  //   currentMinute = date.getMinutes();
  //   var data = {
  //     multiArray: this.data.multiArray,
  //     multiIndex: this.data.multiIndex
  //   };
  //   // 把选择的对应值赋值给 multiIndex
  //   data.multiIndex[e.detail.column] = e.detail.value;
  //   // 然后再判断当前改变的是哪一列,如果是第1列改变
  //   if (e.detail.column === 0) {
  //     // 如果第一列滚动到第一行
  //     if (e.detail.value === 0) {
  //       that.loadData(hours, minute);
  //     } else {
  //       that.loadHoursMinute(hours, minute);
  //     }
  //     data.multiIndex[1] = 0;
  //     data.multiIndex[2] = 0;
  //     // 如果是第2列改变
  //   } else if (e.detail.column === 1) {
  //     // 如果第一列为今天
  //     if (data.multiIndex[0] === 0) {
  //       if (e.detail.value === 0) {
  //         that.loadData(hours, minute);
  //       } else {
  //         that.loadMinute(hours, minute);
  //       }
  //       // 第一列不为今天
  //     } else {
  //       that.loadHoursMinute(hours, minute);
  //     }
  //     data.multiIndex[2] = 0;
  //     // 如果是第3列改变
  //   } else {
  //     // 如果第一列为'今天'
  //     if (data.multiIndex[0] === 0) {
  //       // 如果第一列为 '今天'并且第二列为当前时间
  //       if (data.multiIndex[1] === 0) {
  //         that.loadData(hours, minute);
  //       } else {
  //         that.loadMinute(hours, minute);
  //       }
  //     } else {
  //       that.loadHoursMinute(hours, minute);
  //     }
  //   }
  //   hours = hours.map(val => {
  //     return val + ' 点'
  //   })
  //   minute = minute.map(val => {
  //     return val + ' 分'
  //   })
  //   data.multiArray[1] = hours;
  //   data.multiArray[2] = minute;
  //   this.setData(data);
  // },
  // bindStartMultiPickerChange: function (e) {
  //   var that = this;
  //   let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
  //   date = new Date(d);
  //   var monthDay = that.data.multiArray[0][e.detail.value[0]];
  //   var hours = that.data.multiArray[1][e.detail.value[1]];
  //   var minute = that.data.multiArray[2][e.detail.value[2]];
  //   var globalMonthDay;
  //   if (monthDay.split(' ')[1] === "今天") {
  //     var month = date.getMonth() + 1;
  //     var day = date.getDate();
  //     monthDay = month + "月" + day + "日";
  //     globalMonthDay = date.getFullYear() + '-' + month + "-" + day
  //   } else if (monthDay.split(' ')[1] === "明天") {
  //     var date1 = new Date(date);
  //     date1.setDate(date.getDate() + 1);
  //     monthDay = (date1.getMonth() + 1) + "月" + date1.getDate() + "日";
  //     globalMonthDay = date.getFullYear() + '-' + (date1.getMonth() + 1) + "-" + date1.getDate()

  //   } else if (monthDay.split(' ')[1] === "后天") {
  //     var date2 = new Date(date);
  //     date2.setDate(date.getDate() + 2);
  //     monthDay = (date2.getMonth() + 1) + "月" + date2.getDate() + "日";
  //     globalMonthDay = date.getFullYear() + '-' + (date2.getMonth() + 1) + "-" + date2.getDate()
  //   } else {
  //     var month = monthDay.split("月")[0]; // 返回月
  //     var day = monthDay.split("月")[1].split("日")[0]; // 返回日
  //     globalMonthDay = date.getFullYear() + '-' + month + "-" + day
  //   }
  //   let resHours = parseInt(hours) < 10 ? '0' + parseInt(hours) : parseInt(hours);
  //   let resMinute = parseInt(minute) < 10 ? '0' + parseInt(minute) : parseInt(minute);
  //   var startDate = monthDay + " " + resHours + ":" + resMinute;
  //   var startDate1 = globalMonthDay+" "+resHours+":"+resMinute;
  //   that.setData({
  //     startDate: startDate
  //   })
  //   wx.setStorageSync('startDate', startDate1)
  // },
  xuanze(e){
    var item = e.currentTarget.dataset.item;
    console.log(item.TypeSeatNum);
    var sites ="";
    if(item.TypeSeatNum ==7){
      sites = "A,B,C,D,E,F";
    }else if(item.TypeSeatNum == 5){
      sites = "A,B,C,D";
    }
    wx.setStorageSync('cartypeId',item.onlinecartypeid);
    wx.setStorageSync('renNum',item.TypeSeatNum-1);
    this.setData({
      dispatchListId:item.Id,
      tuijian:"车牌号:"+item.CarDirId_Name+"|"+sites,
      isTui:true,
      showList:false,
      siteStr:sites,
      renNum:item.TypeSeatNum-1,
      OnLineCarTypeId:item.onlinecartypeid
    })
    this.getPriceInfo();
  },
  changeDateTime(e) {
    let duo = wx.getStorageSync('ReservationDelay');
    let that = this;
    that.setData({
      dateTime: e.detail.value
    });
    var arr = that.data.dateTime,
    dateArr = that.data.dateTimeArray;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    var year = dateArr[0][arr[0]];
    var newyear = year.replace('年',"");
    var yue = dateArr[1][arr[1]];
    var newyue = yue.replace('月',"");
    var ri = dateArr[2][arr[2]];
    var newri = ri.replace('日',"");
    var shi =dateArr[3][arr[3]];
    var newshi = shi.replace('时',"");
    var fen = dateArr[4][arr[4]]
    var newfen = fen.replace('分',"");
    var xianTime =  year+yue+ri+' '+shi+fen;
    var estimate_in_time = newyear+'-'+newyue+'-'+newri+' '+newshi+':'+newfen;
    var nowtime = new Date();
    var timestp = nowtime.getTime()+ duo* 3600 * 1000;
    var checktime = new Date(estimate_in_time.replace(/-/g, '/')).getTime();
    if(checktime>timestp){
      that.setData({
        dateTimeArray: dateArr,
        dateTime: arr,
        estimate_in_time,
        startDate:xianTime
      });
      wx.setStorageSync('startDate', estimate_in_time);
    }else{
      wx.showToast({
        title: '您选择的预约时间不正确,只能选择'+duo+'小时后的时间',
        icon:'none',
        duration:2000
      })
    }
  },
})