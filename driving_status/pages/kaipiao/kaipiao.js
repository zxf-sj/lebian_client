const app = getApp()
import http from '../../../utils/http';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg:{},
    order:{},
    title:"公司名称",
    is_show:true,
    orderId:"",
    type:1,
    name:"",
    money:0.00,
    code:"",
    address:"",
    tel:"",
    kaihuhang:"",
    remark:"",
    email:"",
    cardnum:"",
  },
  radioChange(e){
    var type = e.detail.value;
    if(type==2){
      this.setData({
        is_show:false,
        title:'个人姓名',
        type:type
      })
    }else{
      this.setData({
        is_show:true,
        title:"公司名称",
        type:type
      })
    }
  },
  bindname: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindcode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },
  bindkaihuhang:function(e){
    this.setData({
      kaihuhang: e.detail.value
    })
  },
  bindcardnum: function (e) {
    this.setData({
      cardnum: e.detail.value
    })
  },
  bindtel: function (e) {
    this.setData({
      tel: e.detail.value
    })
  },
  bindremark:function(e){
    this.setData({
      remark: e.detail.value
    })
  }, 
  bindemail: function (e) {
    this.setData({
      email: e.detail.value
    })
  },
  bindaddress:function(e){
    this.setData({
      address: e.detail.value
    })
  },
  formSubmit(e){  
  let that = this;
  if(that.data.name==""){
    wx.showToast({
      title: '请填写'+that.data.title,
      icon:'error',
      duration:2000

    })
    return false;
  }
  if(that.data.type==1){
    if(that.data.code==''){
      wx.showToast({
        title: '请填写税号',
        icon:'error',
        duration:2000
      })
      return false;
    }
  }
  if(that.data.email==''){
    wx.showToast({
      title: '请填写电子邮箱',
      icon:'error',
      duration:2000
    })
    return false;
  }
    var userinfo = wx.getStorageSync('userInfo');
    var data = {
      type:that.data.type,
      name:that.data.name,
      money:that.data.money,
      code:that.data.code,
      address:that.data.address,
      tel:that.data.tel,
      kaihuhang:that.data.kaihuhang,
      cardnum:that.data.cardnum,
      remark:that.data.remark,
      email:that.data.email
    };
    console.log(data);
    // http.postRequest("/Api/DispatchMobile/Certification", data, wx.getStorageSync('header'), res => {
    //   console.log(res);
    //   if(res.code==0){
    //     userinfo.IdentityCard = that.data.card;
    //     wx.setStorageSync('userInfo', userinfo);
    //     wx.showToast({
    //       title: '提交成功',
    //       icon: 'success',
    //       duration: 2000, // 显示时间（单位：毫秒）
    //       complete: function() {
    //         wx.navigateTo({
    //           url: '/user_center/pages/personalCenter/personalCenter' // 跳转的页面路径
    //         });
    //       }
    //     });
    //   }else{
    //     wx.showToast({
    //       title: res.msg,
    //       icon:'none'
    //     })
    //   }
    // }, err => {
    //     console.log(2222)
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var order_id = options.orderId;
    this.getOrderDetail(order_id);
  },
  onShow:function(){
    
  },
  getOrderDetail(orderId){
    http.getRequest("/Api/DispatchMobile/GetInfo?id="+orderId+'&detailClass=300216&JoinCode=RideTicketId','', wx.getStorageSync('header'), res => {
      if(res.code==0){
        this.setData({
          order:res.data,
          money:res.data.PayAmount
        })
      }
    }, err => {
        console.log(2222)
    })
  },
})