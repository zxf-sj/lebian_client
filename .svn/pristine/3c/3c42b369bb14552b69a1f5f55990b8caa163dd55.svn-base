 var app = getApp()
 import http from '../../utils/http.js';
Page({
  /**
    * 控件当前显示的数据
    * provinces:所有省份
    * citys 选择省对应的所有市,
    * areas 选择市对应的所有区
    * consigneeRegion：点击确定时选择的省市县结果
    * animationAddressMenu：动画
    * addressMenuIsShow：是否可见
    */
  /**
   * 页面的初始数据
   */
  data: {
    consigneeName: "", 
    phone: "",
    items: [
      {value: '100004-0000010001', name: '是','checked':0},
      {value: '100004-0000010002', name: '否','checked':0},
    ],
    idcard:"",
    isChild:null,
    Ids:"",
  },
  consigneeNameInput: function(e) {
    this.setData({
      consigneeName: e.detail.value
    })
  },
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  idcardInput: function (e) {
    this.setData({
      idcard: e.detail.value
    })
  },
  radioChange(e){
    this.setData({
      isChild:e.detail.value
    })
  },
  submit: function() {
    var consigneeName = this.data.consigneeName;
    var phone = this.data.phone;
    var idcard = this.data.idcard;
    var isChild = this.data.isChild;
    var userinfo = wx.getStorageSync('userInfo');
    var Ids = this.data.Ids;
    if (consigneeName == "") {
      wx.showToast({
        title: '请输入姓名',
        icon:'error',
        duration:2000
      })
      return false
    }else if (phone == "") {
      wx.showToast({
        title: '请输入手机号码',
        icon:'error',
        duration:2000
      })
      return false
    }
    // else if (idcard == "") {
    //   wx.showToast({
    //     title: '请输入证件号',
    //     icon: 'error',
    //     duration:2000
    //   })
    //   return false
    // }
    else if (!isChild) {
      wx.showToast({
        title: '请选择是否儿童',
        icon: 'error',
        duration:2000
      })
      return false
    }
    var p1 = /^1[3456789]\d{9}$/; 
    if (!p1.test(phone)){
      wx.showToast({
        title: '手机号不正确',
        icon:'error',
        duration:2000
      })
      return false
    }
    // var p2 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
    // if(!p2.test(idcard)){
    //   wx.showToast({
    //     title: '身份证号不正确',
    //     icon:'error',
    //     duration:2000
    //   })
    //   return false
    // }
    wx.showLoading({
      title: 'loading...',
      mask: true,
      success:function(){
        http.getRequest("/Api/Mobile/AddressEdit?MemberId="+userinfo.Id+'&RealName='+consigneeName+"&Phone="+phone+"&IdCard="+idcard+"&isChildren="+isChild+'&Id='+Ids,'',wx.getStorageSync('header'),res=>{
          if(res.code==0){
            wx.showToast({
              title: '添加成功',
              icon:'success',
              duration:2000,
              success:function(){
                wx.hideLoading();
                wx.navigateBack({
                  delta:1
                })
              }
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var item = options.item;
    if(item){
      var items =JSON.parse(item);
      var arr = this.data.items;
      if(items.isChildren =='100004-0000010001'){
          arr[0].checked = 1;
        this.setData({
          items:arr
        })
      }else{
        arr[1].checked = 1;
        this.setData({
          items:arr
        })
      }
      this.setData({
        consigneeName:items.RealName,
        phone:items.Phone,
        idcard:items.IdCard,
        Ids:items.Id,
        isChild:items.isChildren=='100004-0000010001'?true:false
      })
    }
  },

})