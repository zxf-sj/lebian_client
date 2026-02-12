const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
import http from '../../utils/http.js';
import qqmapsdk from '../../libs/qqMap';
var bmap =  require("../../libs/bmap-wx.min");
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
    carType:0,
    pnums:0,
    agree:false,
    isshow:false,
    isXia:true,
    isShowModal:false
  },
  onLoad: function (opt) {
    let _this = this;
    _this.getLineList();
    _this.getMyLocation();
    _this.mapCtx = wx.createMapContext("myMap");
    var date = new Date();
    var year = date.getFullYear();  // 年份
    var month = date.getMonth() + 1;  // 月份，返回值为0-11，所以需要加1
    var day = date.getDate();  // 日期
    month = month < 10 ? '0' + month : month.toString();
    day = day < 10 ? '0' + day : day.toString();
    var wanDate = year +'-'+ month +'-'+ day;
    _this.setData({
      startYear:wanDate,
      startDate:wanDate
    })
    wx.setStorageSync('startDate',wanDate);
    _this.getNews();
  },
  getNews(){
    let that = this;
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        var content = res.data.Content;
        const WxParses = require('../wxParse/wxParse.js');
        WxParses.setImageDomain(BASE_URL);
        WxParses.wxParse('content','html', content, that, 5);
      }
    }, err => {
      console.log(err)
    })
  },
  onShow(){
    if(wx.getStorageSync('lineIndex')){
      this.setData({
        addIndex:wx.getStorageSync('lineIndex')
      })
      this.getLineList();
      //this.getPriceListForLineId();
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
      console.log(endInfos)
      this.setData({
        strAddress:infos.startAddress
      })
      console.log(infos.startLait,infos.startLont,endInfos.endLait,endInfos.endLont)
      this.driving(infos.startLait,infos.startLont,endInfos.endLait,endInfos.endLont);
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
          latitude:startInfos.endLait,
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
          latitude:endInfos.endLait,
          longitude:endInfos.endLont,
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
      this.driving(startInfos.startLait,startInfos.startLont,endInfos.endLait,endInfos.endLong);
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
    if(wx.getStorageSync('cartypelist')){
      var index = wx.getStorageSync('cartype') == ''? 0 : wx.getStorageSync('cartype');
      var arr = wx.getStorageSync('cartypelist');
      console.log('index22',index)
      this.setData({
        carType:index,
        carTypeList:wx.getStorageSync('cartypelist'),
        pnums:arr[index].SeatNumber,
        addArr:wx.getStorageSync('addArr'),
        addIndex:wx.getStorageSync('lineIndex')
      })
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
    wx.setStorageSync('lineItme',list[e.detail.value]);
    wx.setStorageSync('addArr',list);
  },
  // 叫车
  callCar:throttle(function(){
    console.log('进来了')
    var openid = wx.getStorageSync('openid');
    console.log('进来了1')
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    console.log('进来了2',this.data.isXia)
    if(!this.data.isXia){
      return false;
    }
    console.log('进来了3')
    var phoneNumber = wx.getStorageSync('phoneNumber')
    var user = wx.getStorageSync('userInfo');
    var lineItem = wx.getStorageSync('lineItme');
    var line_id = lineItem.Id;
    var startInfo = wx.getStorageSync('startInfo');
    var endInfo = wx.getStorageSync('endInfo');
    var timeArr = wx.getStorageSync('timeArr');
    var timeIndex = wx.getStorageSync('timeIndex');
    var nums = wx.getStorageSync('totalNum');
    var personStr = wx.getStorageSync('personStr');
    var note =wx.getStorageSync('note');
    var cartype = wx.getStorageSync('cartypelist');
    var cartypeindex = wx.getStorageSync('cartype');
    var phoneStr = wx.getStorageSync('phoneStr');
    var startDate = this.data.startDate;
    console.log('1')
    if(!startInfo.startAddress){
      wx.showToast({
        title: '请选择出发乘车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    console.log('2')
    if(!endInfo.endAddress){
      wx.showToast({
        title: '请选择下车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    console.log('3')
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
    console.log('4',endInfo)
    let reqData = {
      PassengerLineId:line_id,
      IntoLocation:startInfo.startAddress,
      IntoLongitude:startInfo.startLont,
      IntoLatitude:startInfo.startLait,
      OffLocation:endInfo.endAddress,
      OffLongitude:endInfo.endLont,
      OffLatitude:endInfo.endLait,
      PassengerNumber:nums,
      Departure:app.globalData.nowOrFutureId==1?"100004-0000980001":"100004-0000980002",
      ArrivalTime:timeArr[timeIndex].HappenTime,
      Personal:user.Id,
      SeatNumber:"",
      DispatchListId:"",
      IsReservation:"100004-0000010002",
      CouponDetailsId:this.data.hasChooseId?this.data.hasChooseId:"",
      PersonalIds:personStr,
      Note:note,
      IsExclusive:"100004-0000010001",
      IsPickGoods:'100004-0000010002',
      SelectCarType:cartype[cartypeindex].Id,
      OrderSource:"小程序"
    }
    console.log('5')
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone='+phoneStr+'&timeDay='+startDate,'','', res => {
      console.log('6')
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
              console.log('7')
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
    wx.requestSubscribeMessage({
      tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'],
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
                console.log('用户点击确定');
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
  },
  footerTab(e){
    var cutap = e.currentTarget.dataset.current;
    if(cutap==1){
      this.setData({
        changeTab:cutap
      })
    }else{
      wx.showModal({
        title: '非营运线路包车',
        content: '咨询电话:0358-7684888'+"\n"+'手机号15935881588',
      })
    }
  },
  onExchangeItem(item){
    console.log(111,item);
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
        _self.setData({
          latitude: data.latitude,
          longitude: data.longitude
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
      wx.redirectTo({
        url: '/pages/starting/starting?type=dx',
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
      wx.redirectTo({
        url: '/pages/ending/ending?type=dx',
      })
    }else{
      wx.showToast({
        title: '请先选择线路',
        icon:'none'
      })
    }
  },
  choosePerson(){
    let pnums = this.data.pnums;
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
    var index = wx.getStorageSync('cartype');
    var list = wx.getStorageSync('cartypelist');
    var item = list[index];
    var price = item.Price+Number(item.Version);
    var oprice = item.OriginalPrice;
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
    var line_id = that.data.addArr[that.data.addIndex].Id;
    var startDate = that.data.startDate;
    if(line_id && startDate){
      http.getRequest('/Api/DispatchMobile/getTimeListForDate?time='+startDate+"&lineId="+line_id,'', '', (res) => {
        if (res.code == '0') {
          that.setData({
            timeArr:res.data
          })
        }
      }, (err) => {
        console.log(err)
      })
    }
  },
  bindTimeChange(e){
    console.log('调用了')
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
    var data =  {
      "IsExclusive": "100004-0000010001",
      "Id":line_id,
      "StartLat":starInfo.startLait,
      "StartLng": starInfo.startLont,
      "EndLat": endInfo.endLait,
      "EndLng": endInfo.endLont,
      "ArrivalTime":wx.getStorageSync('startTime')
    }; 
    if(line_id){
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId',data, '', (res) => {
        if (res.code == '0') {
          console.log('应该是车辆信息',res.data)
          var list = res.data
         var carTypes =  wx.getStorageSync('cartype') == '' ? 0 : wx.getStorageSync('cartype');
         console.log('这里改了',carTypes)
          that.setData({
            carTypeList:res.data,
            carType:carTypes,
            pnums:list[0].SeatNumber,
            SeatNumber:list[0].SeatNumber
          })
          wx.setStorageSync('cartype',carTypes);
          wx.setStorageSync('cartypelist',res.data);
          that.getTimeListForDate();
          that.getPriceInfo();
        }else{
          that.setData({
            isXia:false
          })
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
    console.log('切换了车')
    let that = this;
    var index = e.currentTarget.dataset.index;
    var pnums = e.currentTarget.dataset.nums;
    console.log('index',index)
    this.setData({
      carType:index,
      pnums:pnums
    })
    wx.setStorageSync('cartype',index);
    wx.setStorageSync('cartypelist',that.data.carTypeList);
    that.getPriceInfo();
    // that.setData({
    //   timeIndex:""
    // })
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