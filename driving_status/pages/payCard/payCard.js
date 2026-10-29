// driving_status/pages/payCard/payCard.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const debounce = require('../../../utils/debounce');
// const unionPayWatcher = require('../../../utils/unionPayWatcher.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    Phone: '',
    imgbaseUrl: '',
    // ===== 底部支付方式弹框 =====
    paySheetShow: false, //支付方式弹框显隐
    payType: 'union', //当前选中支付方式：union=云闪付（默认） wechat=微信
    paySheetPhone: '', //弹框展示的手机号
    pendingProductId: '', //待购买的产品Id
    payPromoDetailShow: false, //支付立减优惠详情是否展开
    payPromoRules: [
      '满5元立减1元',
      '满10元立减2元',
      '满50元立减10元',
      '满100元立减20元'
    ], //支付立减优惠规则
    payTypeList: [{
        img: '/assets/images/yunshanfu.png',
        key: 'union',
        name: '云闪付支付',
        tip: '选择云闪付支付随机立减',
        tag: ''
      },
      {
        img: '/assets/images/wechat.png',
        key: 'wechat',
        name: '微信支付',
        tip: '',
        tag: ''
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      imgbaseUrl: baseUrl
    })
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
    // unionPayWatcher.start(); // 兜底：冷启动后仍有待确认的云闪付订单时恢复监听
    let _this = this;
    _this.getList();
    this.setData({
      imgbaseUrl: baseUrl
    })
  },
  changeTel: debounce(function (e) {
    this.setData({
      Phone: e.detail.value
    })
  }, 500),
  payCard: debounce(function (e) {
    const _this = this;
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    const user = wx.getStorageSync('userInfo') || {};
    // 弹出底部支付方式选择框（替代原“确认购买”弹窗）
    _this.setData({
      paySheetShow: true,
      paySheetPhone: user.Phone || '',
      pendingProductId: e.currentTarget.dataset.id
    })
  }, 500),
  // 底部支付方式弹框：展开/收起支付立减优惠详情
  togglePayPromoDetail() {
    this.setData({
      payPromoDetailShow: !this.data.payPromoDetailShow
    })
  },
  // 底部支付方式弹框：切换支付方式
  onPayTypeChange(e) {
    this.setData({
      payType: e.currentTarget.dataset.key
    })
  },
  // 底部支付方式弹框：取消
  cancelPaySheet() {
    this.setData({
      paySheetShow: false
    })
  },
  // 阻止弹框内部滚动穿透
  noop() {},
  // 底部支付方式弹框：确认下单
  confirmPaySheet() {
    const _this = this;
    const payType = _this.data.payType;
    const productId = _this.data.pendingProductId;
    _this.setData({
      paySheetShow: false
    });
    if (!productId) return;
    _this._doBuyCard(productId, payType);
  },
  // 创建次卡订单并拉起支付
  _doBuyCard(Id, payType) {
    const _this = this;
    console.log('用户点击确定')
    wx.showLoading({
      title: '加载中',
    })
    const user = wx.getStorageSync('userInfo');
    const request = {
      MemberId: user.Id,
      ProductId: Id,
      Quantity: 1,
      Referrerphone: _this.data.Phone
    }
    let appid = wx.getStorageSync('appId')
    wx.request({
      url: baseUrl + '/api/CarPromotion/CreatMemberProducts',
      data: request,
      method: 'POST',
      success(res) {
        console.log(res)
        if (res.statusCode == 200) {
          const orderId = res.data.data;
          // 云闪付支付分流（逻辑待后端接口就绪后接入）
          if ((payType || 'union') === 'union') {
            const reqData = {
              appId: appid,
              Id: orderId,
             
              PaymentType:2
            }
            wx.request({
              url: baseUrl + '/Api/DispatchMobile/UnionProductGoPay',
              data: reqData,
              method: "GET",
              success(rts) {
                const ress = rts.data.data;
                console.log(ress)
                const payData = ress
                // 记录待确认订单并注册 onAppShow 监听，用户从云闪付返回后查询支付结果
                // unionPayWatcher.mark(orderId, 'dispatch');
                wx.navigateToMiniProgram({
                  appId: payData.CqpMpAppId,
                  path: payData.CqpMpPath,
                  fail(err) {
                    console.log('打开云闪付失败', err);
                    // unionPayWatcher.clear();
                    wx.showModal({
                      title: '提示',
                      content: '无法打开云闪付，可稍后在订单页继续支付。',
                      confirmText: '查看订单',
                      cancelText: '知道了',
                      success(r) {
                        wx.hideLoading()
                        if (r.confirm) {
                          wx.reLaunch({
                            url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + '&from=orderList'
                          });
                        }
                      }
                    });
                  }
                })
                // wx.requestPayment({
                //   timeStamp: payData.TimeStamp,
                //   nonceStr: payData.NonceStr,
                //   package: payData.Package,
                //   signType: payData.SignType,
                //   paySign: payData.PaySign,
                //   success(paymentRes) {
                //     wx.showToast({
                //       title: '支付成功',
                //       icon: 'success',
                //       duration: 2000,
                //       success: function () {
                //         wx.hideLoading()
                //         _this.getList()
                //         wx.navigateTo({
                //           url: '/pages/index/index',
                //         })
                //       }
                //     })
                //   },
                //   fail(paymentErr) {
                //     wx.hideLoading()
                //     console.log('拉起支付失败', paymentErr)
                //   }
                // })
              },
            })
            return;
          }
          const reqData = {
            appId: appid,
            Id: orderId,
            PaymentType:1
          }
          wx.request({
            url: baseUrl + '/Api/DispatchMobile/UnionProductGoPay',
            data: reqData,
            method: "GET",
            success(rts) {
              const ress = rts.data.data;
              const payData = ress
              wx.requestPayment({
                timeStamp: payData.TimeStamp,
                nonceStr: payData.NonceStr,
                package: payData.Package,
                signType: payData.SignType,
                paySign: payData.PaySign,
                success(paymentRes) {
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      wx.hideLoading()
                      _this.getList()
                      wx.navigateTo({
                        url: '/pages/index/index',
                      })
                    }
                  })
                },
                fail(paymentErr) {
                  wx.hideLoading()
                  console.log('拉起支付失败', paymentErr)
                }
              })
            },
          })
        } else {
          wx.hideLoading()
        }
      }
    })
  },
  getList() {
    let _this = this;
    var userinfo = wx.getStorageSync('userInfo');
    if (!userinfo) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    let params = {
      MemberId: userinfo.Id
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/ProductList',
      data: params,
      method: "GET",
      success(res) {
        console.log(res)
        wx.hideLoading()
        if (res.data.code == 0) {
          _this.setData({
            dataList: res.data.data
          })
        }
      },
    })
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
    return {
      title: '次卡系统',
      imageUrl: "/assets/images/share.jpg",
      path: "/driving_status/pages/payCard/payCard",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  onShareTimeline() {
    return {
      title: '次卡系统',
      imageUrl: '/assets/images/share.jpg' // 自定义图片（建议尺寸 1080*1920）
    }
  }
})