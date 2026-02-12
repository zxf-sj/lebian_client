// pages/payDetail/payDetail.js
import http from '../../../utils/http';
const throttle = require('../../../utils/throttle.js').throttle;
Page({
  data: {
    startAddress: '',
    endAddress: '',
    detailData:null,
    count:0,
    carId:"",
    gender:0,
    orderId:"",
    reason:"",
    isshow:true,
    reasonArr:[
      '',
      '等待时间太久',
      '临时有事取消',
      '司机服务不到位',
      '车费太贵',
    ],
    value:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderId = options.orderId;
    this.setData({
      orderId:orderId
    })
    if (orderId) {
      http.getRequest('/Api/DispatchMobile/GetInfo?detailClass=300216&JoinCode=RideTicketId&id='+orderId, '', wx.getStorageSync('header'), res => {
        if (res.code == 0) {
          var arr = res.data.DetailList;
          var count =0;
          arr.forEach(function (item, index) {
            count += item.RealMoney;
          })
          this.setData({
            count:count,
            detailData:res.data
          })
          if(res.data.FormState=='100004-0001020006'){
            this.setData({
              driverInfo:res.data,
              carId:res.data.DispatchListId_CarDirId,
              formTypeState:res.data.FormState,
            })
          }
        }
      }, err => {
        console.log(err)
      })
    }

  },
  onShow() {
  },
  bindArea(e){
    var value = e.detail.value;
    this.setData({
      value:value
    })
  },
  Checked(e){
    var value = e.currentTarget.dataset.type;
    if(value==5){
      this.setData({
        isshow:false,
        gender:value,
      })
    }else{
      this.setData({
        gender:value,
        isshow:true
      })
    }
  },
  orderCancel:throttle(function(){
    let that = this;
    var orderId = that.data.orderId;
    if(!that.data.gender){
      wx.showToast({
        title: '请选择取消的原因',
        icon:'none',
        duration:2000
      })
    }else{
      if(that.data.gender<5){
        var arr = that.data.reasonArr;
        var reason = arr[that.data.gender];
      }else{
        var reason = that.data.value;
      }
      http.getRequest("/Api/DispatchMobile/OrderCancel?formTypeId="+wx.getStorageSync('FormTypeId')+"&id="+orderId+"&reason="+reason, '', wx.getStorageSync('header'), res => {
        if (res.code == 0) {
          wx.showToast({
            title: res.msg,
            icon: 'loading',
          });
          setTimeout(function(){
            wx.reLaunch({
              url: '/pages/index/index'
            })
          },1000)
        }else{
          wx.showToast({
            title: res.msg,
            icon:'error'
          })
        }
      }, err => {
        console.log(err)
      })
    }
  },3000),
})