// user_center/pages/invoiceDownload/invoiceDownload.js
import http from '../../../utils/http';

Page({
  data: {
      dataList:[],
      invoiceList:'',
      FormStateName:''
  },
  onLoad: function (options) {
    this.setData({
        FormStateName:options.FormStateName
    })
    this.getdataList(options.itemId)
  },
  onShow(){
   
  },
  onUnload(){
   
  },
  getdataList(itemId) {
    var usreinfo = wx.getStorageSync('userInfo');
        let _this = this;
        let reqData = {
            "Personal":usreinfo.Id,
            "Id":itemId
        }
      http.postRequest("/Api/DispatchMobile/GetMemberInvoiceInfo", reqData, wx.getStorageSync('header'), res => {
          _this.setData({
            dataList:res.data,
            invoiceList:res.totalRow
          })
        }, err => {
        
        })
  
  },
  look_invoice() {
    let _this = this;
    wx.navigateTo({
      url: '/user_center/pages/invoiceImg/invoiceImg?invoiceList=' + JSON.stringify(_this.data.invoiceList),
    })
  },
  //重新开票
  reissueInvoice() {
    let _this = this;
    wx.navigateTo({
        url: '/user_center/pages/invoice/invoice?orderId=' + _this.data.invoiceList.Id + '&type=重新开票',
    })
  },
  //到达底部
  scrollToLower: function (e) {
  
  },
})