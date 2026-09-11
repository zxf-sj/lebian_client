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
    coupon_num:0,//优惠卷使用张数
    membershipCard_num:0,//次卡使用张数
    
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
    ChildPrice: '',
    actualAdultCountdata: 1, //计算最终需要按【成人票价】结算的总人数
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
      coupon_num: 0,
      membershipCard_num: 0,
      carTypeList: [],
      rangfenceMapList: [],
      couponList_list: [],
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
      coupon_num: 0,
      membershipCard_num:0,
      carTypeList: [],
      rangfenceMapList: [],
      couponList_list: [],
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
              let timeNode = _this.isTimeInRange(formattedTime, pcTimeSync.StartTime)
              if (timeNode) {
                _this.handleCallCar()
              } else {
                wx.showModal({
                  title: '提示',
                  content: '尊敬的乘客：距离发车时间较近，车辆调度资源紧张，为保证乘车体验，发车时间将最优安排至下单1个小时内的最快发车时段，请知悉。咨询热线：0351-6078977 感谢您的理解与耐心等候！',
                  success(res) {
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
  // 防抖处理后的主入口函数
  handleCallCar: throttle(function () {
    this._mainProcess();
  }, 3000),
  // 1. 主流程控制
  async _mainProcess() {
    try {
      // 1.1 数据准备与校验
      const sessionData = this._getSessionData();
      if (!sessionData) return;

      const {storageSync,phone_number} = sessionData;

      // 1.2 检查历史订单
      const historyOrderInfo = await this._checkHistoryOrder(phone_number, storageSync.startDate);
      console.log(historyOrderInfo)
      let shouldProceed = true;
      if (historyOrderInfo) {
        console.log('3')
        // 使用 Promise 包装 showModal
        const modalRes = await new Promise(resolve => {
          wx.showModal({
            title: '下单记录',
            content: historyOrderInfo,
            cancelText: "取消下单",
            confirmText: "继续下单",
            success: resolve
          });
        });
        shouldProceed = modalRes.confirm;
      }
      console.log('2')
      if (!shouldProceed) {
        wx.navigateTo({
          url: '/pages/index/index'
        });
        return;
      }
      console.log('1')
      // 1.3 执行下单与支付
      await this._processOrderAndPayment(sessionData);

    } catch (error) {
      console.error('下单流程异常:', error);
      wx.showToast({
        title: '系统繁忙，请稍后重试',
        icon: 'none'
      });
    }
  },
  // 2. 获取并校验会话数据
  _getSessionData() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login'
      });
      return null;
    }

    const user = wx.getStorageSync('userInfo');
    // 注意：原代码 key 是 starInfo2，可能是拼写错误，这里保持一致
    const startInfo = wx.getStorageSync('starInfo2');
    const endInfo = wx.getStorageSync('endInfo2');
    const storageSync = wx.getStorageSync('storageSync');
    const pcTimeSync = wx.getStorageSync('pcTimeSync');
    const pcTypeId = wx.getStorageSync('pcTypeId');
    const lineId = wx.getStorageSync('lineId');

    // 从页面 data 中获取
    const {
      phone_number,
      textareaValue,
      aduit_num,
      child_num
    } = this.data;

    if (!startInfo.startAddress) {
      wx.showToast({
        title: '请选择出发乘车位置',
        icon: 'none'
      });
      return null;
    }
    if (!pcTimeSync.StartTime) {
      wx.showToast({
        title: '请选择出行时间',
        icon: 'none'
      });
      return null;
    }

    return {openid,user,startInfo,endInfo,storageSync,pcTimeSync,pcTypeId,lineId,phone_number,textareaValue,aduit_num,child_num};
  },

  // 3. 检查历史订单
  _checkHistoryOrder(phone, date) {
    return new Promise((resolve) => {
      // 假设 http.getRequest 是你封装的请求方法
      console.log(phone, date)
      http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + phone + '&timeDay=' + date, '', '', res => {
        if (res.code === 0 && res.count > 0) {
          let str = "";
          res.data.forEach(item => {
            str += `${item.PassengerLineId_Name}, 订单号:${item.Code}\n`;
          });
          resolve(str); // 返回订单信息字符串
        } else {
          resolve(false); // 无历史订单
        }
      }, () => resolve(false));
    });
  },

  // 4. 核心下单与支付逻辑
  async _processOrderAndPayment(data) {
    console.log(data)
    const {
      user,
      startInfo,
      endInfo,
      storageSync,
      pcTimeSync,
      pcTypeId,
      lineId,
      phone_number,
      textareaValue,
      aduit_num,
      child_num
    } = data;

    // 构建请求参数
    const arrivalTime = this._formatArrivalTime(storageSync.startDate, pcTimeSync.StartTime);

    const reqData = {
      PassengerLineId: lineId,
      IntoLocation: startInfo.startName,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endName,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      Departure: "100004-0000980001",
      ArrivalTime: arrivalTime,
      Personal: user.Id,
      SeatNumber: 0,
      DispatchListId: "",
      IsReservation: "100004-0000010002",
      CouponDetailsId: pcTimeSync.hasChooseId || "",
      PersonalIds: phone_number,
      Note: textareaValue,
      IsExclusive: "100004-0000010002",
      IsPickGoods: '100004-0000010002',
      SelectCarType: pcTypeId,
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      AdultNumber: aduit_num,
      ChildNum: child_num,
    };
    console.log(reqData)
    // 发起下单请求
    const orderRes = await new Promise((resolve, reject) => {
      wx.request({
        url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
        data: reqData,
        method: "POST",
        success: resolve,
        fail: reject
      });
    });
    console.log('orderRes',orderRes)
    const orderData = orderRes.data;
    if (orderData.code !== 0) {
      wx.showToast({
        title: orderData.msg || '下单失败',
        icon: 'none'
      });
      return;
    }
    const orderId = orderData.data.Id;
    const payAmount = orderData.data.PayAmount;
    // 如果金额为0，直接视为成功；否则调起支付
    if (payAmount != 0) {
      await this._handlePayment(orderId, user.Id);
    } else {
      // 0元单处理逻辑
      this._handleOrderSuccess(orderId);
    }
  },

  // 5. 处理支付逻辑
  _handlePayment(orderId, memberInfoId) {
    let appid = wx.getStorageSync('appId')
    return new Promise((resolve, reject) => {
      http.getRequest('/Api/DispatchMobile/GoUnionPay?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + memberInfoId, "", wx.getStorageSync('header'), (payRes) => {
        if (payRes.code === 0) {
          const payData = payRes.data
          wx.requestPayment({
            timeStamp: payData.TimeStamp,
            nonceStr: payData.NonceStr,
            package: payData.Package,
            signType: payData.SignType,
            paySign: payData.PaySign,
            success: () => {
              this._handleOrderSuccess(orderId);
              resolve();
            },
            fail: (err) => {
              console.log('支付失败', err);
              this._clearStorageAndRedirect(orderId);
              resolve(); // 支付失败也结束流程，避免卡死
            }
          });
        } else if (payRes.code === 400 && payRes.msg === "已付款") {
          this._handleOrderSuccess(orderId);
          resolve();
        } else {
          wx.showToast({
            title: payRes.msg,
            icon: 'none'
          });
          reject(payRes);
        }
      }, reject);
    });
  },

  // 6. 订单成功后的统一处理
  _handleOrderSuccess(orderId) {
    wx.showModal({
      title: '预约成功',
      content: '订单已预约成功，司机将会在您出发前一小时联系你',
      showCancel: false, // 隐藏取消按钮，强制用户点击确认
      confirmText: '我知道了',
      success: () => {
        // 用户点击确认后，再执行跳转
        this.setSubscribeMessage(); // 调用订阅消息
        // 跳转到订单列表页
        wx.reLaunch({
          url: `/user_center/pages/payDetail/payDetail?orderId=${orderId}&from=orderList`
        });
      }
    });
  },

  // 7. 清理缓存并跳转（用于支付失败等情况）
  _clearStorageAndRedirect(orderId) {
    const keys = ['starInfo2', 'endInfo2', 'storageSync', 'pcTimeSync', 'personNum', 'pcTypeId', 'SeatNumber', 'textareaValue', 'lineId'];
    keys.forEach(key => wx.removeStorageSync(key));

    setTimeout(() => {
      wx.reLaunch({
        url: `/user_center/pages/payDetail/payDetail?orderId=${orderId}&from=orderList`
      });
    }, 1000);
  },

  // 8. 时间格式化
  _formatArrivalTime(date, time) {
    // 原逻辑：取小时 + ":59:00"
    const hour = time.split(':')[0];
    return `${date} ${hour}:59:00`;
  },

  // 9. 订阅消息函数 (新增)
  setSubscribeMessage: function () {
    console.log('调用通知');
    wx.showModal({
      title: '提示',
      content: '即将为您开启消息提醒',
      complete: (res) => {
        if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA', "LhKVmpSKt-FGzwYVDHB6UQpVrdZmMklLzcFJ6Ln_oJU"],
            success: (res) => {
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
                  success: (res) => {
                    if (res.confirm) {
                      wx.openSetting({
                        success(res) {
                          console.log(res.authSetting);
                        },
                        fail(err) {
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
    });
  },
  //获取车辆列表
  getCarList() {
    console.log("获取车辆列表")
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
    console.log(pcTimeSync)
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
        console.log(res)
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
              // couponList_list: data.CouponList,
              // couponFlag: true,
              that.setData({
               
                couponFlag_aduit_num: 1
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
              price: price.toFixed(2), //总价
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
    console.log(data)
    that.setData({
      couponList_list: [],
      seatNumber: data.SeatNumber,
      child_num: 0,
      aduit_num: 1,
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
  total_Price: debounce(function () {
    let _this = this;
    const realChildCount = Math.min(_this.data.aduit_num, _this.data.child_num);
    const adultCount = (_this.data.aduit_num + _this.data.child_num) - realChildCount;
    _this.setData({
      actualAdultCountdata:adultCount
    })
    console.log("成人票",_this.data.actualAdultCountdata)
    wx.showLoading({
      title: '加载中',
    })
    var userinfo = wx.getStorageSync('userInfo');
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    console.log(pcTimeSync)
    let hasChooseId = pcTimeSync.hasChooseId
    console.log(hasChooseId)
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
      ChildNum:_this.data.child_num,
      CouponDetailsId:hasChooseId
    };
    if (storageSync.lineId && pcTimeSync.StartTime) {
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId', data, '', (res) => {
        if (res.code == '0') {
          console.log(res)
          let data = res.data[_this.data.carType];
          console.log(data)
          _this.setData({
            price: data.TotalFare,
            ChildPrice:data.ChildPrice,
          })
          wx.hideLoading();
        }
      }, (err) => {
        console.log(err)
      })
    }
    //获取结束

  }, 300),
  //成人人数+++
  adult_reduce() {
    let _this = this
    let aduit_num = _this.data.aduit_num;
    if (aduit_num > 1) {
      aduit_num -= 1
    }
   
    _this.setData({
      aduit_num,
      coupon_num: 0,
      membershipCard_num:0,
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
        coupon_num: 0,
      membershipCard_num:0,
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
    _this.setData({
      child_num,
      coupon_num: 0,
      membershipCard_num:0,
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
        coupon_num: 0,
      membershipCard_num:0,
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
      couponList_list: item.detail
    })
    console.log(_this.data.couponList_list[0])
    let coupon_num = 0;
    let membershipCard_num = 0;
    item.detail.forEach(item => {
      switch (item.CarType) {
        case '300251-a84bfd75d45d44c8beff6a6fe3f0e051':
          membershipCard_num += 1;
          break;
        case '':
          console.log('优惠券'); // 修正了错别字
          coupon_num += 1;
          break; 
        default:
          // 可选：处理其他未知的 CarType
          break;
      }
    })
    console.log(coupon_num,membershipCard_num)
    _this.setData({
      coupon_num,
      membershipCard_num
    })
    if (item.detail.length > 0) {
      let coupon_price = ''
      console.log(_this.data.PromotionDiscountType)
      if (_this.data.PromotionDiscountType == 0) {
        coupon_price = _this.data.initialPrice * _this.data.PromotionDiscount
      } else if (_this.data.PromotionDiscountType == 1) {
        coupon_price = _this.data.initialPrice - _this.data.PromotionDiscount
      } else if (_this.data.PromotionDiscountType == 9) {
        coupon_price = _this.data.initialPrice
      }

      let Jlength = item.detail.length //几张次卡
      console.log(this.data.aduit_num, _this.data.child_num, coupon_price, _this.data.ChildPrice, Jlength)
      // let calculateTotal_data = _this.calculateTotal(_this.data.aduit_num, _this.data.child_num, coupon_price, _this.data.ChildPrice, Jlength)
      // // let allPrice = this.getRemainingSum(priceList, Jlength)
      // this.setData({
      //   price: calculateTotal_data
      // })
      const ids = item.detail.map(item => item.Id).join(',');
      let pcTimeSync = wx.getStorageSync('pcTimeSync')
      let updatedData = {
        ...pcTimeSync,
        hasChooseId: ids
      };
      wx.setStorageSync('pcTimeSync', updatedData);
     
    }
    _this.total_Price()
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
      actualAdultCountdata: actualAdultCount
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