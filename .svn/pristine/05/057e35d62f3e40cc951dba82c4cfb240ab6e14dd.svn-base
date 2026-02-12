const app = getApp(); // 获取 App实例
import http from '../../../utils/http';
Page({
  data: {
    title:"我的余额",//名称
    arrow:true,//右箭头
    wxinfo:{},
    xcxinfo:{},
    list:[],//列表
    page:1,
    limit:10,
    imgym:app.globalData.imgym,//图片域名
    Balance:0,//我的积分
    listempty:false, //空是true"
  },
  onLoad(options) {
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
  // 初始化
  async init () {
    var that=this;
    await wx.showLoading() // 显示loading
    await that.getBalance();
    await that.getlist()//请求数据
    await wx.hideLoading() // 等待请求数据成功后，隐藏loading
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
  //余额记录
  getlist(){
    var that=this;
    var wxinfo = wx.getStorageSync("userInfo");
    var data={
      MemberId:wxinfo.Id,
      page:that.data.page,
      limit:that.data.limit
    };
    http.getRequest('/Api/NewMobile/MyMemberBalanceLog',data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        if(that.data.page==1){
          that.setData({
            list:res.data
          })
        }else{
          that.setData({
            list:that.data.list.concat(res.data),
          })
        }
        if(that.data.list.length>0){
          that.setData({
            listempty:false
          })
        }
      }else{
        that.setData({
          listempty:true
        })
      }
    }, err => {
      console.log(err)
    })
  },
  //返回
  onClickLeft() {
    let pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({//返回
        delta: 1
      });
    }
    if (pages.length <= 1) {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
  // 上拉刷新
  onReachBottom: function (e) {
    var that=this;
    that.setData({
      page:that.data.page+1
    },function(){
      that.getlist();
    })
  },
  goChargingMoney(e){
    wx.navigateTo({
      url: '/user_center/pages/chargeMoney/chargeMoney',
    })
  },
})