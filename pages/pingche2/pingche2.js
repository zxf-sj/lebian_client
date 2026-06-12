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
    use_couponList: 0, //次卡使用张数
    isshow: false, //用户须知
    couponList: 0, //次卡张数
    showCoupon: false, //优惠券弹框
    textareaValue: '', //备注信息
    remark: false, //点击备注信息显示弹框
    buttons: [{
      text: '确认', // 按钮文字
      type: 'default', // 按钮类型: 'default' | 'primary' | 'disabled'
      link: '' // 点击后跳转的页面路径
    }],
    aduit_num: 1, //成人人数
    couponFlag_aduit_num: 0, //次卡*优惠券抵用成人人数
    couponFlag: false, //是否存在次卡*优惠券抵用
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
    baseUrl: '',
    ChildPrice:'',
    actualAdultCountdata:1,//计算最终需要按【成人票价】结算的总人数
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
    this.setData({
      aduit_num: 1,
      child_num: 0,
      price: '',
      use_couponList: 0,
      carTypeList: [],
      rangfenceMapList: [],
      couponList_list:[],
      couponList: 0
    })
    this.getCarList()
  },
  information_phone_number(e) {
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
      couponList_list:[],
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
              const now = new Date();
              const hours = String(now.getHours()).padStart(2, '0'); // 获取小时并补零
              const minutes = String(now.getMinutes()).padStart(2, '0'); // 获取分钟并补零
              const formattedTime = `${hours}:${minutes}`;
              let pcTimeSync = wx.getStorageSync('pcTimeSync')
              let timeNode =  _this.isTimeInRange(formattedTime,pcTimeSync.StartTime)
              if(timeNode) {
                _this.handleCallCar()
              } else {
                wx.showModal({
                  title: '提示',
                  content: '尊敬的乘客：距离发车时间较近，车辆调度资源紧张，为保证乘车体验，发车时间将最优安排至下单1个小时内的最快发车时段，请知悉。咨询热线：0351-6078977 感谢您的理解与耐心等候！',
                  success (res) {
                    if (res.confirm) {
                      _this.handleCallCar()
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
              
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
    if(pcTimeSync.StartTime == '') {
      wx.showToast({
        title: '请选择出行时间',
        icon: 'none',
        duration: 2000
      })
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
          // if (this.data.dispatchListId) {
          //   wx.showLoading({
          //     title: '车辆调度中',
          //   })
          // } else {
          //   wx.showLoading({
          //     title: '加载中...',
          //   })
          // }
          let that = this;
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
                              console.log('支付成功')
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
                          console.log('支付成功2')
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
                // if (this.data.dispatchListId) {
                //   wx.showLoading({
                //     title: '车辆调度中',
                //   })
                // } else {
                //   wx.showLoading({
                //     title: '加载中...',
                //   })
                // }
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
                                  console.log('支付成功3')
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
                              console.log('支付成功4')
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
    }, err => {})
  }, 3000),
  setSubscribeMessage: function () {
    console.log('调用通知')
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
  //获取车辆列表
  getCarList() {
    // wx.showLoading({
    //   title: '加载中',
    // })
    let that = this
    var userinfo = wx.getStorageSync('userInfo');
    let starInfo2 = wx.getStorageSync('starInfo2')
    let endInfo2 = wx.getStorageSync('endInfo2')
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
    let ArrivalTime = startDate + ' ' + starTime
    var data = {
      IsExclusive: '100004-0000010002',
      Id: storageSync.lineId,
      StartLat: starInfo2.startLait,
      StartLng: starInfo2.startLont,
      EndLat: endInfo2.endLait,
      EndLng: endInfo2.endLont,
      ArrivalTime: ArrivalTime,
      MemberId: userinfo.Id,
      AdultNumber: that.data.aduit_num,
    };
    if (storageSync.lineId && pcTimeSync.StartTime) {
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId', data, '', (res) => {
        wx.hideLoading();
        if (res.code == '0') {
          //这里是默认值  默认选中第一辆车
          console.log(res)
          let data = res.data[0];
          if (!data.CarSeatState) {
            data = res.data[1]
            that.setData({
              carType: 1
            })
          }
          wx.setStorageSync('pcTypeId', data.Id)
          if (data.CarSeatState) {
            //默认座位数
            let seatNumber = data.SeatNumber
            //默认价格 
            let price = 0
            if (data.CouponFlag) {
              price = data.Price - data.CouponMoneyTotal
             
              that.setData({
                couponList_list: data.CouponList,
                couponFlag:true,
                couponFlag_aduit_num:1
              })
            } else {
              // 0 折扣 1 减 9 没活动
              if (data.PromotionDiscountType == 0) {
                price = data.Price * data.PromotionDiscount
              } else if (data.PromotionDiscountType == 1) {
                price = data.Price - data.PromotionDiscount
              } else if (data.PromotionDiscountType == 9) {
                price = data.Price
              }
            }
            if (data.Version) {
              price = price + Number(data.Version)
            }
            // let dataArr = []
            // res.data.forEach(item => {
            //   if(item.CarType == '300251-a84bfd75d45d44c8beff6a6fe3f0e051' &&  (item.PassengerLineId == '300213-7bc4de5562764200a0610b630859d384' || item.PassengerLineId == '300213-96f23d82cea647168541241650c39790')    ) {
            //     dataArr.push({...item,newPrice:item.Price -20})
            //   } else if(item.CarType == '300251-02b89150d44e4fb4aa0dcc36e5a20f17'  &&  (item.PassengerLineId == '300213-7bc4de5562764200a0610b630859d384' || item.PassengerLineId == '300213-96f23d82cea647168541241650c39790')) {
            //     dataArr.push({...item,newPrice:item.Price -10})
            //   } else {
            //     dataArr.push({...item,newPrice:item.Price})
            //   }
              
            // })
            console.log(data.rangfenceMapList)
            that.setData({
              rangfenceMapList: data.rangfenceMapList, //超范围列表
              carTypeList: res.data, //车型列表
              seatNumber, //座位数
              price:price.toFixed(2), //总价
              initialPrice: data.Price, //初始票价
              PromotionDiscountType: data.PromotionDiscountType,
              PromotionDiscount: data.PromotionDiscount,
              version: Number(data.Version)
            })
            wx.hideLoading();
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

 isTimeInRange(currentTime, selectedTime) {
  const [curH, curM] = currentTime.split(':').map(Number);
  const [selH, selM] = selectedTime.split(':').map(Number);
  if (curH === selH && curM >= 30) {
    return false; 
  }
  // 其他所有情况都返回 true
  return true; 
},
  //点击车型
  chooseCarType(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let data = that.data.carTypeList[index]
    that.setData({
      couponList_list: []
    })
    if (data.CarSeatState) {
      that.setData({
        carType: index, //车型选中下标
        initialPrice: data.Price
      })
      that.total_Price()
      wx.setStorageSync('pcTypeId', data.Id)
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
  total_Price: debounce(function() {
    let _this = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    //默认价格 
    let aduit_price = 0
    let child_price = 0
    let version_price = 0

    //获取车辆列表
    var userinfo = wx.getStorageSync('userInfo');
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
    let starInfo2 = wx.getStorageSync('starInfo2')
    let endInfo2 = wx.getStorageSync('endInfo2')
    let ArrivalTime = startDate + ' ' + starTime
    var data = {
      IsExclusive: '100004-0000010002',
      Id: storageSync.lineId,
      StartLat: starInfo2.startLait,
      StartLng: starInfo2.startLont,
      EndLat: endInfo2.endLait,
      EndLng: endInfo2.endLont,
      ArrivalTime: ArrivalTime,
      MemberId: userinfo.Id,
      AdultNumber: _this.data.aduit_num,
    };
    if (storageSync.lineId && pcTimeSync.StartTime) {
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId', data, '', (res) => {
        if (res.code == '0') {
          let data = res.data[_this.data.carType];
          //优惠卷
          console.log(data)
          if (data.CouponFlag) {
            const total = data.CouponList.reduce((sum, item) => {
              return sum + item.Count;
            }, 0);
            _this.setData({
              couponList_list: data.CouponList,
              couponFlag:true,
              couponFlag_aduit_num:total
            })
            if (_this.data.aduit_num == total) {
              aduit_price = _this.data.aduit_num * data.Price - data.CouponMoneyTotal
            } else {
              let CouponFlag_num = total * data.Price - data.CouponMoneyTotal
              let sheng_aduit_num = _this.data.aduit_num - total
              if (data.PromotionDiscountType == 0) {
                aduit_price = data.Price * data.PromotionDiscount * sheng_aduit_num
                _this.setData({
                  huodong_list: data.Price + 'x' + data.PromotionDiscount + 'x' + sheng_aduit_num
                })
              } else if (data.PromotionDiscountType == 1) {
                aduit_price = (data.Price - _this.data.PromotionDiscount) * sheng_aduit_num

              } else if (data.PromotionDiscountType == 9) {
                aduit_price = data.Price * sheng_aduit_num
              }
              aduit_price = aduit_price + CouponFlag_num
            }
          } else {
            // 0 折扣 1 减 9 没活动
            if (data.PromotionDiscountType == 0) {
              aduit_price = data.Price * data.PromotionDiscount * _this.data.aduit_num
            } else if (data.PromotionDiscountType == 1) {
              aduit_price = (data.Price - _this.data.PromotionDiscount) * _this.data.aduit_num
            } else if (data.PromotionDiscountType == 9) {
              aduit_price = data.Price * _this.data.aduit_num
            }
          }
         
          if( _this.data.aduit_num >= _this.data.child_num) {
            child_price = data.ChildPrice * _this.data.child_num
          } else { 
            let cha =  _this.data.child_num - _this.data.aduit_num
            child_price = data.ChildPrice * _this.data.aduit_num + cha * data.Price
          }
          if (_this.data.version > 0) {
            version_price = (_this.data.aduit_num + _this.data.child_num) * Number(_this.data.version)
          }
          console.log(aduit_price, child_price , version_price)
          let all_price = aduit_price + child_price + version_price;
          _this.setData({
            price: all_price.toFixed(2),
            ChildPrice:data.ChildPrice
          })
          wx.hideLoading();
        }
      }, (err) => {
        console.log(err)
      })
    }
    //获取结束

  },300),
  //成人人数+++
  adult_reduce() {
    let _this = this
    let aduit_num = _this.data.aduit_num;
    if (aduit_num > 1) {
      aduit_num -= 1
    }
    let actualAdultCount = ''
      if(aduit_num >= _this.data.child_num) {
       actualAdultCount = aduit_num + _this.data.child_num
      } else {
       actualAdultCount = aduit_num * 2
      }
    _this.setData({
      aduit_num,
      actualAdultCountdata:actualAdultCount,
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
      let actualAdultCount = ''
      if(aduit_num >= _this.data.child_num) {
       actualAdultCount = aduit_num + _this.data.child_num
      } else {
       actualAdultCount = aduit_num * 2
      }
      _this.setData({
        aduit_num,
        actualAdultCountdata:actualAdultCount,
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
    if (child_num > 0) {
      child_num -= 1
    }
   
     let actualAdultCount = ''
     if(_this.data.aduit_num >= child_num) {
      actualAdultCount = _this.data.aduit_num + child_num
     } else {
      actualAdultCount = _this.data.aduit_num * 2
     }
     
    _this.setData({
      child_num,
      actualAdultCountdata:actualAdultCount,
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
      let actualAdultCount = ''
      if(_this.data.aduit_num >= child_num) {
       actualAdultCount = _this.data.aduit_num + child_num
      } else {
       actualAdultCount = _this.data.aduit_num * 2
      }
      _this.setData({
        child_num,
        actualAdultCountdata:actualAdultCount,
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
  //点击使用优惠券传过来的值
  onExchangeItem(item) {
    console.log(item)
    let _this = this;
    _this.setData({
      couponList_list:item.detail
    })
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
      let coupon_price = ''
        if (_this.data.PromotionDiscountType == 0) {
          coupon_price = _this.data.initialPrice * _this.data.PromotionDiscount
        } else if (_this.data.PromotionDiscountType == 1) {
          coupon_price = _this.data.initialPrice - _this.data.PromotionDiscount
        } else if (_this.data.PromotionDiscountType == 9) {
          coupon_price = _this.data.initialPrice
        }
    
      let Jlength = item.detail.length //几张次卡
     console.log(this.data.aduit_num,_this.data.child_num,coupon_price,_this.data.ChildPrice,Jlength)
     let calculateTotal_data =   _this.calculateTotal(_this.data.aduit_num,_this.data.child_num,coupon_price,_this.data.ChildPrice,Jlength)
      // let allPrice = this.getRemainingSum(priceList, Jlength)
      this.setData({
        price: calculateTotal_data
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
  /**
 * @param {number} trueAdultCount - 真实的大人数量 (本例为 2)
 * @param {number} childCount - 小孩数量 (本例为 3)
 * @param {number} adultPrice - 动态获取的成人票价 (本例为 49.9)
 * @param {number} childPrice - 动态获取的儿童票价 (本例为 40)
 * @param {number} cardCount - 用户选择使用的次卡数量 (1, 2, 3, 4...)
 */

 calculateTotal(trueAdultCount, childCount, adultPrice, childPrice, cardCount) {
  // 1. 计算有多少个小孩超出了大人的携带能力，必须按成人票计费
  const extraChildAsAdult = Math.max(0, childCount - trueAdultCount);
  
  // 2. 计算最终需要按【成人票价】结算的总人数
  const actualAdultCount = trueAdultCount + extraChildAsAdult;
  this.setData({
    actualAdultCountdata:actualAdultCount
  })
  // 3. 计算最终需要按【儿童票价】结算的总人数
  const actualChildCount = childCount - extraChildAsAdult;
  
  // 4. 计算实际能抵扣的次卡数量（不能超过实际成人数）
  const validCardCount = Math.min(cardCount, actualAdultCount);
  
  // 5. 扣除次卡后，剩余需要付现金的成人票数量
  const remainingAdultCount = actualAdultCount - validCardCount;
  
  // 6. 计算最终总价并保留两位小数
  const total = (remainingAdultCount * adultPrice) + (actualChildCount * childPrice);
  return parseFloat(total.toFixed(2)); 
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