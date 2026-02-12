// pages/priceRules/priceRules.js
import http from '../../utils/http';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    driver: null,
    fromLine: false,
    exclusiveCar: false,
    EXC_time: false,
    taxi: false,
    bannerImg: "/assets/images/banner.jpg",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = "/Api/DispatchMobile/GetRideTicket";
    this.rulesReq(url);
  },

  rulesReq(url) {
    var url = "/Api/DispatchMobile/GetRideTicket";
    var data = {
      "FormTypeId": "200015-f548368b1f504e6287d76865d7b31c9b",
      "page": "1",
      "limit": "10",
    };
    http.postRequest(url,data, wx.getStorageSync('header'), res => {
      if(res.code == 0){
        this.setData({
          list:res.data
        })
      }else{
        wx.showToast({
          title: '暂无数据',
        })
      }
    }, err => {
      console.log(err)
    })
  }
})