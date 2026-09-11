import http from '../../../utils/http.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeList:  []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },
  onShow() {
this.getTelList()
  },
  handlePeizhen() {
    wx.navigateTo({
      url: '/driving_status/pages/peizhenPay/peizhenPay',
    })
  },
  getTelList() {
    let _this = this;
    http.postRequest("/api/DriverApp/GetPhoneList", '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        console.log(res)
        _this.setData({
          noticeList:res.data
        })
      }
    }, err => {
      console.log(err)
    })
  }
})