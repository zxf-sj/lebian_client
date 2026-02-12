import http from '../../../utils/http';
const app = getApp();
Page({
  data: {
    loadingFailed: false,
    loading: false,
    noMore: false,
    pageNo: 1,
    listData: null,
    FormTypeId:"",
  },
  onLoad: function (options) {
  },
  onShow(){
    this.getFormTypeId();
  },
  onUnload(){
  },
  //到达底部
  scrollToLower: function (e) {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({
        loading: true,
        pageNo: this.data.pageNo + 1
      });
      this.getOrderList(true,this.data.FormTypeId);
    }
  },
  getFormTypeId(){
    http.getRequest("/Api/DispatchMobile/CompanyConfig?Code="+app.globalData.companyCode,'', wx.getStorageSync('header'), res => {
      if(res.code==0){
        this.setData({
          FormTypeId:res.data[0].ConfigContent
        })
        wx.setStorageSync('FormTypeId', res.data[0].ConfigContent);
        this.getOrderList(false,res.data[0].ConfigContent);
      }
    }, err => {
      console.log(err)
    })
  },
  // 查询订单
  getOrderList(isPage,FormTypeId) {
    let that = this;
    var usreinfo = wx.getStorageSync('userInfo');
    let reqData = {
      limit: 10,
      page: that.data.pageNo,
      Personal:usreinfo.Id,
      FormTypeId:FormTypeId,
      Where:"FormState='100004-0001020004' and IsPayment = '100004-0000010001'"
    }
    http.postRequest("/Api/DispatchMobile/GetRideTicket", reqData, wx.getStorageSync('header'), res => {
      that.setData({
        loading: false
      })
      if(isPage){
        if (res.code == 0) {
            if (isPage) {
              var listData = res.data
              that.setData({
                listData: this.data.listData.concat(listData)
              })
            } else {
              that.setData({
                listData:res.data
              })
            }
        }
      }else{
        if (res.code == 0) {
          if (isPage) {
            var listData = res.data
            that.setData({
              listData: this.data.listData.concat(listData)
            })
          } else {
            that.setData({
              listData:res.data
            })
          }
        }else{
          that.setData({
            noOrder:true
          })
        }
      }
    }, err => {
      this.setData({
        loadingFailed: true
      })
      return false;
    })
  },
  toKaiPiao(e){
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/driving_status/pages/kaipiao/kaipiao?orderId='+orderId,
    })
  },
})