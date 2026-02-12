import http from '../../../utils/http'
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
    var userinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/NewMobile/LoginCoupon?MemberId="+userinfo.Id+"&page=1&limit=10",'',wx.getStorageSync('header'),res=>{
      if(res.code === 0){
        let data = res.data;
        const newList = data.map(item => ({
          ...item,
          LineName: item.LineName.replace(/===>/g, '>')
        }));
        this.setData({
          listData:newList  
        })
      }
    },err=>{
      console.log(err)
    })
  },
  lingQu(e){
    let that = this;
    var ids = e.currentTarget.dataset.ids;
    var userinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/NewMobile/MemberGetCoupon?MemberInfoId="+userinfo.Id+"&CouponId="+ids,'',wx.getStorageSync('header'),res=>{
      if(res.code === 0){
        console.log('领取成功1')
        wx.showToast({
          title: '领取成功',
          icon:'success',
          duration:2000
        })
        setTimeout(function(){
          that.getList();
        },2000)
      }else{
        wx.showToast({
          title: res.msg,
          icon:'error',
          duration:2000
        })
      }
    },err=>{
      console.log(err)
    })
  }
})