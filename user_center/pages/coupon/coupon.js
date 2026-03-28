import http from '../../../utils/http'
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const app = getApp();

Page({
  data: {
    listData: null,
    
  },
  onLoad: function (options) {
    
    var userinfo = wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
    }
    this.getList();
  },
  getList(){
    let _this = this;
    http.getRequest("/api/CarPromotion/CouponList",'',wx.getStorageSync('header'),res=>{
      console.log(res)
      if(res.code == 0) {
        _this.setData({
          listData:res.data
        })
      }
    },err=>{
      console.log(err)
    })
  },
  lingQu(e){
    let that = this;
    console.log(e.currentTarget.dataset.item)
    var userinfo = wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    let params = {
      MemberId:userinfo.Id,
      productId:e.currentTarget.dataset.item.Id
    }
    
    http.postRequest("/api/CarPromotion/CreatCouponDetails",params,'',res=>{
      console.log(res)
      if(res.code == 0) {
        wx.hideLoading()
        wx.showToast({
          title: res.msg,
          icon: 'success',
          duration: 2000
        })
      } else if(res.code == 430) {
        wx.hideLoading()
        wx.showToast({
          title: '领取优惠券上限',
          icon: 'error',
          duration: 2000
        })
      }
    },err=>{
      
      wx.hideLoading()
      wx.showToast({
        title: res.msg,
        icon: 'success',
        duration: 2000
      })
      console.log(err)
    })
  }
})