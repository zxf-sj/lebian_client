const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switchDate: 0,
    handleItem: null,
    typeon: '', //拼车、包车
    lineld: '', //路线ID
    startingCity: '', //出发城市
    endingCity: '', //到达城市
    startDate: "", //出行日期
    priceList: [],
    today: '',
    seatList: [],
    day1: '',
    day2: '',
    day3: '',
    day4: '',
    week: '',
    propsDay: '',
    propsTxt: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    let storedData = wx.getStorageSync('storageSync') || {};
    let updatedData = {
      ...storedData,
      startDate: _this.getFutureDate2(0)
    };
    wx.setStorageSync('storageSync', updatedData);
    // 获取当前日期（今天）
    const today = new Date();

    // 创建一个辅助函数：复制日期并增加天数
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    // 分别获取今天、明天、后天、大后天
    const dates = {
      今天: addDays(today, 0),
      明天: addDays(today, 1),
      后天: addDays(today, 2),
      大后天: addDays(today, 3)
    };

    // 格式化为 YYYY-MM-DD 字符串（可选）
    function formatDate(date) {
      const m = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
      const d = String(date.getDate()).padStart(2, '0');
      return `${m}/${d}`;
    }
    _this.setData({
      day1: formatDate(dates.今天),
      day2: formatDate(dates.明天),
      day3: formatDate(dates.后天),
      day4: formatDate(dates.大后天),
      week: _this.getDayAfterTomorrow()
    })
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    let updatedTimeSync = {
      ...pcTimeSync,
      propsDay: _this.data.day1,
      propsTxt: '今天'
    };
    wx.setStorageSync('pcTimeSync', updatedTimeSync);
    _this.setData({
      propsDay: _this.data.day1,
      propsTxt: '今天'
    })
    const lineId = wx.getStorageSync("lineId")
    console.log('lineId', lineId)
    if (options) {
      _this.setData({
        lineld: lineId,
        endingCity: options.endingCity,
        startingCity: options.startingCity,
        typeon: options.typeon
      })
      _this.getList();

    }
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

  getFutureDate2(days) {
    let futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate.toISOString().slice(0, 10);
  },
  //获取大后天是周几
  getDayAfterTomorrow() {
    var today = new Date();
    today.setDate(today.getDate() + 3);
    var dayOfWeek = today.getDay();
    var days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[dayOfWeek];
  },

  //请求列表
  getList() {
    wx.showLoading({
      title: '加载中',
    })
    return new Promise((resolve) => {
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetLineEmptySeatNumAndPrice',
        data: {
          lineId: this.data.lineld,
          today: this.data.startDate,
          IsExclusive: '100004-0000010002',
        },
        method: "GET",
        success: (res) => {
          wx.hideLoading()
          if (res.data.code == 0) {
            let data = res.data.data
            this.setData({
              priceList: data.PriceList,
              today: data.SeatData[0].Today,
              seatList: data.SeatData[0].SeatList
            })
            // wx.setStorageSync('pcTypeId', data.PriceList[0].Id);
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "error"
            })
          }
          resolve(res)
        },
        fail(res) {
          wx.hideLoading()
        },
        complete(res) {
          wx.hideLoading()
        }
      })
    })
  },
  //切换日期
  async switchDate(e) {
    let dateString = e.currentTarget.dataset.tody;
    let year = new Date().getFullYear();
    let formattedDate = year + '-' + dateString.substring(0, 2) + '-' + dateString.substring(3, 5)
    this.setData({
      startDate: formattedDate,
      propsDay: e.currentTarget.dataset.tody,
      propsTxt: e.currentTarget.dataset.txt
    })
    let storedData = wx.getStorageSync('storageSync') || {};
    let updatedData = {
      ...storedData,
      startDate: formattedDate
    };
    wx.setStorageSync('storageSync', updatedData);
    await this.getList();
    this.setData({
      switchDate: e.currentTarget.dataset.item,
    })
  },
  handleItem(e) {
    const _this = this;
    let data = e.currentTarget.dataset.itemdata
    if (_this.data.switchDate == 0) {
      const timestamp = new Date().getTime();
      const THIRTY_MINUTES_MS = 45 * 60 * 1000; // 1800000
      let startTime = data.StartTime;
      const now = new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      now.setHours(hours, minutes, 0, 0);
      let newData = now.getTime(); // 返回时间戳（毫秒）
      // 1. 创建 Date 对象
      const date = new Date(newData + THIRTY_MINUTES_MS);
      const date2 = new Date(timestamp);
      // 2. 转换为本地时间字符串（默认格式）
      console.log(date.toString()); 
      console.log(date2.toString()); 
      // if (newData + THIRTY_MINUTES_MS <= timestamp) {
      //   console.log('不能选择')
      //   wx.showToast({
      //     title: '时间段车位已满，请重新选择',
      //     icon: 'none',
      //   })
      // } else {
        console.log('能选择')
        if (data.SeatNum != 0) {
          _this.setData({
            handleItem: e.currentTarget.dataset.item
          })
          let storedData = wx.getStorageSync('pcTimeSync') || {};
          let updatedData = {
            ...storedData,
            propsDay: _this.data.propsDay,
            propsTxt: _this.data.propsTxt,
            EndTime: data.EndTime,
            StartTime: data.StartTime,
            // Price: _this.data.priceList.Price
          };
          wx.setStorageSync('pcTimeSync', updatedData);
          wx.navigateTo({
            url: '/pages/pingche2/pingche2',
          })
        }
      // }
    } else {
      if (data.SeatNum != 0) {
        _this.setData({
          handleItem: e.currentTarget.dataset.item
        })
        let storedData = wx.getStorageSync('pcTimeSync') || {};
        let updatedData = {
          ...storedData,
          propsDay: _this.data.propsDay,
          propsTxt: _this.data.propsTxt,
          EndTime: data.EndTime,
          StartTime: data.StartTime,
          // Price: _this.data.priceList.Price
        };
        wx.setStorageSync('pcTimeSync', updatedData);
        wx.navigateTo({
          url: '/pages/pingche2/pingche2',
        })
      }
    }


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