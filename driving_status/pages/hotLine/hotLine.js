// driving_status/pages/hotLine/hotLine.js
const BASE_URL = require("../../../utils/BASE_URL");
import http from '../../../utils/http';
var baseUrl = BASE_URL.BASE_URL //配置基础url
const throttle = require('../../../utils/throttle').throttle;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataItem: '',
    baseUrl: '',
    timeArr: [],
    arrivalTime: '',
    lvyou_date: '',
    starInfo: '',
    endInfo: '',
    starting_point: '',
    hcyj_weizhi: '',
    starInfo: '',
    lvyouTel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    let data = ''
    if (options.data) {
      data = JSON.parse(options.data)
      wx.setStorageSync('propeData', data)
    } else {
      data = wx.getStorageSync('propeData')
    }
    console.log(data)
    this.setData({
      dataItem: data,
      starting_point: data.Start,
      endting_point: data.End,
    })
  },
  onShow() {
    var _this = this;
    this.setData({
      baseUrl
    })
    let starInfo = wx.getStorageSync("starInfo2");
    let userInfo = wx.getStorageSync('userInfo')

    if (starInfo) {
      _this.setData({
        starting_point: starInfo.startName,
        hcyj_weizhi: starInfo.startName,
        starInfo
      })
      this.getlvyouCar()
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 补0
    const day = String(now.getDate()).padStart(2, '0'); // 补0
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formatToday = `${year}-${month}-${day}`;
    const times = `${hours}:${minutes}:${seconds}`;
    _this.setData({
      arrivalTime: formatToday + " " + times,
      lvyou_date: formatToday,
      lvyouTel: userInfo.Phone || ''
    })
    _this.getlvyouCar()
    _this.getTimeList(1)
    _this.getlvyouCar()
    _this.getHotLine()
  },
  //选择起点
  startingPoint() {
    let _this = this;
    wx.navigateTo({
      url: "/pages/starting2/starting2?direction=starting&type=hot&xianzhi=" + _this.data.dataItem.Start
    });
  },
  //选择终点
  endting_point() {
    // wx.navigateTo({
    //   url: "/pages/starting2/starting2?direction=ending&type=hot"
    // });
  },
  //旅游包车电话
  searchInputend(e) {
    let phone = e.detail.value.replace(/\D/g, '').slice(0, 11); // 只留数字，最多11位
    const valid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({
      lvyouTel: phone,
      lvyouTel_phoneError: valid ? '' : '*请输入正确手机号'
    });
  },
  //获取时间列表
  getTimeList(SwitchType) {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetTravelTimeListForDate",
      data: {
        SwitchType
      },
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          console.log(res.data.data)
          _this.setData({
            timeArr: res.data.data
          })
        }
      },
    });
  },
  //获取车型
  getlvyouCar() {
    let _this = this;
    if (_this.data.arrivalTime == '') {
      return
    }
    let openid = wx.getStorageSync('openid');
    let start_city = wx.getStorageSync('start_city')
    let line_Id = '';
    if (start_city) {
      if (start_city == "太原市") {
        line_Id = "300213-96f23d82cea647168541241650c39790"
      } else if (start_city == "孝义市") {
        line_Id = "300213-7bc4de5562764200a0610b630859d384"
      }
    }
    wx.request({
      url: baseUrl + "/api/DispatchMobile/GetTravelPriceListForLineId",
      data: {
        Id: line_Id,
        StartLat: _this.data.starInfo.startLait,
        StartLng: _this.data.starInfo.startLont,
        EndLat: _this.data.endInfo.endLait,
        EndLng: _this.data.endInfo.endLont,
        MemberId: openid,
        AdultNumber: "1",
        ArrivalTime: _this.data.arrivalTime,
        IsRoundTrip: _this.data.roundTrip
      },
      method: "POST",
      success: (res) => {
        // wx.removeStorageSync('start_city')
        if (res.data.code == 0) {
          _this.setData({
            carList: res.data.data,
            selectedCarId: res.data.data[0].Id
          })
        }
      },
    });
  },
  //获取热门线路
  getHotLine() {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetHotTravelLines",
      data: {},
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          console.log(res.data)
          _this.setData({
            hotLintList: res.data.data
          })
        }
      },
    });
  },
  submit: throttle(function () {
    let _this = this;
    if (_this.data.arrivalTime == '') {
      wx.showToast({
        title: '请选择出发日期',
        icon: 'none',
        duration: 2000
      })
      return
    }
    console.log('_this.data.lvyouTel', _this.data.lvyouTel)
    if (_this.data.lvyouTel == '') {
      wx.showToast({
        title: '请输入电话',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.selectedCarId == '') {
      wx.showToast({
        title: '请选择车型',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let line_Id = _this.data.dataItem.PassengerLineId

    var userInfo = wx.getStorageSync('userInfo');
    wx.request({
      url: baseUrl + "/api/DriverApp/CreateHotTravelLineOrder",
      data: {
        Id: _this.data.dataItem.Id,
        PassengerLineId: line_Id,
        IntoLocation: _this.data.starInfo.startAddress || _this.data.dataItem.Start,
        IntoLongitude: _this.data.starInfo.startLont || '',
        IntoLatitude: _this.data.starInfo.startLait || '',
        ArrivalTime: _this.data.arrivalTime,
        MemberId: userInfo.Id,
        Phone: _this.data.lvyouTel,
        SelectCarType: _this.data.selectedCarId,
        OrderSource: "小程序",

      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          http.getRequest('/api/DispatchMobile/GoHotTravelLineReservedPay?LayerOrder=1&Id=' + res.data.data.TravelReserved + '&MemberInfoId=' + userInfo.Id, "", wx.getStorageSync('header'), (LayerOrderRes) => {
            console.log('请求成功', LayerOrderRes)
            if (LayerOrderRes.code == 0) {
              console.log('获取支付所需信息成功')
              var data = JSON.parse(LayerOrderRes.data);
              console.log('拉起支+付', data)
              // wx.hideLoading();
              wx.requestPayment({
                timeStamp: data.timeStamp,
                nonceStr: data.nonceStr,
                package: data.package,
                signType: 'MD5',
                paySign: data.paySign,
                success(paymentRes) {
                  console.log('支付成功', paymentRes)
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      console.log('支付成功')
                      wx.removeStorageSync('start_city')
                      wx.removeStorageSync('start_city')
                      wx.removeStorageSync('starInfo2')
                      wx.removeStorageSync('endInfo2')
                      _this.setSubscribeMessage();
                      setTimeout(function () {
                        wx.reLaunch({
                          url: '/user_center/pages/payDetail/payDetail?orderId=' + res.data.data.Id + "&from=orderList"
                        })
                      }, 1000)
                    }
                  })
                }
              })
            } else if (LayerOrderRes.code == 400 && LayerOrderRes.msg == "已付款") {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000,
                success: function () {
                  console.log('支付成功2')
                  wx.removeStorageSync('start_city')
                  wx.removeStorageSync('start_city')
                  wx.removeStorageSync('starInfo2')
                  wx.removeStorageSync('endInfo2')
                  _this.setSubscribeMessage();
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                    })
                  }, 1000)
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
        }






      },
    });
  }, 5000),
  setSubscribeMessage: function () {
    console.log('调用通知')
    wx.showModal({
      title: '提示',
      content: '即将为您开启消息提醒',
      complete: (res) => {
        if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA', "LhKVmpSKt-FGzwYVDHB6UQpVrdZmMklLzcFJ6Ln_oJU"],
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})