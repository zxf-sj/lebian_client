// pages/pingche2/pingche2.js
const throttle = require('../../utils/throttle.js').throttle;
const BASE_URL = require("../../utils/BASE_URL");
const debounce = require('../../utils/debounce');
var baseUrl = BASE_URL.BASE_URL //配置基础url

import http from '../../utils/http.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    couponList_list: [],
    huodong_list: null,
    isshow: false, //用户须知
    textareaValue: '', //备注信息
    remark: false, //点击备注信息显示弹框
    buttons: [{
      text: '确认', // 按钮文字
      type: 'default', // 按钮类型: 'default' | 'primary' | 'disabled'
      link: '' // 点击后跳转的页面路径
    }],
    aduit_num: 1, //成人人数
    phone_number: '', //手机号
    rangfenceMapList: [], //超范围列表
    price: '', //总价
    copy_price: 0,
    initialPrice: '', //初始票价
    version: 0, //超范围
    baseUrl: '',
    ChildPrice: '',
    actualAdultCountdata: 1, //计算最终需要按【成人票价】结算的总人数
    Outbound_startingCity: '',
    Outbound_endingCity: '',
    return_startingCity: '',
    return_endingCity: '',
    Outbound_startingAddress: '',
    Outbound_endingAddress: '',
    return_startingAddress: '',
    return_endingAddress: '',
    fromCarType: '',
    outSelId: '',
    retSelId: '',
    returnCarType: '',
    money: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    this.setData({
      Outbound_startingCity: options.from,
      Outbound_endingCity: options.to,
      return_startingCity: options.to,
      return_endingCity: options.from,
      fromCarType: options.fromCarType,
      outSelId: options.outSelId,
      retSelId: options.retSelId,
      returnCarType: options.returnCarType
    })
    //获取用户须知
    this.getNews()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let _this = this;
    this.setData({
      baseUrl
    })
    let from_starting = wx.getStorageSync('from_starting') || ''
    if (from_starting != '') {
      _this.setData({
        Outbound_startingAddress: from_starting.startName
      })
    }
    let from_ending = wx.getStorageSync('from_ending') || ''
    if (from_ending != '') {
      _this.setData({
        Outbound_endingAddress: from_ending.endName
      })
    }
    let to_starting = wx.getStorageSync('to_starting') || ''
    if (to_starting != '') {
      _this.setData({
        return_startingAddress: to_starting.startName
      })
    }
    let to_ending = wx.getStorageSync('to_ending') || ''
    if (to_ending != '') {
      _this.setData({
        return_endingAddress: to_ending.endName
      })
    }
    if (from_starting != '' && from_ending != '' && to_starting != '' && to_ending != '') {
      this.getqian(1)
    }
  },
  outbound_start() {
    let that = this;
    let lineId = ''
    if (that.data.Outbound_startingCity == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
    }
    wx.navigateTo({
      url: "/pages/starting3/starting3?direction=from_starting&lineId=" + lineId,
    });
  },
  outbound_end() {
    let that = this;
    let lineId = ''
    console.log(that.data.Outbound_endingCity)
    if (that.data.Outbound_endingCity == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
    }
    wx.navigateTo({
      url: "/pages/starting3/starting3?direction=from_ending&lineId=" + lineId,
    });
  },
  return_startingCity() {
    let that = this;
    let lineId = ''
    if (that.data.return_startingCity == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
    }
    wx.navigateTo({
      url: "/pages/starting3/starting3?direction=to_starting&lineId=" + lineId,
    });
  },
  return_end() {
    let that = this;
    let lineId = ''
    console.log(that.data.return_endingCity)
    if (that.data.return_endingCity == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
    }
    wx.navigateTo({
      url: "/pages/starting3/starting3?direction=to_ending&lineId=" + lineId,
    });
  },

  // 防抖处理后的主入口函数
  handleCallCar: throttle(function () {
    this._mainProcess();
  }, 3000),
  handletel() {
    let _this = this;
    if (_this.data.phone_number == '') {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      const reg = /^1[3-9]\d{9}$/;
      let isphone = reg.test(_this.data.phone_number);
      if (!isphone) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'error',
          duration: 2000
        })
        return false;
      } else {
        wx.showModal({
          title: '提示',
          content: '请确认手机号:' + _this.data.phone_number,
          success(res) {
            if (res.confirm) {
              _this.handleCallCar()
            } else if (res.cancel) {
              console.log('用户单击取消');
            }
          }
        });
      }
    }

  },
  // 1. 主流程控制
  async _mainProcess() {
    let _this = this;
    let GoLineId = '';
    let ReturnLineId = '';
    const accountInfo = wx.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;

    if (_this.data.Outbound_startingCity == '太原') {
      GoLineId = '300213-96f23d82cea647168541241650c39790'
      ReturnLineId = '300213-7bc4de5562764200a0610b630859d384'
    } else {
      GoLineId = '300213-7bc4de5562764200a0610b630859d384'
      ReturnLineId = '300213-96f23d82cea647168541241650c39790'
    }
    let Personal = wx.getStorageSync('userInfo');
    let from_starting = wx.getStorageSync('from_starting') || ''
    let from_ending = wx.getStorageSync('from_ending') || ''
    let to_starting = wx.getStorageSync('to_starting') || ''
    let to_ending = wx.getStorageSync('to_ending') || ''
    let parameter = {
      GoLineId,
      ReturnLineId,
      "Personal": Personal.Id,
      "AdultNumber": _this.data.aduit_num,
      "ChildNum": 0,
      "PersonalIds": _this.data.phone_number,
      "GoStartLat": from_starting.startLait,
      "GoStartLng": from_starting.startLont,
      "GoEndLat": from_ending.endLait,
      "GoEndLng": from_ending.endLont,
      "GoStartLocation": from_starting.startAddress,
      "GoEndLocation": from_ending.endAddress,
      "GoArrivalTime": _this.data.outSelId,
      "GoSelectCarType": _this.data.fromCarType,
      "ReturnStartLat": to_starting.startLait,
      "ReturnStartLng": to_starting.startLont,
      "ReturnEndLat": to_ending.endLait,
      "ReturnEndLng": to_ending.endLont,
      "ReturnStartLocation": to_starting.startAddress,
      "ReturnEndLocation": to_ending.endAddress,
      "ReturnArrivalTime": _this.data.retSelId,
      "ReturnSelectCarType": _this.data.returnCarType,
      "Note":_this.data.textareaValue
    }
    console.log('下单')
    wx.request({
      url: baseUrl + '/api/CarPromotion/CreatRoundTripOrder',
      data: parameter,
      method: "POST",
      success(res) {
        var ress = res.data
        console.log(ress)
        if (ress.code == '0') {
          wx.hideLoading();
          console.log('拿支付信息')
          http.getRequest('/api/CarPromotion/GoRoundTripPay?appid=' + appId + '&Id=' + ress.count + '&MemberInfoId=' + Personal.Id, "", wx.getStorageSync('header'), (res) => {
            console.log(res)
            if (res.code == 0) {
              var payData = res.data
              wx.requestPayment({
                timeStamp: payData.TimeStamp,
                nonceStr: payData.NonceStr,
                package: payData.Package,
                signType: payData.SignType,
                paySign: payData.PaySign,
                success(res) {
                  console.log('回调', res)
                  wx.removeStorageSync('from_starting');
                  wx.removeStorageSync('from_ending');
                  wx.removeStorageSync('to_starting')
                  wx.removeStorageSync('to_ending')
                  console.log('拉起支付')
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      console.log('支付成功')
                      setTimeout(function () {
                        wx.reLaunch({
                          url: '/user_center/pages/payDetail3/payDetail3?orderId=' + ress.count + "&from=orderList"
                        })
                      }, 1000)
                    }
                  })
                },
                fail(res) {
                  console.log('拉起支付失败', res)
                  wx.removeStorageSync('from_starting');
                  wx.removeStorageSync('from_ending');
                  wx.removeStorageSync('to_starting')
                  wx.removeStorageSync('to_ending')
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/user_center/pages/payDetail3/payDetail3?orderId=' + ress.count + "&from=orderList"
                    })
                  }, 1000)
                }
              })
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'success',
                duration: 2000,
              })
            }
          }, (err) => {
            console.log(err)
          })

        } else {
          wx.showToast({
            title: ress.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
    })


  },

  //成人人数+++
  adult_reduce() {
    
    let _this = this
    let aduit_num = _this.data.aduit_num;
    if (aduit_num > 1) {
      aduit_num -= 1
    }
    _this.setData({
      aduit_num,
    })
    this.getqian(aduit_num)
  },
  //成人人数---
  adult_add() {
    let _this = this
    let aduit_num = _this.data.aduit_num;
    aduit_num += 1
    _this.setData({
      aduit_num
    })
    this.getqian(aduit_num)
  },
  getqian(aduit_num) {
    let _this = this;
    let GoLineId = '';
    let ReturnLineId = '';
    if (_this.data.Outbound_startingCity == '太原') {
      GoLineId = '300213-96f23d82cea647168541241650c39790'
      ReturnLineId = '300213-7bc4de5562764200a0610b630859d384'
    } else {
      GoLineId = '300213-7bc4de5562764200a0610b630859d384'
      ReturnLineId = '300213-96f23d82cea647168541241650c39790'
    }
    let Personal = wx.getStorageSync('userInfo');
    let from_starting = wx.getStorageSync('from_starting') || ''
    let from_ending = wx.getStorageSync('from_ending') || ''
    let to_starting = wx.getStorageSync('to_starting') || ''
    let to_ending = wx.getStorageSync('to_ending') || ''
    let parameter = {
      GoLineId,
      ReturnLineId,
      "Personal": Personal.Id,
      "AdultNumber": aduit_num,
      "ChildNum": 0,
      "PersonalIds": _this.data.phone_number,
      "GoStartLat": from_starting.startLait,
      "GoStartLng": from_starting.startLont,
      "GoEndLat": from_ending.endLait,
      "GoEndLng": from_ending.endLont,
      "GoStartLocation": from_starting.startAddress,
      "GoEndLocation": from_ending.endAddress,
      "GoArrivalTime": _this.data.outSelId,
      "GoSelectCarType": _this.data.fromCarType,
      "ReturnStartLat": to_starting.startLait,
      "ReturnStartLng": to_starting.startLont,
      "ReturnEndLat": to_ending.endLait,
      "ReturnEndLng": to_ending.endLont,
      "ReturnStartLocation": to_starting.startAddress,
      "ReturnEndLocation": to_ending.endAddress,
      "ReturnArrivalTime": _this.data.retSelId,
      "ReturnSelectCarType": _this.data.returnCarType
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetRoundTripOrderMoney',
      data: parameter,
      method: "POST",
      success: (res) => {
        _this.setData({
          money: res.data.data
        })
      },
      fail(err) {
        console.log(err)
        wx.hideLoading()
      }
    })
  },
  //手机号
  person_phone: debounce(function (res) {
    let _this = this
    let phone_number = res.detail.value;
    const reg = /^1[3-9]\d{9}$/;
    let isphone = reg.test(phone_number);
    if (isphone) {
      _this.setData({
        phone_number
      })
    } else {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error',
        duration: 2000
      })
    }

  }, 500),
  //点击备注信息
  handleRemarks() {
    this.setData({
      remark: true
    })
  },
  //备注信息传值
  handleTextareaValue(res) {
    console.log(res.detail)
    this.setData({
      textareaValue: res.detail
    })
  },
  //用户须知
  showView() {
    let that = this;
    that.setData({
      isshow: true
    })
  },
  //用户须知__同意
  tongyi() {
    let that = this;
    that.setData({
      agree: true,
      isshow: false
    })
  },
  //用户须知__取消
  guanbi() {
    let that = this;
    that.setData({
      isshow: false,
      agree: false
    })
  },
  //获取用户须知
  getNews() {
    let that = this;
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        let content = res.data.Content;
        const WxParses = require('../wxParse/wxParse');
        WxParses.setImageDomain(BASE_URL);
        WxParses.wxParse('content', 'html', content, that, 5);
      }
    }, err => {
      console.log(err)
    })
  },

})