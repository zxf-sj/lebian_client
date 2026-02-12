const app = getApp(); // 获取 App实例
import http from '../../../utils/http';
Page({
  data: {
    title:"预存",//名称
    arrow:true,//右箭头
    wxinfo:{},
    xcxinfo:{},
    Balance:0,//余额
    list:[],//列表
    listindex:0,
    listempty:true,
    page:1,
    limit:10,
    imgym:app.globalData.imgym,//图片域名
  },
  onLoad(options) {
    var that=this;
  },
  // 初始化
  async init () {
    var that=this;
    await wx.showLoading() // 显示loading
    await that.getBalance();
    await that.getlist()//请求数据
    await wx.hideLoading() // 等待请求数据成功后，隐藏loading
  },
  onShow(){
    var that=this;
    var wxinfo = wx.getStorageSync("userInfo");
    if(!wxinfo){
      wx.showToast({
        title: "请先登录",
        icon: "none",
        durantion: 1000,
        success: function () {
          wx.navigateTo({
            url: '/user_center/pages/login/login',
          })
        },
      });
      return;
    }
    that.setData({
      wxinfo:wxinfo,
      page:1,
      limit:10,
    },function(){
      that.init();
    })
  },
  //选中
  listclick(e){
    var that=this;
    var index=e.currentTarget.dataset.index;
    that.setData({
      listindex:index
    })
  },
  //充值余额
  getBalance(){
    var that=this;
    var wxinfo = wx.getStorageSync("userInfo");
    http.getRequest('/Api/NewMobile/MyMemberBalance?MemberId='+wxinfo.Id,'', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        var num = res.data.Balance;
        that.setData({
          Balance:num.toFixed(2)
        })
      }
    }, err => {
      console.log(err)
    })
  },
  //充值金额列表
  getlist(){
    var that=this;
    http.getRequest('/Api/NewMobile/GetChargingMoney','', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        that.setData({
          list:res.data
        })
        if(that.data.list.length>0){
          that.setData({
            listempty:false
          })
        }
      }
    }, err => {
      console.log(err)
    })
  },
  //充值
  ChargingMoney(){
    var that=this;
    var listindex=that.data.listindex;
    var info=that.data.list[listindex];
    var wxinfo = wx.getStorageSync("userInfo");
    var data={
      Id:info.Id,
      MemberInfoId:wxinfo.Id
    };
    http.getRequest('/Api/Mobile/PayChargingMoney?Id='+info.Id+"&MemberInfoId="+wxinfo.Id,data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        res.data=JSON.parse(res.data);
        wx.requestPayment({
          "timeStamp": res.data.timeStamp,
          "nonceStr": res.data.nonceStr,
          "package": res.data.package,
          "signType": res.data.signType,
          "paySign": res.data.paySign,
          "success": function(sres) {
            wx.showToast({
              title: '支付成功',
              icon: "success",
              durantion: 1000,
              success(){
                that.ChargingMoneyQuery(res.data.Id);
              }
            });
          },
          "fail": function(fres) {
            wx.showToast({
              title: "支付失败",
              icon: "none",
              durantion: 1000,
            });
          },
        });
      }else{
        wx.showToast({
          title: res.msg,
          icon: "none",
          durantion: 1000,
        });
      }
    }, err => {
      console.log(err)
    })
  },
  //充值查单
  ChargingMoneyQuery(id){
    http.getRequest('/Api/Mobile/ChargingMoneyQuery?Id='+id,'', wx.getStorageSync('header'), res => {
      setTimeout(function () {
        wx.navigateBack({//返回
          delta: 1
        });
      }, 1000) //延迟时间
    }, err => {
      console.log(err)
    })
  },
})