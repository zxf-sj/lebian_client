import qqmapsdk from '../../../libs/qqMap';
import http from '../../../utils/http';
let curPageOnShow = false;
var startPoint;
const app = getApp();
Page({
  data: {
    driverImg: '/assets/images/driver.png',
    driverInfo: null,
    controls: [],
    markers: [],
    points: [],
    driver: {},
    carId:"",
    Interval:null,
    datas:{
      srcLat:"",
      srcLng:"",
      desLat:"",
      desLng:""
    },
    yujitime:0,
    httpsUrl:"",
    commentInterval:null,
    orderId:"",
  },
  onLoad: function (opt){
    let that = this;
    var orderId = opt.orderId;
    that.setData({
      httpsUrl:app.globalData.httpsUrl,
      orderId:orderId
    })
    that.getOrderInfo(orderId);
  },
  getSjWz(carId,IntoLatitude,IntoLongitude,infos,CarDirId){
    http.getRequest('/Api/DispatchMobile/getCarInfos?carId='+carId,"", wx.getStorageSync('header'), (result) => {
      if (result.code == 0) {
        var data = {};
        data = {
          'srcLat':result.data.Latitude?result.data.Latitude:infos.OffLatitude,
          'srcLng':result.data.Longitude?result.data.Longitude:infos.OffLongitude,
          'desLat':IntoLatitude,
          'desLng':IntoLongitude,
        };
        this.setData({
          datas:data,
          driverInfo:infos,
          carId:CarDirId
        })
        this.getLine();
      }
    }, (err) => {
      console.log(err)
    })
  },
  getOrderInfo(orderId){
    http.getRequest('/Api/DispatchMobile/getRideTicketOrderrDetail?orderId='+orderId,"", wx.getStorageSync('header'), (result) => {
      if (result.code == 0) {
        this.getSjWz(result.data.DispatchListId_CarDirId,result.data.IntoLatitude,result.data.IntoLongitude,result.data,result.data.DispatchListId_CarDirId);
      }
    }, (err) => {
      console.log(err)
    })
  },
  getLine(){
    let that = this;
    var data = that.data.datas
    this.mapCtx = wx.createMapContext("map");
    let _points = [{
      latitude: data.srcLat,
      longitude: data.srcLng
    }, {
      latitude: data.desLat,
      longitude: data.desLng
    }]
    this.mapCtx.includePoints({
      padding: [120],
      points: _points,
    })
    console.log(data);
    this.driving(data.srcLat,data.srcLng,data.desLat,data.desLng);
  },
  driving(str1, str2, end1, end2) {
    //console.log(str1,str2,end1,end2);
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
    //     pl = [];
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
    //         width: 8,
    //         arrowLine: true
    //       }],
    //       markers: [{
    //         iconPath: "/assets/images/mapCart.png",
    //         id: 0,
    //         latitude: str1,
    //         longitude: str2,
    //         width: 45,
    //         height: 45,
    //         callout: {
    //           content:"司机", //文本
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
    //         iconPath: "/assets/images/driver.png",
    //         id: 1,
    //         latitude: end1,
    //         longitude: end2,
    //         width: 45,
    //         height: 45,
    //         callout: {
    //           content:'乘客', //文本
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
    //       yujitime:res.result.routes[0].duration
    //     })
    //     _this.mapCtx.includePoints({
    //       padding: [120],
    //       points: _points,
    //     })
    //   },
    //   fail: function (error) {
    //     console.error(error);
    //   }
    // });
  },
  moveCar(latitude,longitude){
    this.mapCtx.translateMarker({
      markerId: 0,
      destination:{
        latitude:latitude,
        longitude:longitude,
      },
      autoRotate:true,
      rotate:0,
      moveWithRotate:true
    })
  },
  getSijiLocation(){
    let that = this;
    that.data.Interval = setInterval(() => {
      http.getRequest('/Api/DispatchMobile/getCarInfos?carId='+that.data.carId,"", wx.getStorageSync('header'), (result) => {
        if (result.code == 0) {
          console.log(result.data.Latitude,result.data.Longitude);
          that.moveCar(result.data.Latitude,result.data.Longitude);
        }
      }, (err) => {
        console.log(err)
      })
    },3000);
  },
  onShow() {
    this.getSijiLocation();
    this.toComment();
  },
  onHide() {
    let that = this;
    clearInterval(that.data.Interval);
    clearInterval(that.data.commentInterval);
  },
  
  onUnload(){
    let that = this;
    clearInterval(that.data.Interval);
    clearInterval(that.data.commentInterval);
  },
  toService() {
    let servicePhone = wx.getStorageSync('servicePhone');
    wx.makePhoneCall({
      phoneNumber: servicePhone,
      success: function () {
        console.log('拨打成功')
      },
      fail: function () {
        console.log('拨打失败')
      }
    })
  },
  callDriver(e) {
    console.log('电话号码：', e.currentTarget.dataset)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
      success() {
        console.log('拨打成功')
      }
    })
  },
  gotopay(e){
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/driving_status/pages/gotopay/gotopay?orderId='+orderId,
    })
  },
  toComment(){
    let that = this;
    that.data.commentInterval = setInterval(() => {
      http.getRequest('/Api/DispatchMobile/getRideTicketOrderrDetail?orderId='+that.data.orderId,"", wx.getStorageSync('header'), (result) => {
        if (result.code == 0) {
          if(result.data.FormState  == '100004-0001020004'){
            wx.showModal({
              title: '提示',
              content: '订单已经完成,是否去评价?',
              success (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/driving_status/pages/comment/comment?orderId='+that.data.orderId,
                  })
                } else if (res.cancel) {
                  wx.redirectTo({
                    url: '/user_center/pages/payDetail/payDetail?from=orderlist&orderId='+that.data.orderId,
                  })
                }
              }
            })
          }
        }
      }, (err) => {
        console.log(err)
      })
    },3000);
  },
  toEnd(e){
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/user_center/pages/changeEnd/changeEnd?orderId='+orderId,
    })
  },
  cancelChangeEnd(e){
    let that = this;
    var orderId = e.currentTarget.dataset.ids;
    http.getRequest("/Api/DispatchMobile/RideTicketOrderChangeLocationCancel?orderId="+orderId,'', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        wx.showToast({
          title:'操作成功',
          icon:'success',
          destination:2000,
          success:function(){
            setTimeout(function(){
              that.getOrderInfo();
            },2000)
          }
        });
      }else{
        wx.showToast({
          title: '取消失败',
          icon:'error'
        })
      }
    }, err => {
      console.log(err)
    })
  },
})