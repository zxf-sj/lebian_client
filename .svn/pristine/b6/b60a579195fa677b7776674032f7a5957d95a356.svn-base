// user_center/pages/Intercity/Intercity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchDate:0,
    seatList:[{
      startCity:'太原',
      endCity:'孝义',
      startTime:'11:00',
      money:50,
      num:20
    },
    {
      startCity:'太原',
      endCity:'孝义',
      startTime:'14:00',
      money:48,
      num:6
    }],
    handleItem:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    this.setData({
      day1:_this.getFutureDate(0),
      day2:_this.getFutureDate(1),
      day3:_this.getFutureDate(2),
      day4:_this.getFutureDate(3),
      week:_this.getDayAfterTomorrow()
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

  },
//切换日期
 switchDate(e) {
  this.setData({
    switchDate:e.currentTarget.dataset.item,
  })
},
//获取四天日期
getFutureDate(days) {
  let futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return futureDate.toISOString().slice(5, 7) + '/' + futureDate.toISOString().slice(8, 10);
},
  //获取大后天是周几
  getDayAfterTomorrow() {
    var today = new Date();
    today.setDate(today.getDate() + 3);
    var dayOfWeek = today.getDay();
    var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[dayOfWeek];
  },
  handleItem(e) {
    this.setData({
      handleItem:e.currentTarget.dataset.item
    })
    let data = e.currentTarget.dataset.itemdata
    wx.navigateTo({
      url: '/user_center/pages/bus/bus',
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

  }
})