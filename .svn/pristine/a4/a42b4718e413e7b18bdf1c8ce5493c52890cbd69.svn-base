// components/slideCoupon/slideCoupon.js
import http from '../../utils/http.js';
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
let clickTimer = null;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modelComponent: {
      type: Boolean,
      value: false
    },
    lineId: {
      type: String,
      value: ''
    },
    startDate:{
      type: String,
      value: ''
    },
    typeon:{
      type: String,
      value: ''
    }
  },
  observers: {
    "modelComponent": function(newVal, oldVal) {
      let that = this;
      if(newVal){
      that.getCarList()
      }
    }
  },
  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
     let that = this;
    //  that.getCarList()
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    carTypeList:[],
    carType:'',
    pnums:'',
    SeatNumber:"",
    baseUrl:baseUrl
  },


  methods: {
    //获取车辆列表
    getCarList() {
      let that = this
      let starInfo2 = wx.getStorageSync('starInfo2')
      let endInfo2 = wx.getStorageSync('endInfo2')
      var storageSync = wx.getStorageSync('storageSync')
      var startDate = storageSync.startDate;
      var pcTimeSync = wx.getStorageSync('pcTimeSync')
      let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
      let ArrivalTime = startDate + ' ' + starTime
      var data =  {
        "IsExclusive": that.data.typeon == 'pc' ?  '100004-0000010002' : '100004-0000010001',
        "Id":that.data.lineId,
        "StartLat":starInfo2.startLait,
        "StartLng": starInfo2.startLont,
        "EndLat": endInfo2.endLait,
        "EndLng": endInfo2.endLont,
        "ArrivalTime":ArrivalTime
      }; 
      if(that.data.lineId){
        http.postRequest('/Api/DispatchMobile/getPriceListForLineId',data, '', (res) => {
          console.log('没有执行',res)
          if (res.code == '0') {
            that.setData({
              carTypeList:res.data,
            })
          }else{
            that.setData({
              isXia:false
            })
            if(res.msg!="请选择下车位置" && !that.data.isShowModal){
              wx.showModal({
                title: '服务范围提示',
                content: '不在营运线路范围内,下单请联系客服，电话:0351-6078977，是否电话？',
                confirmText:"确定",
                cancelText:"关闭",
                success (res) {
                  that.setData({
                    isShowModal:false
                  })
                  if (res.confirm) {
                    wx.makePhoneCall({
                      phoneNumber:"0351-6078977",
                    })
                  }
                }
              })
              that.setData({
                isShowModal:true
              })
            }
          }
        }, (err) => {
          console.log(err)
        })
      }  
     
     
    },
    //点击车型
    chooseCarType(e){
      let that = this;
      var index = e.currentTarget.dataset.index;
      if(that.data.carTypeList[index].CarSeatState) {
        let storedData = wx.getStorageSync('pcTimeSync') || {};
        let Car = that.data.carTypeList[index]
        let updatedData = { ...storedData, Price:Car.Price,PromotionDiscountType:Car.PromotionDiscountType,PromotionDiscount:Car.PromotionDiscount};
        wx.setStorageSync('pcTimeSync', updatedData);
        wx.setStorageSync('pcTypeId', Car.Id);
        wx.setStorageSync('SeatNumber', Car.SeatNumber);
        that.triggerEvent('updatedData');
        that.setData({
          carType:index,
        })
        that.triggerEvent('handleCar', Car); // 触发事件，并传递数据
      }
    },
    close(){
      this.setData({
        modelComponent:false
      })
    },
  }
})