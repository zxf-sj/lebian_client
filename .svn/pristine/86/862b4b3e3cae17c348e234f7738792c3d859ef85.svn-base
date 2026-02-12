const app = getApp()
import http from '../../../utils/http';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg:{},
    temp:false,
    realName:"",
    array: ['身份证'],
    index:0,
    type:"",
    card:"",
    isshow:false,
    phone:""
  },
  bindname: function (e) {
    this.setData({
      realName: e.detail.value
    })
  },
  bindcard: function (e) {
    this.setData({
      card: e.detail.value
    })
  }, 
  bindPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  }, 
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value,
      type:this.data.array[e.detail.value]
    })
  },
  formSubmit(e){  
    let that = this;
    if(that.data.realName==""){
      wx.showToast({
        title: '请填写真实姓名',
        icon:'error'
      })
      return false;
    }
    if(that.data.card==""){
      wx.showToast({
        title: '请填写证件号码',
        icon:'error'
      })
      return false;
    }
    if(that.data.card.length!=18){
      wx.showToast({
        title: '证件号码不正确',
        icon:'error'
      })
      return false;
    }
    if(that.data.phone.length!=11){
      wx.showToast({
        title: '手机号码不正确',
        icon:'error'
      })
      return false;
    }
    if (!/^1[3456789]\d{9}$/.test(that.data.phone)) {
      wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
      });
      return false;
    }
    var userinfo = wx.getStorageSync('userInfo');
    var data = {"Id":userinfo.Id,"Name":that.data.realName,"IdentityCard":that.data.card,"Phone":that.data.phone};
    http.postRequest("/Api/DispatchMobile/Certification", data, wx.getStorageSync('header'), res => {
      if(res.code==0){
        userinfo.IdentityCard = that.data.card;
        userinfo.Name = that.data.realName;
        userinfo.Phone = that.data.phone;
        wx.setStorageSync('userInfo', userinfo);
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000, // 显示时间（单位：毫秒）
          success: function() {
            that.saveUser(that.data.realName,that.data.phone,that.data.card);
            setTimeout(function(){
              wx.navigateTo({
                url: '/user_center/pages/personalCenter/personalCenter' // 跳转的页面路径
              });
            },3000)
          }
        });
      }else{
        wx.showToast({
          title: res.msg,
          icon:'none'
        })
      }
    }, err => {
        console.log(2222)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow:function(){
    var userinfo = wx.getStorageSync('userInfo');
    if(userinfo.IdentityCard){
      this.setData({
        realName:userinfo.Name,
        card:userinfo.IdentityCard,
        phone:userinfo.Phone
      })
    }else{
      this.setData({
        isshow:true
      })
    }
  },
  saveUser(consigneeName,phone,idcard,){
    var userinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/Mobile/AddressEdit?MemberId="+userinfo.Id+'&RealName='+consigneeName+"&Phone="+phone+"&IdCard="+idcard+"&isChildren=100004-0000010001",'',wx.getStorageSync('header'),res=>{

    })
  }
})