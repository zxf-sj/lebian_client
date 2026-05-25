const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
import http from '../../utils/http.js';
import qqmapsdk from '../../libs/qqMap';
var bmap = require('../../libs/bmap-wx.min');
let SCREEN_WIDTH = 750;
let RATE = wx.getWindowInfo().screenHeight / wx.getWindowInfo().screenWidth;
const app = getApp();
const throttle = require('../../utils/throttle.js').throttle;
Page({
  data: {
    ScreenTotalW: SCREEN_WIDTH,
    ScreenTotalH: SCREEN_WIDTH * RATE - 550,
    longitude: '',
    latitude: '',
    markers: [],
    points: [],
    strAddress: '请选择起点', //起点
    endAddress: '请选择终点', //终点
    showCoupon: false,
    isFromIcon: true,
    curCouponData: null,
    hasChooseId: null,
    yjTimes:0,
    personNum:0,
    siteStr:"",
    array:[],
    nomore:false,
    countLen:0,
    ygprice:0.00,
    yhprice:0.00,
    showCoupon:false,
    couponName:"",
    PersonalIds:"",
    Note:"",
    yehprice:0,
    changeTab:1,
    startYear:"" ,
    addArr:[],
    addIndex:"",
    addItem:{},
    startDate:"",
    startTime:"",
    timeArr:[],
    timeIndex:"",
    carTypeList:[],
    carType:"",
    pnums:0,
    agree:false,
    isshow:false,
    isXia:true,
    isShowModal:false,
   // endYear:""
  },
  onLoad: function (opt) {
    let _this = this;
    _this.getLineList();
    _this.mapCtx = wx.createMapContext("myMap");
    _this.getMyLocation();
    var wanDate = _this.getNewDate();
    //var endDate = _this.getFourDate();
    _this.setData({
      startYear:wanDate,
      startDate:wanDate,
      //endYear:endDate
    })
    _this.getNews();
  },
  getNews(){
    let that = this;
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        console.log(res)
        var content = res.data.Content;
        const WxParses = require('../wxParse/wxParse.js');
        WxParses.setImageDomain(BASE_URL);
        WxParses.wxParse('content','html', content, that, 5);
      }
    }, err => {
      console.log(err)
    })
  },
  getNewDate(){
    var date = new Date();
    var year = date.getFullYear();  // 年份
    var month = date.getMonth() + 1;  // 月份，返回值为0-11，所以需要加1
    var day = date.getDate();  // 日期
    month = month < 10 ? '0' + month : month.toString();
    day = day < 10 ? '0' + day : day.toString();
    var wanDate = year +'-'+ month +'-'+ day;
    return wanDate;
  },
  getFourDate(){
    var date = new Date();
    date.setDate(date.getDate()+4);
    var year = date.getFullYear();  // 年份
    var month = date.getMonth() + 1;  // 月份，返回值为0-11，所以需要加1
    var day = date.getDate();  // 日期
    month = month < 10 ? '0' + month : month.toString();
    day = day < 10 ? '0' + day : day.toString();
    var wanDate = year +'-'+ month +'-'+ day;
    return wanDate;
  },
  onShow(){
    if(wx.getStorageSync('lineIndex')){
      this.setData({
        addIndex:wx.getStorageSync('lineIndex')
      })
      this.getLineList();
    }
    if(wx.getStorageSync('startDate')){
      this.setData({
        startDate:wx.getStorageSync('startDate'),
        timeIndex:wx.getStorageSync('timeIndex'),
        timeArr:wx.getStorageSync('timeArr')
      })
    }
    if(wx.getStorageSync('startInfo')){
      var infos = wx.getStorageSync('startInfo');
      var endInfos = wx.getStorageSync('endInfo');
      this.setData({
        strAddress:infos.startAddress
      });
      this.driving(infos.startLait,infos.startLont,endInfos.endLati,endInfos.endLong);
      console.log('这里调用的')
      this.getPriceListForLineId();
    }
    if(wx.getStorageSync('endInfo')){
      var endInfos = wx.getStorageSync('endInfo');
      var startInfos = wx.getStorageSync('startInfo');
      this.setData({
        endAddress:endInfos.endAddress,
        latitude:startInfos.startLait,
        longitude:startInfos.startLont,
        markers: [{
          id: 0,
          latitude:startInfos.startLait,
          longitude:startInfos.startLont,
          iconPath: '/assets/images/end.png',
          width: 30,
          height: 30,
          callout: {
            content:startInfos.startAddress, //文本
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
          latitude:endInfos.endLati,
          longitude:endInfos.endLong,
          iconPath: '/assets/images/start.png',
          width: 30,
          height: 30,
          callout: {
            content:endInfos.endAddress, //文本
            bgColor: "#fff", //背景色
            padding: "10px 30px", //文本边缘留白
            borderRadius: "15px", //边框圆角
            borderWidth: "1px", //边框宽度
            borderColor: "#ccc", //边框颜色
            color: '#000', //文字颜色
            textAlign: 'center', //对其方式,
            display: 'ALWAYS', //常显  BYCLICK点击显示
          }
        }
        ]
      });
      this.driving(startInfos.startLait,startInfos.startLont,endInfos.endLait,endInfos.endLont);
      this.getPriceListForLineId();
    }
    if(wx.getStorageSync('totalNum')){
      this.setData({
        personNum:wx.getStorageSync('totalNum'),
        Note:wx.getStorageSync('note')?wx.getStorageSync('note'):"",
        PersonalIds:wx.getStorageSync('personStr')
      })
      this.getPriceInfo();
    }
    console.log("456",wx.getStorageSync('cartypelist'))
    if(wx.getStorageSync('cartypelist')){
      var index = wx.getStorageSync('cartype');
      var arr = wx.getStorageSync('cartypelist');
      
      this.setData({
        carType:wx.getStorageSync('cartype'),
        carTypeList:wx.getStorageSync('cartypelist'),
        pnums:arr[index].SeatNumber,
        addArr:wx.getStorageSync('addArr'),
        addIndex:wx.getStorageSync('lineIndex')
      })
      console.log('这里没有执行')
      this.getTimeListForDate();
    }
  },

  // 驾车路线
  driving(str1, str2, end1, end2) {
    var _this = this;
    var data = {
      "origin":str1+","+str2,
      "destination":end1+","+end2
    }
    if(str1!="" && str2!="" && end1!="" && end2!=""){
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
    }
    //调用距离计算接口
    // qqmapsdk.direction({
    //   mode: 'driving',
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
    //         color: '#4dd08b',
    //         width: 4,
    //         arrowLine: true
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
  getLineList(){
    let that = this;
    http.getRequest('/Api/DispatchMobile/getPassengerLine?page=1&limit=10&city=','', wx.getStorageSync('header'), res => {
      if(res.code==0){
        if(res.data.length>0){
          that.setData({
            addArr:res.data,
          });
        }
      }else{
        wx.showToast({
          title: '数据请求失败，请稍后重试',
          icon:"error"
        })
      }
    }, err => {
      console.log(1111,err)
    })
  },
  addChange(e){
    let that = this;
    var list = that.data.addArr
    that.setData({
      addIndex:e.detail.value,
      addItem:list[e.detail.value]
    })
    wx.setStorageSync('lineIndex',e.detail.value);
    
    let driving_route = list[e.detail.value]
    // let Location =driving_route.EndLocation_Latitude + "," + driving_route.EndLocation_Longitude + ";" + driving_route.StatingLocation_Latitude + "," + driving_route.StatingLocation_Longitude;
    
    // wx.request({
    //   url:'https://qecs.sxkhyx.com/api/MapWebApi/TencentToBaiduLatLng?LatLngs=' + Location,
    //   method:"POST",
    //   success:(res)=>{
    //     let arrs = res.data.data;
    //     console.log(arrs)
    //     driving_route.EndLocation_Latitude = arrs[0].Item1
    //     driving_route.EndLocation_Longitude = arrs[0].Item2
    //     driving_route.StatingLocation_Latitude = arrs[1].Item1
    //     driving_route.StatingLocation_Longitude = arrs[1].Item2
    //     console.log(list[0])
    //     console.log(driving_route)
        
        
    //   }
    // })
    wx.setStorageSync('lineItme',list[e.detail.value]);
    wx.setStorageSync('addArr',list);
    //that.getPriceListForLineId();
    
  },
  // 叫车
  callCar:throttle(function(){
    var openid = wx.getStorageSync('openid');
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    if(!this.data.isXia){
      return false;
    }
    var phoneNumber = wx.getStorageSync('phoneNumber')
    var user = wx.getStorageSync('userInfo');
    var lineItem = wx.getStorageSync('lineItme');
    var line_id = lineItem.Id;//路线ID
    var startInfo = wx.getStorageSync('startInfo');
    var endInfo = wx.getStorageSync('endInfo');
    var timeArr = wx.getStorageSync('timeArr');
    var timeIndex = wx.getStorageSync('timeIndex');
    var nums = wx.getStorageSync('totalNum');
    var personStr = wx.getStorageSync('personStr');//17601636466|张晓峰,17601636466|张大峰
    var note =wx.getStorageSync('note');//空值
    var cartype = wx.getStorageSync('cartypelist');
    var cartypeindex = wx.getStorageSync('cartype');
    var phoneStr = wx.getStorageSync('phoneStr');
    var startDate = this.data.startDate;
    if(!startInfo.startAddress){
      wx.showToast({
        title: '请选择出发乘车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(!endInfo.endAddress){
      wx.showToast({
        title: '请选择下车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(!timeIndex){
      wx.showToast({
        title: '请选择出行时间',
        icon:"none",
        duration:2000
      })
      return false;
    }
    if(!nums){
      wx.showToast({
        title: '请选择乘车人',
        icon:'none',
        duration:2000
      })
      return false;
    }
    let reqData = {
      PassengerLineId:line_id,
      IntoLocation:startInfo.startAddress,
      IntoLongitude:startInfo.startLont,
      IntoLatitude:startInfo.startLait,
      OffLocation:endInfo.endAddress,
      OffLongitude:endInfo.endLont,
      OffLatitude:endInfo.endLait,
      PassengerNumber:nums,//几人
      Departure:app.globalData.nowOrFutureId==1?"100004-0000980001":"100004-0000980002",
      ArrivalTime:timeArr[timeIndex].HappenTime,//几点到几点
      Personal:user.Id,//下单人id
      SeatNumber:0,
      DispatchListId:"",
      IsReservation:"100004-0000010002",
      CouponDetailsId:this.data.hasChooseId?this.data.hasChooseId:"",//优惠券id
      PersonalIds:personStr,
      Note:note,
      IsExclusive:"100004-0000010002",
      IsPickGoods:'100004-0000010002',
      SelectCarType:cartype[cartypeindex].Id,//车的id
      OrderSource:"小程序"
    };
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone='+phoneStr+'&timeDay='+startDate,'','', res => {
      if(res.code==0){
        if(res.count==0){
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
                wx.removeStorageSync('lineIndex');
                wx.removeStorageSync('lineItme');
                wx.removeStorageSync('startInfo');
                wx.removeStorageSync('endInfo');
                wx.removeStorageSync('totalNum');
                wx.removeStorageSync('personStr');
                wx.removeStorageSync('note');
                wx.removeStorageSync('startDate');
                wx.removeStorageSync('startTime');
                wx.removeStorageSync('timeIndex');
                wx.removeStorageSync('timeArr');
                wx.removeStorageSync('cartype');
                wx.removeStorageSync('cartypelist');
                wx.hideLoading();
                that.setSubscribeMessage();
                wx.reLaunch({
                  url: '/user_center/pages/payDetail/payDetail?orderId='+ress.data.Id+"&from=orderList"
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
        }else{
          var list = res.data;
          var str ="";
          list.forEach(function(item,index){
            str += item.PassengerLineId_Name+","+"订单号为:"+item.Code+"\n"
          });
          wx.showModal({
            title: '下单记录',
            content: str,
            cancelText:"取消下单",
            confirmText:"继续下单",
            complete: (res) => {
              if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/index/index',
                }) 
              }
              if (res.confirm) {
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
                      wx.removeStorageSync('lineIndex');
                      wx.removeStorageSync('lineItme');
                      wx.removeStorageSync('startInfo');
                      wx.removeStorageSync('endInfo');
                      wx.removeStorageSync('totalNum');
                      wx.removeStorageSync('personStr');
                      wx.removeStorageSync('note');
                      wx.removeStorageSync('startDate');
                      wx.removeStorageSync('startTime');
                      wx.removeStorageSync('timeIndex');
                      wx.removeStorageSync('timeArr');
                      wx.removeStorageSync('cartype');
                      wx.removeStorageSync('cartypelist');
                      wx.hideLoading();
                      that.setSubscribeMessage();
                      wx.reLaunch({
                        url: '/user_center/pages/payDetail/payDetail?orderId='+ress.data.Id+"&from=orderList"
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
              }
            }
          })
        }
      }else{
        wx.showToast({
          title: '数据请求失败，请稍后重试111',
          icon:"error"
        })
      }
    }, err => {
      console.log(1111,err)
    })
  },5000),
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
  onExchangeItem(item){
    this.setData({
      hasChooseId:item.detail.Id,
      couponName:item.detail.CouponType_Name+' 优惠'+item.detail.CouponMoney+"元",
      curCouponData:item.detail
    })
    this.getPriceInfo();
  },
  //定位当前位置
  getMyLocation() {
    var _self = this;
    var BMap = new bmap.BMapWX({
      ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
    });
    BMap.regeocoding({  
      success:function(res){
        var data = res.wxMarkerData[0];
        console.log('拼车当前位置',data)
        _self.setData({
          latitude: data.latitude,
          longitude: data.longitude
          // latitude: 37.151006708340155,
          // longitude: 111.78597883343589
        })
      } 
    });  
    // wx.getLocation({
    //   type: "gcj02",
    //   success(res) {
    //     _self.setData({
    //       latitude: res.latitude,
    //       longitude: res.longitude
    //     })
    //   },
    //   fail(err) {
    //     console.log(err);
    //   }
    // })
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
    let that = this;
    if(that.data.addIndex){
      wx.navigateTo({
        url: '/pages/starting/starting?type=pc',
      })
    }else{
      wx.showToast({
        title: '请先选择线路',
        icon:'none'
      })
    }
  },
  toEnding() {
    let that = this;
    if(that.data.addIndex){
      wx.navigateTo({
        url: '/pages/ending/ending?type=pc',
      })
    }else{
      wx.showToast({
        title: '请先选择线路',
        icon:'none'
      })
    }
  },
  choosePerson(){
    var pnums = this.data.pnums;
    var openid = wx.getStorageSync('openid');
    if(openid){
      wx.navigateTo({
        url: '/pages/choosePerson/choosePerson?pnums='+pnums
      })
    }else{
      wx.navigateTo({
        url:'/user_center/pages/login/login'
      })
    }
  },
  getPriceInfo() {
    let that = this;
    var num = wx.getStorageSync('totalNum');
    var index = wx.getStorageSync('cartype');
    var list = wx.getStorageSync('cartypelist');
    var item = list[index];
    var price = num *(item.Price+Number(item.Version));
    var oprice = num*item.OriginalPrice;
    if(that.data.hasChooseId){
      var couData = that.data.curCouponData;
      that.setData({
        ygprice:price-couData.CouponMoney,
        yhprice:oprice-price+couData.CouponMoney,
        yehprice:0
      })
    }else{
      that.setData({
        ygprice:price,
        yhprice:oprice-price,
        yehprice:0
      })
    }
  },
  showCoupon(){
    console.log(this.data.ygprice)
    this.setData({
      showCoupon: true,
      isFromIcon: true,
      slideCouponParams:{
        money:this.data.ygprice
      }
    })
  },
   onHasChooseCouponData(e) {
    this.setData({
      curCouponData: e.detail.data,
      totalPrice: e.detail.data.singlePrice,
    })
  },

  //出行日期点击确定
  bindDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    })
    wx.setStorageSync('startDate', e.detail.value);
    wx.removeStorageSync('timeArr');
    wx.removeStorageSync('timeIndex');
    this.setData({
      timeIndex:""
    })
    this.getTimeListForDate();
  },
  getTimeListForDate(){
    let that = this;
    
    if(that.data.addIndex == '') {
      wx.showToast({
          title: '请选择出行路线',
          icon: 'none',
      })
      return
    }
    var line_id = that.data.addArr[that.data.addIndex].Id;
    var startDate = that.data.startDate;
    var seatnumber = that.data.SeatNumber;
    if(line_id && startDate){
      http.getRequest('/Api/DispatchMobile/getTimeListForDate?time='+startDate+"&lineId="+line_id+"&type="+seatnumber,'', '', (res) => {
        if (res.code == '0') {
          console.log(res.data)
          that.setData({
            timeArr:res.data
          })
        }
      }, (err) => {
        console.log(err)
      })
    }
  },
  //点击出行时间
  handleTap(){
    if(this.data.timeArr == '') {
      wx.showToast({
        title: '请先选择出行日期',
        icon:'none',
      })
    }
  },
  //出行时间点击确定
  bindTimeChange(e){
    let that = this;
    var value = e.detail.value;
    that.setData({
      timeIndex:value,
      startTime:that.data.timeArr[value].HappenTime
    })
    wx.setStorageSync('startTime',that.data.timeArr[value].RunTimeShow);
    wx.setStorageSync('timeIndex',value);
    wx.setStorageSync('timeArr',that.data.timeArr);
    that.getPriceListForLineId();
  },
  getPriceListForLineId(){
    let that = this;
    var addArr = that.data.addArr;
    if(addArr.length>0){
      var line_id = addArr[that.data.addIndex].Id;
    }else{
      var lineItem = wx.getStorageSync('lineItme');
      var line_id = lineItem['Id'];
    }
    var starInfo = wx.getStorageSync('startInfo');
    var endInfo = wx.getStorageSync('endInfo');
    console.log(wx.getStorageSync('startTime'))
    var data =  {
      "IsExclusive": "100004-0000010002",
      "Id":line_id,
      "StartLat":starInfo.startLait,
      "StartLng": starInfo.startLont,
      "EndLat": endInfo.endLait,
      "EndLng": endInfo.endLont,
      "ArrivalTime":wx.getStorageSync('startTime')
    }; 
    if(line_id){
      console.log('请求',line_id)
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId',data, '', (res) => {
        if (res.code == '0') {
          var list = res.data
          that.setData({
            carTypeList:res.data,
            carType:0,
            pnums:list[0].SeatNumber,
            SeatNumber:list[0].SeatNumber
          })
          wx.setStorageSync('cartype',0);
          wx.setStorageSync('cartypelist',res.data);
          that.getTimeListForDate();
          that.getPriceInfo();
        }else{
          that.setData({
            isXia:false
          })
          console.log(res)
          if(res.msg!="请选择下车位置" && !that.data.isShowModal){
            wx.showModal({
              title: '服务范围提示',
              content: '不在营运线路范围内,下单请联系客服，电话:0351-6078977，是否电话？',
              confirmText:"确定",
              cancelText:"关闭",
              success (res) {
                that.setData({
                  isShowModal:false
                })
                if (res.confirm) {
                  wx.makePhoneCall({
                    phoneNumber:"0351-6078977",
                  })
                }
              }
            })
            that.setData({
              isShowModal:true
            })
          }
        }
      }, (err) => {
        console.log(err)
      })
    }  
  },
  chooseCarType(e){
    let that = this;
    var index = e.currentTarget.dataset.index;
    var pnums = e.currentTarget.dataset.nums;
    that.setData({
      carType:index,
      pnums:pnums,
      SeatNumber:that.data.carTypeList[index].SeatNumber
    })
    wx.setStorageSync('cartype',index);
    wx.setStorageSync('cartypelist',that.data.carTypeList);
    that.getPriceInfo();
    that.setData({
      timeIndex:""
    })
    that.getTimeListForDate();
  },
  showView(){
    let that = this;
    that.setData({
      isshow:true
    })
  },
  tongyi(){
    let that = this;
    that.setData({
      agree:true,
      isshow:false
    })
  },
  guanbi(){
    let that = this;
    that.setData({
      isshow:false,
      agree:false
    })
  }
})