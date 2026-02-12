// pages/start/start.js
var timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:5,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.Numdown();
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  skipOpenPage(){
    clearTimeout(timer);
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  Numdown: function() {
    var that = this;
    var num = that.data.num;
    timer = setTimeout(function() {
      that.setData({
        num: num - 1
      })
      that.endNum()
    }, 1000)
  },
  endNum: function() {
    var that = this;
    var num = that.data.num;
    if (num == 0) {
      clearTimeout(timer);
      wx.reLaunch({
        url: '/pages/index/index',
      })
    } else {
      that.Numdown()
    }
  },
  /*
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearTimeout(timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearTimeout(timer);
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