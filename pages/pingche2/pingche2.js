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
    use_couponList: 0, //次卡使用张数
    isshow: false, //用户须知
    couponList: 0, //次卡张数
    showCoupon: false, //优惠卷弹框
    textareaValue: '', //备注信息
    remark: false, //点击备注信息显示弹框
    buttons: [{
      text: '确认', // 按钮文字
      type: 'default', // 按钮类型: 'default' | 'primary' | 'disabled'
      link: '' // 点击后跳转的页面路径
    }],
    aduit_num: 1, //成人人数
    child_num: 0, //儿童人数 
    carTypeList: [], //车型列表
    carType: 0, //车型选择下标
    seatNumber: 0, //座位数
    phone_number: '', //手机号
    rangfenceMapList: [], //超范围列表
    price: '', //总价
    copy_price: 0,
    initialPrice: '', //初始票价
    PromotionDiscountType: '', //9 正常 0 折扣 1 减
    PromotionDiscount: "", // 折扣值
    version: 0, //超范围
    baseUrl: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    this.setData({
      baseUrl
    })
  },
  //nav 切换时间
  nav_change_date() {
    console.log('nav_change_date')
    this.getCarList()
  },
  information_phone_number(e) {
    console.log(e.detail)
    this.setData({
      phone_number: e.detail
    })
  },
  //nav 切换线路
  nav_change_line() {
    this.setData({
      aduit_num: 1,
      child_num: 0,
      price: '',
      use_couponList: 0,
      carTypeList: [],
      rangfenceMapList: [],
      couponList: 0
    })
  },
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
              console.log('用户单击确定');
              _this.handleCallCar()
            } else if (res.cancel) {
              console.log('用户单击取消');
            }
          }
        });
      }
    }

  },
  // 叫车
  handleCallCar: throttle(function () {
    const _this = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    var user = wx.getStorageSync('userInfo');
    var startInfo = wx.getStorageSync('starInfo2');
    var endInfo = wx.getStorageSync('endInfo2');
    var storageSync = wx.getStorageSync('storageSync')
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    var pcTypeId = wx.getStorageSync('pcTypeId');
    var note = wx.getStorageSync('textareaValue');
    var startDate = storageSync.startDate;
    if (!startInfo.startAddress) {
      wx.showToast({
        title: '请选择出发乘车位置',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
    let ArrivalTime = startDate + ' ' + starTime
    let lineId = wx.getStorageSync('lineId')
    let reqData = {
      PassengerLineId: lineId,
      IntoLocation: startInfo.startName,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endName,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      Departure: "100004-0000980001",
      ArrivalTime: ArrivalTime,
      Personal: user.Id,
      SeatNumber: 0,
      DispatchListId: "",
      IsReservation: "100004-0000010002",
      CouponDetailsId: pcTimeSync.hasChooseId ? pcTimeSync.hasChooseId : "",
      PersonalIds: _this.data.phone_number,
      Note: _this.data.textareaValue, //备注信息
      IsExclusive: "100004-0000010002",
      IsPickGoods: '100004-0000010002',
      SelectCarType: pcTypeId,
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      AdultNumber: _this.data.aduit_num, //成人数
      ChildNum: _this.data.child_num, //儿童数
    };
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + _this.data.phone_number + '&timeDay=' + startDate, '', '', res => {
      if (res.code == 0) {
        if (res.count == 0) {
          if (this.data.dispatchListId) {
            wx.showLoading({
              title: '车辆调度中',
            })
          } else {
            wx.showLoading({
              title: '加载中...',
            })
          }
          let that = this;
          console.log('去下单', reqData)
          wx.request({
            // CreateRideTicketOrder 旧
            url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
            data: reqData,
            method: "POST",
            success(orderRes) {
              console.log('请求成功')
              var ress = orderRes.data
              if (ress.code == '0') {
                console.log('下单成功', ress)
                if (ress.data.PayAmount != 0) {
                  wx.hideLoading();
                  http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (LayerOrderRes) => {
                    console.log('请求成功', LayerOrderRes)
                    if (LayerOrderRes.code == 0) {
                      console.log('获取支付所需信息成功')
                      var data = JSON.parse(LayerOrderRes.data);
                      console.log('拉起支+付')
                      // wx.hideLoading();
                      // return
                      wx.requestPayment({
                        timeStamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: 'MD5',
                        paySign: data.paySign,
                        success(paymentRes) {
                          console.log('支付成功')
                          wx.removeStorageSync('starInfo2');
                          wx.removeStorageSync('endInfo2');
                          wx.removeStorageSync('storageSync')
                          wx.removeStorageSync('pcTimeSync')
                          wx.removeStorageSync('personNum')
                          wx.removeStorageSync('pcTypeId');
                          wx.removeStorageSync('SeatNumber')
                          wx.removeStorageSync('textareaValue');
                          wx.removeStorageSync('lineId');
                          wx.showToast({
                            title: '支付成功',
                            icon: 'success',
                            duration: 2000,
                            success: function () {
                              that.setSubscribeMessage();
                              setTimeout(function () {
                                wx.reLaunch({
                                  url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                })
                              }, 1000)
                            }
                          })
                        },
                        fail(paymentErr) {
                          wx.removeStorageSync('starInfo2');
                          wx.removeStorageSync('endInfo2');
                          wx.removeStorageSync('storageSync')
                          wx.removeStorageSync('pcTimeSync')
                          wx.removeStorageSync('personNum')
                          wx.removeStorageSync('pcTypeId');
                          wx.removeStorageSync('SeatNumber')
                          wx.removeStorageSync('textareaValue');
                          wx.removeStorageSync('lineId');
                          console.log('拉起支付失败', paymentErr)
                          setTimeout(function () {
                            wx.reLaunch({
                              url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                            })
                          }, 1000)
                        }
                      })
                    } else if (LayerOrderRes.code == 400 && LayerOrderRes.msg == "已付款") {
                      wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2000,
                        success: function () {
                          that.setSubscribeMessage();
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
                } else {
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                    })
                  }, 1000)
                }
              } else {
                console.log('下单失败')
                wx.showToast({
                  title: ress.msg,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
          })
        } else {
          console.log('res.count不为0')
          var list = res.data;
          var str = "";
          list.forEach(function (item, index) {
            str += item.PassengerLineId_Name + "," + "订单号为:" + item.Code + "\n"
          });
          wx.showModal({
            title: '下单记录',
            content: str,
            cancelText: "取消下单",
            confirmText: "继续下单",
            complete: (res) => {
              if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }
              if (res.confirm) {
                if (this.data.dispatchListId) {
                  wx.showLoading({
                    title: '车辆调度中',
                  })
                } else {
                  wx.showLoading({
                    title: '加载中...',
                  })
                }
                let that = this;
                // CreatePersonTicketOrder  新
                wx.request({
                  url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
                  data: reqData,
                  method: "POST",
                  success(orderRes) {
                    console.log('请求成功')
                    var ress = orderRes.data
                    if (ress.code == '0') {
                      console.log('下单成功', ress)
                      wx.hideLoading();
                      // wx.navigateTo({
                      //   url: '/driving_status/pages/gotopay/gotopay?orderId='+ress.data.Id,
                      // })
                      // console.log('去拿支付所需信息')
                      http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (LayerOrderRes) => {
                        console.log('请求成功', LayerOrderRes)
                        if (LayerOrderRes.code == 0) {
                          console.log('获取支付所需信息成功')
                          var data = JSON.parse(LayerOrderRes.data);
                          console.log('拉起支+付')
                          wx.requestPayment({
                            timeStamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            signType: 'MD5',
                            paySign: data.paySign,
                            success(paymentRes) {
                              console.log('支付成功')
                              wx.removeStorageSync('starInfo2');
                              wx.removeStorageSync('endInfo2');
                              wx.removeStorageSync('storageSync')
                              wx.removeStorageSync('pcTimeSync')
                              wx.removeStorageSync('personNum')
                              wx.removeStorageSync('pcTypeId');
                              wx.removeStorageSync('SeatNumber')
                              wx.removeStorageSync('textareaValue');
                              wx.removeStorageSync('lineId');
                              wx.showToast({
                                title: '支付成功',
                                icon: 'success',
                                duration: 2000,
                                success: function () {
                                  that.setSubscribeMessage();
                                  setTimeout(function () {
                                    wx.reLaunch({
                                      url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                    })
                                  }, 1000)
                                }
                              })
                            },
                            fail(paymentErr) {
                              wx.removeStorageSync('starInfo2');
                              wx.removeStorageSync('endInfo2');
                              wx.removeStorageSync('storageSync')
                              wx.removeStorageSync('pcTimeSync')
                              wx.removeStorageSync('personNum')
                              wx.removeStorageSync('pcTypeId');
                              wx.removeStorageSync('SeatNumber')
                              wx.removeStorageSync('textareaValue');
                              wx.removeStorageSync('lineId');
                              console.log('拉起支付失败', paymentErr)
                              setTimeout(function () {
                                wx.reLaunch({
                                  url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                })
                              }, 1000)
                            }
                          })
                        } else if (LayerOrderRes.code == 400 && LayerOrderRes.msg == "已付款") {
                          wx.showToast({
                            title: '支付成功',
                            icon: 'success',
                            duration: 2000,
                            success: function () {
                              that.setSubscribeMessage();
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

                    } else {
                      console.log('下单失败')
                      wx.showToast({
                        title: ress.msg,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  },
                })
              }
            }
          })
        }
      } else {
        console.log('请求失败', res)
        wx.showToast({
          title: '数据请求失败，请稍后重试' + res.msg,
          icon: "error"
        })
      }
    }, err => {
      console.log('下单失败', err)
    })
  }, 3000),
  setSubscribeMessage: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'],
      success(res) {
        console.log(res)
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
  },
  //获取车辆列表
  getCarList() {
    let that = this
    let starInfo2 = wx.getStorageSync('starInfo2')
    let endInfo2 = wx.getStorageSync('endInfo2')
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
    let ArrivalTime = startDate + ' ' + starTime
    var data = {
      "IsExclusive": '100004-0000010002',
      "Id": storageSync.lineId,
      "StartLat": starInfo2.startLait,
      "StartLng": starInfo2.startLont,
      "EndLat": endInfo2.endLait,
      "EndLng": endInfo2.endLont,
      "ArrivalTime": ArrivalTime
    };
    if (storageSync.lineId) {
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId', data, '', (res) => {
        if (res.code == '0') {
          //这里是默认值  默认选中第一辆车
          let data = res.data[0];
          if(!data.CarSeatState) {
            data = res.data[1]
            that.setData({
              carType:1
            })
          }
          wx.setStorageSync('pcTypeId', data.Id)
          console.log(data)
          console.log(data.CarSeatState)
          if (data.CarSeatState) {
            //默认座位数
            let seatNumber = data.SeatNumber + 1
            //默认价格 
            let price = 0
            // 0 折扣 1 减 9 没活动
            if (data.PromotionDiscountType == 0) {
              price = data.Price * data.PromotionDiscount
            } else if (data.PromotionDiscountType == 1) {
              price = data.Price - data.PromotionDiscount
            } else if (data.PromotionDiscountType == 9) {
              price = data.Price
            }
            if (data.Version) {
              price = price + Number(data.Version)
            }
            console.log(baseUrl + res.data[0].Note)
            that.setData({
              rangfenceMapList: data.rangfenceMapList, //超范围列表
              carTypeList: res.data, //车型列表
              seatNumber, //座位数
              price, //总价
              initialPrice: data.Price, //初始票价
              PromotionDiscountType: data.PromotionDiscountType,
              PromotionDiscount: data.PromotionDiscount,
              version: Number(data.Version)
            })
            //获取次卡张数
            that.reqChooseListData()
          } else {
            wx.showToast({
              title: '车位不可选',
              icon: 'error',
              duration: 2000
            })
          }
        }
      }, (err) => {
        console.log(err)
      })
    }
  },
  //点击车型
  chooseCarType(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let data = that.data.carTypeList[index]
    wx.setStorageSync('pcTypeId', data.Id)
    if (data.CarSeatState) {
      //默认座位数
      let seatNumber = data.SeatNumber + 1
      //默认价格 
      let aduit_price = 0
      // 0 折扣 1 减 9 没活动
      if (data.PromotionDiscountType == 0) {
        aduit_price = (data.Price * data.PromotionDiscount) * that.data.aduit_num
      } else if (data.PromotionDiscountType == 1) {
        aduit_price = (data.Price - data.PromotionDiscount) * that.data.aduit_num
      } else if (data.PromotionDiscountType == 9) {
        aduit_price = data.Price * that.data.aduit_num
      }
      let child_price = data.Price / 2 * that.data.child_num;
      let price = child_price + aduit_price
      if (data.Version) {
        price = price + (data.Version * (that.data.aduit_num + that.data.child_num))
      }
      that.setData({
        rangfenceMapList: data.rangfenceMapList, //超范围列表
        seatNumber, //座位数
        price, //总价
        carType: index, //车型选中下标
        initialPrice: data.Price, //初始票价
        PromotionDiscountType: data.PromotionDiscountType,
        PromotionDiscount: data.PromotionDiscount,
        version: Number(data.Version),
        use_couponList: 0
      })
      //获取次卡张数
      that.reqChooseListData()
      let pcTimeSync = wx.getStorageSync('pcTimeSync');
      if (pcTimeSync.hasChooseId) {
        delete pcTimeSync.hasChooseId;
        wx.setStorageSync('pcTimeSync', pcTimeSync);
      }
    } else {
      wx.showToast({
        title: '车位不可选',
        icon: 'error',
        duration: 2000
      })
    }
  },
  //计算总价
  total_Price() {
    let _this = this;
    //默认价格 
    let aduit_price = 0
    let child_price = 0
    let version_price = 0
    // 0 折扣 1 减 9 没活动
    if (_this.data.PromotionDiscountType == 0) {
      aduit_price = _this.data.initialPrice * _this.data.PromotionDiscount * _this.data.aduit_num
    } else if (_this.data.PromotionDiscountType == 1) {
      aduit_price = (_this.data.initialPrice - _this.data.PromotionDiscount) * _this.data.aduit_num
    } else if (_this.data.PromotionDiscountType == 9) {
      aduit_price = _this.data.initialPrice * _this.data.aduit_num
    }
    child_price = (_this.data.initialPrice / 2) * _this.data.child_num
    if (_this.data.version > 0) {
      version_price = (_this.data.aduit_num + _this.data.child_num) * Number(_this.data.version)
    }
    let all_price = aduit_price + child_price + version_price;
    _this.setData({
      price: all_price
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
      use_couponList: 0
    })
    _this.total_Price()
    _this.reqChooseListData()
    let pcTimeSync = wx.getStorageSync('pcTimeSync');
    if (pcTimeSync.hasChooseId) {
      delete pcTimeSync.hasChooseId;
      wx.setStorageSync('pcTimeSync', pcTimeSync);
    }
  },
  //成人人数---
  adult_add() {
    let _this = this
    let aduit_num = _this.data.aduit_num;
    if (_this.data.child_num + aduit_num < _this.data.seatNumber) {
      aduit_num += 1
      _this.setData({
        aduit_num,
        use_couponList: 0
      })
      _this.total_Price()
      _this.reqChooseListData()
      let pcTimeSync = wx.getStorageSync('pcTimeSync');
      if (pcTimeSync.hasChooseId) {
        delete pcTimeSync.hasChooseId;
        wx.setStorageSync('pcTimeSync', pcTimeSync);
      }
    } else {
      wx.showToast({
        title: '乘客人数超过座位数',
        icon: 'error',
        duration: 2000
      })
    }
  },
  //儿童人数+++
  chind_reduce() {
    let _this = this
    let child_num = _this.data.child_num;
    console.log(child_num)
    if (child_num > 0) {
      child_num -= 1
    }
    _this.setData({
      child_num,
      use_couponList: 0
    })
    _this.reqChooseListData()
    _this.total_Price()
    let pcTimeSync = wx.getStorageSync('pcTimeSync');
    if (pcTimeSync.hasChooseId) {
      delete pcTimeSync.hasChooseId;
      wx.setStorageSync('pcTimeSync', pcTimeSync);
    }
  },
  //儿童人数---
  chind_add() {
    let _this = this
    let child_num = _this.data.child_num;
    if (_this.data.aduit_num + child_num < _this.data.seatNumber) {
      child_num += 1
      _this.setData({
        child_num,
        use_couponList: 0
      })
      _this.total_Price()
      _this.reqChooseListData()
      let pcTimeSync = wx.getStorageSync('pcTimeSync');
      if (pcTimeSync.hasChooseId) {
        delete pcTimeSync.hasChooseId;
        wx.setStorageSync('pcTimeSync', pcTimeSync);
      }
    } else {
      wx.showToast({
        title: '乘客人数超过座位数',
        icon: 'error',
        duration: 2000
      })
    }
  },
  //手机号
  person_phone: debounce(function (res) {
    let _this = this
    let phone_number = res.detail.value;
    // const reg = /^1[3-9]\d{9}$/;
    // let isphone = reg.test(phone_number);
    // if (isphone) {
      _this.setData({
        phone_number
      })
    // } else {
    //   wx.showToast({
    //     title: '请输入正确的手机号',
    //     icon: 'error',
    //     duration: 2000
    //   })
    // }

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
  //调起次卡
  showCoupon() {
    this.setData({
      showCoupon: true
    })
    // }

  },
  //获取次卡张数
  reqChooseListData() {
    var pcTypeId = wx.getStorageSync('pcTypeId');
    var userinfo = wx.getStorageSync('userInfo');
    let lineId = wx.getStorageSync('lineId') || {};
    var pcTimeSync = wx.getStorageSync('pcTimeSync');
    let data1 = pcTimeSync.propsDay.split('/');
    let data2 = data1[0] + '-' + data1[1]
    let data = {
      MemberId: userinfo.Id,
      Money: 2,
      LinkId: lineId,
      SelectCarType: pcTypeId,
      ToDay: data2
    }
    http.postRequest("/api/CarPromotion/UseCanCoupon", data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        this.setData({
          couponList: res.data.length
        })
      } else {
        this.setData({
          couponList: 0
        })
      }
    }, err => {
      console.log(err)
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
      console.log(res)
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
  //点击使用优惠卷传过来的值
  onExchangeItem(item) {
    console.log(item)
    let _this = this;
    let price = ''
    if (_this.data.copy_price != 0) {
      price = _this.data.copy_price
    } else {
      price = _this.data.price
      _this.setData({
        copy_price: _this.data.price
      })
    }
    _this.setData({
      use_couponList: item.detail.length,
    })
    if (item.detail.length > 0) {
      let aduit_price = []
      for (let i = 0; i < _this.data.aduit_num; i++) {
        if (_this.data.PromotionDiscountType == 0) {
          aduit_price.push(_this.data.initialPrice * _this.data.PromotionDiscount)
        } else if (_this.data.PromotionDiscountType == 1) {
          aduit_price.push(_this.data.initialPrice - _this.data.PromotionDiscount)
        } else if (_this.data.PromotionDiscountType == 9) {
          aduit_price.push(_this.data.initialPrice)
        }
      }
      let child_price = []
      if (_this.data.child_num > 0) {
        for (let i = 0; i < _this.data.child_num; i++) {
          child_price.push(_this.data.initialPrice / 2)
        }
      }
      let priceList = [...aduit_price, ...child_price]
      let Jlength = item.detail.length //几张次卡
      let allPrice = this.getRemainingSum(priceList, Jlength)
      this.setData({
        price: price - allPrice
      })
      const ids = item.detail.map(item => item.Id).join(',');
      let pcTimeSync = wx.getStorageSync('pcTimeSync')
      let updatedData = {
        ...pcTimeSync,
        hasChooseId: ids
      };
      wx.setStorageSync('pcTimeSync', updatedData);
    }
  },
  getRemainingSum(arr, a) {
    if (a <= 0) return arr.reduce((sum, x) => sum + x, 0);
    // 创建副本并降序排序（大数在前）
    const sorted = [...arr].sort((x, y) => y - x);
    // 跳过前 a 个最大值，对剩下的求和
    let sum = 0;
    for (let i = 0; i < a; i++) {
      sum += sorted[i];
    }
    return sum;
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
})