const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
import http from '../../utils/http.js';
const app = getApp(); // 获取 App实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    imgUrl:"",
    noOrder:false,
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getList();
  },
  onShow() {

  },
  getList(){
    let that = this;
    var page = that.data.page;
    http.getRequest('/Api/DispatchMobile/getRentCarList','','', res => {
      console.log(res)
      if(res.code==0){
        if(res.data.length>0){
          that.setData({
            list:res.data,
            imgUrl:app.globalData.httpsUrl
          });
        }else{
          that.setData({
            noOrder:true
          });
        }
      }else{
        wx.showToast({
          title: '数据请求失败，请稍后重试',
          icon:"error"
        })
      }
    }, err => {
      console.log(1111,err)
    })
  },
  handleBook(e){
    var item = e.currentTarget.dataset.item;
    wx.setStorageSync('carItem', item);
    wx.navigateTo({
      url: '/pages/zuDetail/zuDetail',
    })
  }
})