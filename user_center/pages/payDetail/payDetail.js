// pages/payDetail/payDetail.js
// 统一支付详情页：biz = car（专车/拼车/包车，默认）| bus（大巴）| roundTrip（返程）
import http from '../../../utils/http';
import qqmapsdk from '../../../libs/qqMap';
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
var app = getApp();

// 各业务对应的接口配置
const BIZ_API = {
  car: {
    detailUrl: '/Api/DispatchMobile/GetOrderInfo',
    payUrl: '/Api/DispatchMobile/GoUnionPayOrderRide',
    refundUrl: '/Api/DispatchMobile/UnionPayRefundOrder'
  },
  bus: {
    detailUrl: '/api/BusMobile/GetOrderInfo',
    payUrl: '/api/BusMobile/GoUnionOrderPay',
    refundUrl: '/api/BusMobile/UnionPayRefundOrder'
  },
  roundTrip: {
    detailUrl: '/api/CarPromotion/RoundTripOrderInfo',
    payUrl: '/api/CarPromotion/GoRoundTripOrderPay',
    refundUrl: '/api/BusMobile/UnionPayRefundOrder'
  }
};

Page({
  data: {
    biz: 'car', // car | bus | roundTrip
    isClosed: false,
    startAddress: '',
    endAddress: '',
    isFriendDriver: null,
    driverInfo: {},
    costList: [],
    hasAdd: false,
    areaCode: null,
    detailData: null,
    callCar: false,
    fixedLine: false,
    BDFixedLine: false,
    priceTitle: '车费详情',
    exclusiveCar: false, // 包车
    taxi: false,
    fromOrderList: false,
    count: 0,
    showHid: false,
    controls: [],
    markers: [],
    points: [],
    driver: {},
    carId: "",
    Interval: null,
    datas: {
      srcLat: "",
      srcLng: "",
      desLat: "",
      desLng: ""
    },
    formTypeState: "",
    orderId: "",
    httpsUrl: "",
    steps: [],
    driver_name: '',
    driver_phone: '',
    userinfoId: '',
    orderTime: '',
    arrivalTime: '',
    mm: '05',
    ss: '00',
    status: 'active', // active | expired
    timer: null,
    inputValue: '', //弹框数据
    modalShow: false, //弹框数据
    modalValue: '', //弹框数据
    prompt: '',
    note:'',
    pay_btn:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderId = options.orderId;
    var biz = options.biz;
    if (biz !== 'bus' && biz !== 'roundTrip') {
      biz = 'car';
    }
    if (options.from && options.from === 'orderList') {
      wx.setNavigationBarTitle({
        title: '订单详情',
      })
      this.setData({
        fromOrderList: true
      })
    }
    var userinfo = wx.getStorageSync('userInfo');
    this.setData({
      userinfoId: userinfo.Id,
      orderId: orderId,
      biz: biz,
      httpsUrl: app.globalData.httpsUrl
    })
  },
  onShow() {
    setTimeout(() => {
      this.setData({
        pay_btn:false
      })
    }, 10000);
    if (this.data.biz === 'roundTrip') {
      this.getRoundTripOrderInfo();
    } else if (this.data.biz === 'bus') {
      this.getBusOrderInfo();
    } else {
      this.getOrderInfo();
      this.getBusOrderInfo();
    }
    this.getSijiLocation();
  },
  onUnload() {
    clearInterval(this.data.timer);
    clearInterval(this.data.Interval);
  },
  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({
        timer: null
      });
    }
  },

  startCountdown() {
    const orderTimeStr = this.data.orderTime.replace(/\s+/g, 'T'); // 转为 ISO 格式（兼容 iOS）
    console.log(orderTimeStr)
    const orderTime = new Date(orderTimeStr).getTime();
    console.log(orderTime)
    if (isNaN(orderTime)) {
      console.error('无效的下单时间格式');
      return;
    }

    // 计算截止时间：下单时间 + 5 分钟
    const deadline = orderTime + 5 * 60 * 1000; // 300000 毫秒

    const updateCountdown = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        // 已超时
        this.setData({
          status: 'expired',
          mm: '00',
          ss: '00'
        });
        this.clearTimer();
        // 可在此处触发订单状态更新（如调用云函数或 API）
        return;
      }

      // 计算剩余分钟和秒
      const totalSeconds = Math.floor(diff / 1000);
      const mm = Math.floor(totalSeconds / 60);
      const ss = totalSeconds % 60;

      this.setData({
        mm: mm.toString().padStart(2, '0'),
        ss: ss.toString().padStart(2, '0'),
        status: 'active'
      });
    };

    // 立即执行一次（避免首次延迟1秒）
    updateCountdown();

    // 每秒更新
    const timer = setInterval(updateCountdown, 1000);
    this.setData({
      timer
    });
  },
  updateProgress(index) {
    const steps = this.data.steps.map((step, i) => {
      if (i < index) return {
        ...step,
        status: 'done'
      };
      if (i === index) return {
        ...step,
        status: 'current'
      };
      return {
        ...step,
        status: 'pending'
      };
    });
    this.setData({
      steps
    });
  },
  /**
   * 大巴订单详情
   */
  getBusOrderInfo() {
    var userinfo = wx.getStorageSync('userInfo');
    var orderId = this.data.orderId;
    let data = {
      Personal: userinfo.Id,
      Id: orderId
    }
    if (!orderId) {
      return;
    }
    this.mapCtx = wx.createMapContext("map");
    http.postRequest(BIZ_API.bus.detailUrl, data, '', res => {
      if (res.code != 0) {
        return;
      }
      var detail = res.data || {};
      this.setData({
        detailData: detail,
        orderTime: detail.CreateDate,
        arrivalTime: detail.ArrivalTime,
        driver_name: detail.DispatchListId_DriverId_Name != null ? detail.DispatchListId_DriverId_Name.slice(0, 1) : '',
        driver_phone: detail.DispatchListId_DriverId_Phone,
        showHid: true,
        datas: {
          srcLat: detail.StatingLocation_lat,
          srcLng: detail.StatingLocation_lng,
          desLat: detail.EndLocation_lat,
          desLng: detail.EndLocation_lng
        },
        driverInfo: detail,
        carId: detail.DispatchListId_CarDirId,
        formTypeState: detail.FormState
      })
      this.drawBusLine(detail);
    }, err => {
      console.log(err)
    })
  },
  /**
   * 大巴订单路线图（优先使用详情接口返回的路线，没有则只标记起终点）
   */
  drawBusLine(detail) {
    var points = [{
      latitude: parseFloat(detail.StatingLocation_lat),
      longitude: parseFloat(detail.StatingLocation_lng)
    }, {
      latitude: parseFloat(detail.EndLocation_lat),
      longitude: parseFloat(detail.EndLocation_lng)
    }];
    var routes = detail.MapResponse && detail.MapResponse.Result && detail.MapResponse.Result.Routes;
    if (routes && routes.length) {
      var datas = routes[0];
      var arr = datas.Steps || [];
      var pl = [];
      for (var i = 0; i < arr.length; i++) {
        pl.push({
          latitude: arr[i].StartLocation.lat,
          longitude: arr[i].StartLocation.lng
        })
      }
      this.setData({
        polyline: [{
          points: pl,
          color: '#4dd08b',
          width: 4,
          arrowLine: true
        }],
        yjTimes: (datas.duration / 60).toFixed(2),
        countLen: (datas.distance / 1000).toFixed(2)
      })
    }
    this.mapCtx.includePoints({
      padding: [120],
      points: points,
    })
  },
  /**
   * 返程订单详情
   */
  getRoundTripOrderInfo() {
    var orderId = this.data.orderId;
    if (!orderId) {
      return;
    }
    http.getRequest(BIZ_API.roundTrip.detailUrl, {
      Id: orderId
    }, '', res => {
      if (res.code == 0) {
        this.setData({
          detailData: res.data
        })
      }
    }, err => {
      console.log(err)
    })
  },
  getOrderInfo() {
    var userinfo = wx.getStorageSync('userInfo');
    var orderId = this.data.orderId;
    let data = {
      MemberId: userinfo.Id,
      Id: orderId
    }
    if (orderId) {
      http.postRequest(BIZ_API.car.detailUrl, data, '', res => {
        if (res.code == 0) {
          res.data.ArrivalTime = this.getNewtime(res.data.ArrivalTime);
          let datass = []
          if (res.data.FormState_Name == "未派单") {
            datass = [{
                label: '下单成功',
                status: 'done'
              }, //  done  current  pending
              {
                label: '已派单',
                status: 'pending'
              },
              {
                label: '接送中',
                status: 'pending'
              },
              {
                label: '已完成',
                status: 'pending'
              }
            ]
          } else if (res.data.FormState_Name == "已派单") {
            datass = [{
                label: '下单成功',
                status: 'done'
              }, //  done  current  pending
              {
                label: '已派单',
                status: 'done'
              },
              {
                label: '接送中',
                status: 'pending'
              },
              {
                label: '已完成',
                status: 'pending'
              }
            ]
          } else if (res.data.FormState_Name == "已上车" || res.data.FormState_Name == "已下车") {
            datass = [{
                label: '下单成功',
                status: 'done'
              }, //  done  current  pending
              {
                label: '已派单',
                status: 'done'
              },
              {
                label: '接送中',
                status: 'done'
              },
              {
                label: '已完成',
                status: 'pending'
              }
            ]
          } else if (res.data.FormState_Name == "完成") {
            datass = [{
                label: '下单成功',
                status: 'done'
              }, //  done  current  pending
              {
                label: '已派单',
                status: 'done'
              },
              {
                label: '接送中',
                status: 'done'
              },
              {
                label: '已完成',
                status: 'done'
              }
            ]
          }
          if(res.data.Note != null) {
            this.setData({
              note:res.data.Note.split('-')[0]
            })
          }
          console.log(res.data)
          this.setData({
            // count:count,
            detailData: res.data,
            steps: datass,
            orderTime: res.data.CreateDate,
            arrivalTime: res.data.ArrivalTime,
            driver_name: res.data.DispatchListId_DriverId_Name != null ? res.data.DispatchListId_DriverId_Name.slice(0, 1) : '',
            driver_phone: res.data.DispatchListId_DriverId_Phone
          })
          this.startCountdown()
          //if(res.data.FormState=='100004-0001020006'){
          this.setData({
            showHid: true
          })
          var data = {};
          data = {
            'srcLat': res.data.IntoLatitude,
            'srcLng': res.data.IntoLongitude,
            'desLat': res.data.OffLatitude,
            'desLng': res.data.OffLongitude,
          };
          this.setData({
            datas: data,
            driverInfo: res.data,
            carId: res.data.DispatchListId_CarDirId,
            formTypeState: res.data.FormState
          })
          this.getLine();
        }
        //}
      }, err => {
        console.log(err)
      })
    }
  },
  handleCallDriver() {
    let _this = this;
    wx.showModal({
      title: "提示",
      content: "是否跳转联系司机？",
      confirmText: "确定",
      cancelText: "关闭",
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: _this.data.driver_phone,
          });
        }
      },
    });
  },
  getNewtime(originalDateTime) {
    var dateString = originalDateTime.replace(/-/g, '/');
    var date = new Date(dateString);
    // 获取年月日
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    // 获取小时并向下取整
    var hour = String(date.getHours()).padStart(2, '0');
    var nextHour = String(date.getHours() + 1).padStart(2, '0');

    // 组合成时间区间格式
    return `${year}-${month}-${day} ${hour}:00-${nextHour}:00`;
  },
  makePhoneCall() {
    //登录返回客服电话
    let servicePhone = wx.getStorageSync('servicePhone')
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

  accountRule() {
    wx.navigateTo({
      url: '/pages/priceRules/priceRules'
    })
  },
  recall() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  callBDDriverPhone(e) {
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function () {
        console.log('拨打成功')
      },
      fail: function () {
        console.log('拨打失败')
      }
    })
  },
  cancel(e) {
    let that = this;
    var orderId = e.currentTarget.dataset.ids;
    wx.showModal({
      title: '提示',
      content: '确定取消订单吗',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          if (that.data.biz === 'bus') {
            var usreinfo = wx.getStorageSync('userInfo');
            let params = {
              MemberId: usreinfo.Id,
              Id: orderId,
              Mark: ""
            }
            http.postRequest(BIZ_API.bus.refundUrl, params, wx.getStorageSync('header'), res => {
              if (res.code == 0) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 2000
                })
              } else {
                wx.showToast({
                  title: '取消失败',
                  icon: 'error'
                })
              }
            }, err => {
              console.log(err)
            })
          }
          wx.navigateTo({
            url: '/user_center/pages/orderCancel/orderCancel?orderId=' + orderId,
          })
        } else { //这里是点击了取消以后
        }
      }
    })
  },
  gotopay(e) {
    let that = this;
    var orderId = e.currentTarget.dataset.ids;
    var user = wx.getStorageSync('userInfo');
    let appid = wx.getStorageSync('appId')
    var payUrl = BIZ_API[that.data.biz].payUrl + '?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + user.Id;
    http.getRequest(payUrl, "", wx.getStorageSync('header'), (LayerOrderRes) => {
      console.log('请求成功', LayerOrderRes)
      if (LayerOrderRes.code == 0) {
        console.log('获取支付所需信息成功')
        var payData = LayerOrderRes.data
        console.log('拉起支+付')
        wx.requestPayment({
          timeStamp: payData.TimeStamp,
          nonceStr: payData.NonceStr,
          package: payData.Package,
          signType: payData.SignType,
          paySign: payData.PaySign,
          success(paymentRes) {
            console.log('支付成功')
            if (that.data.biz === 'roundTrip') {
              wx.reLaunch({
                url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + '&from=orderList&biz=roundTrip'
              })
              return;
            }
            wx.showModal({
              title: '预约成功',
              content: '订单已预约成功，司机将会在您出发前一小时联系你',
              showCancel: false, // 隐藏取消按钮，强制用户点击确认
              confirmText: '我知道了',
              success: function () {
                setTimeout(function () {
                  wx.reLaunch({
                    url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + "&from=orderList" + (that.data.biz === 'bus' ? '&biz=bus' : '')
                  })
                }, 1000)
                that.setSubscribeMessage();
              }
            })
          },
          fail(paymentErr) {
            console.log('拉起支付失败', paymentErr)
          }
        })
      } else {
        console.log('获取支付所需信息失败')
        wx.showToast({
          title: LayerOrderRes.msg,
          icon: 'success',
          duration: 2000,
        })
      }
    }, (LayerOrderRrr) => {
      console.log('请求失败', LayerOrderRrr)
    })
  },
  setSubscribeMessage: function () {
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
  isWithinOneHour(targetTimeString) {
    const now = new Date(); // 当前时间
    const targetTime = new Date(targetTimeString.replace(' ', 'T')); // 转换为 ISO 8601 格式

    // 如果目标时间无效，返回 false
    if (isNaN(targetTime.getTime())) {
      return false;
    }

    const diffMs = Math.abs(targetTime - now); // 时间差（毫秒）
    const oneHourMs = 60 * 60 * 1000; // 1 小时对应的毫秒数

    return diffMs <= oneHourMs;
  },

  onCancel() {
    console.log('点击取消')
    this.setData({
      modalShow: false
    });
  },
  onConfirm(e) {
    let that = this;
    var userinfo = wx.getStorageSync('userInfo');
    const value = e.detail.value;
    that.setData({
      inputValue: value,
      modalShow: false
    });
    const request = {
      "MemberId": userinfo.Id,
      "Id": that.data.orderId,
      "Mark": value
    }
    http.postRequest(BIZ_API[that.data.biz].refundUrl, request, '', (res) => {
      console.log('申请退款', res)
      if (res.code == 0) {
        wx.showToast({
          title: res.msg,
          icon: 'loading',
          duration: 3000
        });
        setTimeout(function () {
          wx.redirectTo({
            url: that.data.biz === 'car' ? '/user_center/pages/travelList/travelList' : '/pages/index/index',
          })
        }, 3000)
      } else if(res.code == 430) {
        wx.showModal({
          title: '提示',
          content: res.msg,
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showToast({
          title: '取消失败',
          icon: 'error'
        })
      }
    }, err => {
      console.log(err)
    })
  },
  tuikuan(e) {
    let that = this;
    that.setData({
      modalShow: true,
      modalValue: that.data.inputValue, // 可选：回显已有值
      orderId:e.currentTarget.dataset.ids
    });
    if (that.data.biz !== 'car' || !that.data.arrivalTime) {
      return;
    }
    let data1 = that.data.arrivalTime.split(' ')
    if (data1.length < 2) {
      return;
    }
    let data2 = data1[1].split('-')[0]
    let isNo = that.isWithinOneHour(data1[0] + ' ' + data2);
    if (isNo) {
      that.setData({
        prompt: "出发前一小时内取消订单将收取30%违约金，是否确认退款？"
      })
    }
  },
  toComment(e) {
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/driving_status/pages/comment/comment?orderId=' + orderId,
    })
  },
  getLine() {
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
    this.driving(data.srcLat, data.srcLng, data.desLat, data.desLng);
  },
  driving(str1, str2, end1, end2) {
    console.log('进来了没')
    var _this = this;
    let userInfo = wx.getStorageSync('userInfo')
    let reqData = {
      CreateUserId:userInfo.Id,
      Id:_this.data.orderId
    }
    wx.request({
      url: baseUrl + '/api/MapWebApi/GetDriverCarline',
      data:reqData,
      method:"POST",
      success(res) {
        console.log(res)
        if (res.data.code == 0) {
          var datas = res.data.data.Result.Routes[0];
          var arr = datas.Steps;
          var pl = [];
          console.log(arr)
          for (var i = 0; i < arr.length; i++) {
            pl.push({
              latitude: arr[i].StartLocation.lat,
              longitude: arr[i].StartLocation.lng
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
            yjTimes: (datas.duration / 60).toFixed(2),
            countLen: (datas.distance / 1000).toFixed(2)
          })
          console.log(_points)
          _this.mapCtx.includePoints({
            padding: [120],
            points: _points,
          })
        }
        
      },
    })
  },
  moveCar(latitude, longitude) {
    this.mapCtx.translateMarker({
      markerId: 0,
      destination: {
        latitude: latitude,
        longitude: longitude,
      },
      autoRotate: true,
      rotate: -90,
      moveWithRotate: true
    })
  },
  handlePhone(e) {
    console.log(e.currentTarget.dataset.phone)
    wx.showModal({
      title: '拨打电话',
      content: '是否跳转联系司机？',
      success(res) {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: e.currentTarget.dataset.phone // 你要拨打的电话号码
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
  getSijiLocation() {
    let that = this;
    if (that.data.driverInfo.FormState == '100004-0001020006') {
      that.data.Interval = setInterval(() => {
        http.getRequest('/Api/DispatchMobile/getCarInfos?carId=' + that.data.carId, "", wx.getStorageSync('header'), (result) => {
          if (result.code == 0) {
            that.moveCar(result.data.Latitude, result.data.Longitude);
          }
        }, (err) => {
          console.log(err)
        })
      }, 6000);
    }
  },
  onHide() {
    let that = this;
    clearInterval(that.data.Interval);
  },
  toEnd(e) {
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/user_center/pages/changeEnd/changeEnd?orderId=' + orderId,
    })
  },
  xingcheng(e) {
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/driving_status/pages/taxiDriving/taxiDriving?orderId=' + orderId
    })
  },
  cancelChangeEnd(e) {
    let that = this;
    wx.showModal({
      title: '修改下车地点',
      content: '客服电话:0358-7684888' + "\n" + '手机号15935881588',
    })
  }
})
