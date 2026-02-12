// user_center/pages/refund/refund.js
// pages/payDetail/payDetail.js
import http from '../../../utils/http';
const throttle = require('../../../utils/throttle.js').throttle;
Page({
  data: {
    startAddress: '',
    endAddress: '',
    detailData: null,
    count: 0,
    carId: "",
    gender: 0,
    orderId: "",
    reason: "",
    isshow: true,
    reasonArr: [
      '',
      '等待时间太久',
      '临时有事取消',
      '司机服务不到位',
      '车费太贵',
    ],
    value: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderId = options.orderId;
    this.setData({
      orderId: orderId
    })
    if (orderId) {
      http.getRequest('/Api/DispatchMobile/GetInfo?detailClass=300216&JoinCode=RideTicketId&id=' + orderId, '', wx.getStorageSync('header'), res => {
        if (res.code == 0) {
          var arr = res.data.DetailList;
          var count = 0;
          arr.forEach(function (item, index) {
            count += item.RealMoney;
          })
          this.setData({
            count: count,
            detailData: res.data
          })
          if (res.data.FormState == '100004-0001020006') {
            this.setData({
              driverInfo: res.data,
              carId: res.data.DispatchListId_CarDirId,
              formTypeState: res.data.FormState,
            })
          }
        }
      }, err => {
        console.log(err)
      })
    }

  },
  onShow() {},
  bindArea(e) {
    var value = e.detail.value;
    this.setData({
      value: value
    })
  },
  Checked(e) {
    var value = e.currentTarget.dataset.type;
    if (value == 5) {
      this.setData({
        isshow: false,
        gender: value,
      })
    } else {
      this.setData({
        gender: value,
        isshow: true
      })
    }
  },
  orderCancel: throttle(function () {
    let that = this;
    var userinfo = wx.getStorageSync('userInfo');
    var orderId = that.data.orderId;
    if (!that.data.gender) {
      wx.showToast({
        title: '请选择取消的原因',
        icon: 'none',
        duration: 2000
      })
    } else {
      const request = {
        "MemberId": userinfo.Id,
        "Id": orderId,
        "Mark": "申请退款"
      }
      http.postRequest("/Api/DispatchMobile/RefundOrder", request, '', (res) => {
        if (res.code == 0) {
          console.log('退款', res)
          wx.showToast({
            title: res.msg,
            icon: 'loading',
            duration: 3000
          });
          wx.navigateTo({
            url: '/pages/index/index'
          })
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
    }
  }, 3000),
})