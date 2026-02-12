// pages/routeDetail/routeDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StationInfo:[
      { id: 1, name: '山西白求恩医院', isTransfer: false,isdao:true},
      { id: 2, name: '平阳路', isTransfer: false,isdao:true},
      { id: 3, name: '长风街', isTransfer: true,isdao:true},
      { id: 4, name: '学府街', isTransfer: false,isdao:true},
      { id: 5, name: '南内环街', isTransfer: true,isdao:false},
      { id: 6, name: '迎泽大街', isTransfer: false,isdao:false },
      { id: 7, name: '火车站', isTransfer: true,isdao:false},
      { id: 8, name: '建设路', isTransfer: false,isdao:false},
      { id: 9, name: '胜利街', isTransfer: false,isdao:false },
      { id: 10, name: '东花苑小区', isTransfer: false,isdao:false},
    ],
    BusInfo:[
      { number: '车号2512', nextStation: '长风街', stationsAway: 2, eta: 5 },
      { number: '车号2514', nextStation: '南内环街', stationsAway: 7, eta: 15 }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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