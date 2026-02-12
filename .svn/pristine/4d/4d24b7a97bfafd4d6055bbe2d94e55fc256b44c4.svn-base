import http from '../../../utils/http';
// pages/budgetPrice/budgetPrice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaCode: null,
    costList: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    if (opt.valuationData) {
      let valuationData = JSON.parse(opt.valuationData);
      let reqData = {
        userLongitude: parseFloat(valuationData.strLng),
        userLatitude: parseFloat(valuationData.strLat),
        destinationLongitude: parseFloat(valuationData.endLng),
        destinationLatitude: parseFloat(valuationData.endLat),
        businessType: 1
      }
      http.postRequest("/v1/carOrder/passenger/lineValuation", reqData, wx.getStorageSync('header'), res => {
        if (res.code === '1') {
          this.setData({
            areaCode: res.content[0].areaCode,
          })
          if (opt.replaceList) {
            this.setData({
              costList:JSON.parse(opt.replaceList)
            })
          } else {
            console.log(2)
              this.setData({
                costList: res.content[0].costList,
              })
          }
        }
      }, err => {
        console.log(err)
      })
    }
  },

  toPriceRules() {
    wx.navigateTo({
      url: '/pages/priceRules/priceRules?code=' + this.data.areaCode + '&from=callCar',
    })
  },
})