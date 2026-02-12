const BASE_URL = require("../../../utils/BASE_URL");
import http from '../../../utils/http.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username:"",
    phone:"",
    date:"",
    typename:"",
    tuiRen:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    that.getInfo();
  },
  getInfo(){
    let that = this;
    var data = wx.getStorageSync('carItem');
    var content = data.Location;
    const WxParses = require('../wxParse/wxParse.js');
    WxParses.setImageDomain(BASE_URL);
    WxParses.wxParse('content', 'html', content, that, 5);
    that.setData({
      typename:data.FormTypeId_Name
    })
  },
  bindName(e){
    var name = e.detail.value;
    this.setData({
      username:name
    })
  },
  bindPhone(e){
    var phone = e.detail.value;
    this.setData({
      phone:phone
    })
  },
  bindDate(e){
    var date = e.detail.value;
    console.log(date);
    this.setData({
      date:date 
    })
  },
  bindTui(e){
    var tui = e.detail.value;
    this.setData({
      tuiRen:tui
    })
  },
  tijiao(){
    let that = this;
    var openid = wx.getStorageSync('openid');
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    var username = that.data.username;
    var phone = that.data.phone;
    var date = that.data.date;
    var typename = that.data.typename;
    var tuiRen = that.data.tuiRen;
    if(username==""){
      wx.showToast({
        title: '请输入您的姓名',
        icon:'none'
      })
      return false;
    }
    if(date==""){
      wx.showToast({
        title: '请选择租车日期',
        icon:'none'
      })
      return false;
    }
    if (!/^1(3|4|5|7|8)\d{9}$/.test(phone)) {
      wx.showToast({
        title: '您的手机号码不正确',
        icon:"none"
      })
      return false;
    }
    var data = {
      "mainClass":"CD_LvYou",
      "mainList":[
        {"key":"ExtProp1","value":username},
        {"key":"ExtProp2","value":phone},
        {"key":"ExtProp3","value":date},
        {"key":"Name","value":typename},
        {"key":"Location","value":tuiRen}
      ]
    }
    http.postRequest('/Api/DispatchMobile/createThirdBuinessInfo',data, '', res => {
      if(res.code==0){
        wx.showToast({
          title: '提交成功',
          icon:'success',
          duration:2000,
          success:function(){
            setTimeout(function(){
              wx.navigateTo({ 
                url: '/pages/index/index',
              })
            },2000)
          }
        });
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
  kefu(){
    var tel = '15340701213';
    wx.showModal({
      title: '联系电话',
      content: '联系电话 李经理：'+tel,
      success(res) {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: tel // 你要拨打的电话号码
            })
          } else if (res.cancel) {
            wx.showToast({
              title: '取消拨打客服电话',
              icon:"error"
            })
          }
      }
    })
  }
})