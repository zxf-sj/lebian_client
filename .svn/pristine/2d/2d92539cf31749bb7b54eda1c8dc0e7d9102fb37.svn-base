// user_center/pages/chooseCity/chooseCity.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const debounce = require('../../../utils/debounce');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeon:'',//拼车、包车
    direction:'',//出发、到达
    cityList:[],//城市列表
    countyList:[],//县市列表
    address:[],//搜索结果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    if(options) {
      if(options.typeon == "pc") {
        _this.setData({
          typeon:options.typeon
        })
        wx.setNavigationBarTitle({
          title: '乐遍拼车'
        });
      } else if(options.typeon == "bc") {
        _this.setData({
          typeon:options.typeon
        })
        wx.setNavigationBarTitle({
          title: '乐遍包车'
        });
      }else if(options.typeon == "sh") {
        _this.setData({
          typeon:options.typeon
        })
        wx.setNavigationBarTitle({
          title: '乐遍小件物流'
        });
      }
      _this.setData({
        direction:options.direction,
        typeon:options.typeon
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
  handleCallCustomerService() {
    let _this = this;
        wx.showModal({
          title: "提示",
          content:
            "是否跳转联系客服？",
          confirmText: "确定",
          cancelText: "关闭",
          success(res) {
            if (res.confirm) {
              wx.makePhoneCall({
                phoneNumber: "0351-6078977",
              });
            }
          },
        });
  },
  // 输入框防抖处理（延迟执行）
  searchInputend: debounce(function(e) {
    var _this = this;
    var value = e.detail.value;
    if(value){
      wx.showLoading({
        title: '',
      })
      wx.request({
        url: baseUrl + '/api/DispatchMobile/GetLineCity',
        data:{
          keyword:value,
        },
        method:"GET",
        success:(res)=>{
            this.setData({
              address: res.data.data
            })
            wx.hideLoading()
        }
      })
    }
  },500),
  //点击搜索结果列表
  clickAddress(e) {
    if(this.data.direction == 'startingCity') {
      let storedData = wx.getStorageSync('storageSync') || {};
      let request = {
        startingCity:e.currentTarget.dataset.item.Name,
        StatingLocation_Latitude:e.currentTarget.dataset.item.Latitude,
        StatingLocation_Longitude:e.currentTarget.dataset.item.Longitude,
      }
      let updatedData = { ...storedData,...request  };
      wx.setStorageSync('storageSync', updatedData);
     } else if(this.data.direction == 'endingCity') {
      let storedData = wx.getStorageSync('storageSync') || {};
      let requert = {
        endingCity:e.currentTarget.dataset.item.Name,
        EndLocation_Latitude:e.currentTarget.dataset.item.Latitude,
        EndLocation_Longitude:e.currentTarget.dataset.item.Longitude,
      }
      let updatedData = { ...storedData, ...requert };
      wx.setStorageSync('storageSync', updatedData);
     }
     wx.reLaunch({
      url: '/pages/chengji/chengji?typeon=' + this.data.typeon 
    })
  },
  //获取列表
  getList() {
    wx.request({
      url: baseUrl + '/api/DispatchMobile/GetLineCity',
      data:{
        keyword:'',
      },
      method:"GET",
      success:(res)=>{
        let arr = res.data.data;
        let cityList = []
        for(let i in arr) {
          if(!cityList.includes(arr[i].City)) {
            cityList.push(arr[i].City)
          }
        } 
        this.setData({
          cityList:cityList,
          countyList:arr
        })
      }
    })
  },
  //点击县
  handleCounty(e) {
    let item = e.currentTarget.dataset.item
   if(this.data.direction == 'startingCity') {
    let storedData = wx.getStorageSync('storageSync') || {};
    let requert = {
      startingCity:item.Name,
      StatingLocation_Latitude:item.Latitude,
      StatingLocation_Longitude:item.Longitude,
    }
    let updatedData = { ...storedData, ...requert };
    wx.setStorageSync('storageSync', updatedData);
   } else if(this.data.direction == 'endingCity') {
    let storedData = wx.getStorageSync('storageSync') || {};
    let requert = {
      endingCity:item.Name,
      EndLocation_Latitude:item.Latitude,
      EndLocation_Longitude:item.Longitude,
    }
    let updatedData = { ...storedData, ...requert };
   
    wx.setStorageSync('storageSync', updatedData);
   }
   console.log(this.data.typeon)
    wx.reLaunch({
      url: '/pages/chengji/chengji?typeon=' + this.data.typeon 
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