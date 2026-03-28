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
      startTime:'05:10',
      endTime:'08:10',
      car_type:'便民通勤',
      num:20
    }],
    addList:[{
      startTime:"05:10",
      endTime:'08:10',
      car_type:'枢纽直达',
    },
    {
      startTime:"05:40",
      endTime:'08:40',
      car_type:'枢纽直达',
    },
    {
      startTime:"06:00",
      endTime:'09:00',
      car_type:'通勤便民',
    },
    {
      startTime:"06:15",
      endTime:'09:15',
      car_type:'通勤便民',
    },
    {
      startTime:"06:30",
      endTime:'09:30',
      car_type:'通勤便民',
    },
    {
      startTime:"06:45",
      endTime:'09:45',
      car_type:'通勤便民',
    },
    {
      startTime:"07:00",
      endTime:'10:00',
      car_type:'通勤便民',
    },
    {
      startTime:"07:15",
      endTime:'10:15',
      car_type:'通勤便民',
    },
    {
      startTime:"07:30",
      endTime:'10:30',
      car_type:'通勤便民',
    },
    {
      startTime:"07:45",
      endTime:'10:45',
      car_type:'通勤便民',
    },
    {
      startTime:"08:00",
      endTime:'11:00',
      car_type:'通勤便民',
    },
    {
      startTime:"08:25",
      endTime:'11:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"08:55",
      endTime:'11:55',
      car_type:'枢纽直达',
    },
    {
      startTime:"09:25",
      endTime:'12:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"09:55",
      endTime:'12:55',
      car_type:'枢纽直达',
    },
    {
      startTime:"10:25",
      endTime:'13:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"11:25",
      endTime:'14:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"12:25",
      endTime:'15:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"13:25",
      endTime:'16:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"13:55",
      endTime:'16:55',
      car_type:'枢纽直达',
    },
    {
      startTime:"14:25",
      endTime:'17:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"14:55",
      endTime:'17:55',
      car_type:'枢纽直达',
    },
    {
      startTime:"15:25",
      endTime:'18:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"15:55",
      endTime:'18:55',
      car_type:'枢纽直达',
    },
    {
      startTime:"16:25",
      endTime:'19:25',
      car_type:'枢纽直达',
    },
    {
      startTime:"16:30",
      endTime:'19:30',
      car_type:'通勤便民',
    },
    {
      startTime:"16:45",
      endTime:'19:45',
      car_type:'通勤便民',
    },
    {
      startTime:"17:00",
      endTime:'20:00',
      car_type:'通勤便民',
    },
    {
      startTime:"17:15",
      endTime:'20:15',
      car_type:'通勤便民',
    },
    {
      startTime:"17:30",
      endTime:'20:30',
      car_type:'通勤便民',
    },
    {
      startTime:"17:45",
      endTime:'19:45',
      car_type:'通勤便民',
    },
    {
      startTime:"18:00",
      endTime:'20:00',
      car_type:'通勤便民',
    }
   ],
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
    let storageSync = wx.getStorageSync('storageSync')
    let seatList = []
    this.data.addList.forEach(item => {
      seatList.push({
        startCity:storageSync.startingCity,
        endCity:storageSync.endingCity,
        startTime:item.startTime,
        endTime:item.endTime,
        car_type:item.car_type,
        num:20
      })
    })
    this.setData({
      seatList
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
    let car_type = e.currentTarget.dataset.itemdata.car_type
    let storageSync = wx.getStorageSync('storageSync')
    wx.navigateTo({
      url: '/user_center/pages/bus/bus?car_type=' + car_type + '&startCity=' + storageSync.startingCity + '&endingCity=' + storageSync.endingCity,
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