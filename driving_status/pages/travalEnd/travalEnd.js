import qqmapsdk from '../../../libs/qqMap';
import http from '../../../utils/http';
let SCREEN_WIDTH = 750;
let RATE = wx.getWindowInfo().screenHeight / wx.getWindowInfo().screenWidth;
const app = getApp();
let payTimer = null; // 防抖
let curPageOnShow = false;
Page({
  data: {
    ScreenTotalW: SCREEN_WIDTH,
    ScreenTotalH: SCREEN_WIDTH * RATE - 460,
    hiddenLoading: true,
    controls: [],
    markers: [],
    points: [],
    driver: {},
    modalHidden: true,
    showYouHui: true,
    showPayBox: false,
    hasPay: false,
    isFriend: false,
    callPriceShowCont: '', // 价格显示
    fixedLine: false, // 远程
    additionalPrice: 0, // 远程加价
    priceShowCont: '', // 远程价格显示
    exclusiveCar: false,
    showIcon: false,
    taxi: false,
    showIntegral: false,
    showSb: false,
  },

  onLoad: function (opt) {
    console.log('from:', opt.from)
    this.mapCtx = wx.createMapContext("map");
    if (opt.resData) {
      let data = JSON.parse(opt.resData)
      console.log(data);
      this.setData({
        driver: data,
      })
      if (data.isFriendDriver == 0) {
        this.setData({
          isFriend: false
        })
      } else if (data.isFriendDriver == 1) {
        this.setData({
          isFriend: true
        })
      }
      if (opt.from !== 'exclusiveCar') {
        let _points = [{
          latitude: data.srcLat,
          longitude: data.srcLng
        }, {
          latitude: data.desLat,
          longitude: data.desLng
        }]
        this.setData({
          markers: [{
            iconPath: "http://scapp.xysc16.com/upload/wmp/imgs/mapicon_navi_s.png",
            id: 0,
            latitude: data.srcLat,
            longitude: data.srcLng,
            width: 30,
            height: 30
          }, {
            iconPath: "http://scapp.xysc16.com/upload/wmp/imgs/mapicon_navi_e.png",
            id: 1,
            latitude: data.desLat,
            longitude: data.desLng,
            width: 30,
            height: 30
          }],
        });
        this.mapCtx.includePoints({
          padding: [120],
          points: _points,
        })
        app.globalData.strLongitude = '';
        app.globalData.strLatitude = '';
        app.globalData.strAddress = '';
      }

      let driver = this.data.driver;
      console.log('driver:', driver)
      if (opt.from === 'fixedLine') {
        this.setData({
          fixedLine: true,
          ScreenTotalH: SCREEN_WIDTH * RATE - 450,
          additionalPrice: driver.price,
          priceShowCont: (parseFloat(driver.totalPrice) + parseFloat(driver.price)).toFixed(2),
        })
        this.checkPriceStates();
      } else if (opt.from === 'exclusiveCar') {
        this.getCurrentLocation();
        this.setData({
          exclusiveCar: true,
          showYouHui: false,
          ScreenTotalH: SCREEN_WIDTH * RATE - 420,
        })
        if (driver.orderState == 6) { // 超出费用
          let price = parseFloat(driver.totalPrice) + parseFloat(driver.price);
          this.setData({
            callPriceShowCont: price.toFixed(2),
          })
        } else {
          this.setData({
            hasPay: true,
          })

        }

        if (this.data.hasPay) {
          this.setData({
            showIcon: true,
          })

        }
      } else if (opt.from === 'taxi') {
        this.setData({
          taxi: true,
          hasPay: true,
          showIcon: true,
          showIntegral: false,
        })
      } else {
        this.setData({
          callPriceShowCont: driver.totalPrice
        })
      }
    }
    console.log('globalData:', this.data)
  },

  onShow() {
    //this.mqttClient();
    curPageOnShow = true;
  },

  onReady(){
    console.log('onReady')
    if (this.data.hasPay && this.data.taxi) {
      this.setData({
        showIntegral: true,
        showSb: true,
      })
      setTimeout(() => {
        console.log('onReady taxi delay')
        this.sbAudioPlay();
        setTimeout(() => {
          this.setData({
            showSb: false
          })
        }, 1700);
      }, 2000);
    }
  },

  onHide() {
    curPageOnShow = false;
    app.globalData.clientDriving._events.message=app.globalData.clientDriving._events.message['0']
  },

  onUnload() {
    curPageOnShow = false;
    app.globalData.clientDriving._events.message=app.globalData.clientDriving._events.message['0']
  },

  // mqttClient() {
  //   app.globalData.clientDriving.on('message', (topic, message, packet) => {
  //     let msg = JSON.parse(Base64.decode(message.toString()));
  //     if(!curPageOnShow){
  //       console.log("收到mqtt in travalEnd：return");
  //       return;
  //     }
  //     console.log("收到mqtt in travalEnd：", msg)
  //     if (msg && JSON.stringify(msg.data) !== '{}') {
  //       if (msg.code == '1009') {
  //         this.orderRecover(msg.data);
  //       } else if (msg.code == '1005') {
  //           if (msg.data.orderState == 6) { // 超出费用
  //             if (this.data.exclusiveCar) {
  //               let price = parseFloat(msg.data.totalPrice) + parseFloat(msg.data.price);
  //               this.setData({
  //                 hasPay: false,
  //                 callPriceShowCont: price.toFixed(2),
  //               })
  //             }
  //           } else {
  //             this.setData({
  //               hasPay: true,
  //               showIntegral: true,
  //               showSb: true,
  //             })
  //             setTimeout(() => {
  //               this.setData({
  //                 showSb: false
  //               })
  //             }, 1700);
  //             this.sbAudioPlay();
  //           }

  //           if (this.data.hasPay) {
  //             this.setData({
  //               showIcon: true,
  //             })
  //           }
  //         }
  //       }
  //     }
  //   )
  // },

  checkPriceStates() {
    let _this = this;
    let driver = this.data.driver;
    http.postRequest('/v2/passenger/remote/getPayPrice?orderNo=' + driver.orderNo, '', wx.getStorageSync('header'), res => {
      if (res.content == '0.00' || res.content == 0) { // 司机已代付
        _this.setData({
          hasPay: true,
          showIntegral: true,
          showSb: true
        })
        setTimeout(() => {
          _this.setData({
            showSb: false
          })
        }, 1700);
        _this.sbAudioPlay();
      } else {
        if (driver.showDialog == 1) { // 弹框
          wx.showModal({
            content: driver.description,
            confirmText: '同意',
            cancelText: '拒绝',
            success(res) {
              if (res.cancel) { // 拒绝
                if (driver.payState == 1) { // 票价已支付
                  _this.setData({
                    hasPay: true,
                    showIntegral: true,
                    showSb: true
                  })
                  setTimeout(() => {
                    _this.setData({
                      showSb: false
                    })
                  }, 1700);
                  _this.sbAudioPlay();
                } else if (driver.payState == 0) { // 票价未支付
                  _this.setData({
                    additionalPrice: 0,
                    priceShowCont: driver.totalPrice
                  })
                }
              }
            }
          })
        } else {
          if (driver.payState == 1) { // 票价已支付
            if (driver.orderState != 6) {
              _this.setData({
                hasPay: true,
                showIntegral: true,
                showSb: true
              })
              setTimeout(() => {
                _this.setData({
                  showSb: false
                })
              }, 1700);
              _this.sbAudioPlay();
            }
          } else if (driver.payState == 0) { // 票价未支付
            _this.setData({
              additionalPrice: 0
            })
          }
        }
      }
    }, err => {
      console.log(err)
    })
  },

  //唤起支付
  toPay() {
    let _this = this;
    if (payTimer) clearTimeout(payTimer);
    payTimer = setTimeout(() => {
      http.postRequest('/v1/wx/applet/order/pay?orderNo=' + this.data.driver.orderNo, '', wx.getStorageSync('header'), res => {
        if (res.code === '1') {
          wx.requestPayment({
            nonceStr: res.content.nonceStr,
            package: res.content.package,
            paySign: res.content.paySign,
            timeStamp: res.content.timeStamp,
            signType: res.content.signType,
            success(res) {
              console.log('调用支付成功：', res)
              wx.removeStorageSync('startDate')
              wx.showToast({
                title: '支付成功',
                duration: 2000,
                success() {
                  _this.setData({
                    hasPay: true,
                    showIntegral: true,
                    showSb: true,
                  });

                  setTimeout(() => {
                    _this.setData({
                      showSb: false
                    })
                  }, 1700);
                  _this.sbAudioPlay();

                  if (_this.exclusiveCar) {
                    _this.setData({
                      showIcon: true
                    })
                  }
                }
              })
            },
            fail(err) {
              console.log(err)
            }
          })
        }

      }, err => {
        console.log(err)
      })
    }, 500);
  },

  toDetail() {
    wx.navigateTo({
      url: '/user_center/pages/payDetail/payDetail?driver=' + JSON.stringify(this.data.driver),
    })
  },

  // addFriend() {
  //   let _this = this;
  //   if (!this.data.isFriend) {
  //     http.postRequest('/v1/passenger/friendDriver/attentionOrCancel?driverNo=' + this.data.driver.idNo, '', wx.getStorageSync('header'), res => {
  //       console.log('好友司机操作成功：', res)
  //       wx.showModal({
  //         content: '添加好友成功！',
  //         showCancel: false,
  //         success() {
  //           _this.setData({
  //             isFriend: true
  //           })
  //         }
  //       })
  //     }, err => {
  //       console.log(err)
  //     })
  //   } else {
  //     wx.showModal({
  //       content: '您已添加该司机为好友！',
  //       showCancel: false
  //     })
  //   }

  // },

  closeToHome() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },


  toService() {
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

  callDriver() {
    wx.makePhoneCall({
      phoneNumber: this.data.driver.phone,
      success() {
        console.log('拨打成功')
      }
    })
  },

  // 获取当前位置
  getCurrentLocation() {
    let _this = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log(res)
        _this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      }
    })
  },

  // 订单恢复
  orderRecover(order) {
    http.postRequest("/v1/carOrder/passenger/recoverOrder?orderNo=" + order, '', wx.getStorageSync('header'), res => {
      if (res.success) {
        console.log('recoverOrder');
      }
    }, err => {
      console.log(err)
    })
  },

  toMyIntegral() {
    wx.navigateTo({
      url: '/user_center/pages/integral/integral',
    })
  },

  sbAudioPlay() {
    const sbAudio = wx.createInnerAudioContext();
    sbAudio.stop();
    sbAudio.src = "http://scapp.xysc16.com/upload/wmp/audio/sb.MP3";
    sbAudio.play();
  },
})