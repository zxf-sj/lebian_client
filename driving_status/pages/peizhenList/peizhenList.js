import http from '../../../utils/http.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onShow() {
    this.getTelList()
  },

  // 点击服务项，跳转到咨询留资表单
  onServiceTap(e) {
    const type = e.currentTarget.dataset.type || '';
    wx.navigateTo({
      url: '/driving_status/pages/peizhenConsult/peizhenConsult?type=' + encodeURIComponent(type)
    });
  },

  getTelList() {
    let _this = this;
    http.postRequest("/api/DriverApp/GetPhoneList", '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        _this.setData({
          noticeList: res.data
        })
      }
    }, err => {
      console.log(err)
    })
  }
})
