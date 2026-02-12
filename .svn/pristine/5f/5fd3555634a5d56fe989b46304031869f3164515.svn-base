const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  
  agreement(){
    wx.navigateTo({
      url: '/user_center/pages/agreement/agreement',
    })
  },
  yinsi(){
    wx.navigateTo({
      url: '/user_center/pages/yinsi/yinsi',
    })
  },
  kaipa(){
    wx.navigateTo({
      url: '/user_center/pages/plist/plist',
    })
  },
  loginOut() {
    wx.showModal({
      title:'提示',
      content:'确定要退出登录吗？',
      success(res){
        if (res.confirm) {
          console.log('用户点击确定')
          wx.removeStorage({
            key: 'phoneNumber',
            success (res) {
              console.log("已退出登录");
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('openid');
              wx.removeStorageSync('header');
              wx.removeStorageSync('line_id');
              wx.removeStorageSync('TicketPrice');
              wx.removeStorageSync('endlati');
              wx.removeStorageSync('endlong');
              wx.removeStorageSync('endCity');
              //app.globalData.clientDriving.end();
              //app.globalData.clientDriving=null;
              wx.reLaunch({
                url: '/pages/index/index',
              })
            },
            error(err) {
              console.log(err);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})