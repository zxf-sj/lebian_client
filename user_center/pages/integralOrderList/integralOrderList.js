import http from '../../../utils/http';
Page({
  data: {
    loadingFailed: false,
    loading: false,
    noMore: false,
    pageNo: 1,
    number:0,
    listData: null,
    isVip:false,
    hasOrder:true,
  },

  onLoad: function (options) {
    
  },

  onShow: function () {
    this.reqData(false);
  },

  reqData(isPage) {
    // let url = "/v2/passenger/integral/exchangeRecordList?pageSize=10&currentPage=" + this.data.pageNo;
    // http.postRequest(url, '', wx.getStorageSync('header'), res => {
    //   this.setData({
    //     loading: false
    //   })
    //   if (res.code === '1') {
    //     let listData = res.content;
    //     if (isPage) {
    //       this.setData({
    //         listData: this.data.listData.concat(listData)
    //       })
    //       if (res.content.length === 0) {
    //         this.setData({
    //           noMore: true
    //         })
    //       }
    //     } else {
    //       this.setData({
    //         listData
    //       })
    //       if (res.content.length === 0) {
    //         this.setData({
    //           hasOrder: false
    //         })
    //       }else{
    //         this.setData({
    //           listData,
    //           hasOrder:true
    //         })
    //       }
    //     }
    //   } else {
    //     this.setData({
    //       loadingFailed: true
    //     })
    //   }
    // }, err => {
    //   console.log(err)
    // })
    this.setData({
      listData:[],
      hasOrder:false
    })
  },

  //到达底部
  scrollToLower: function (e) {
    console.log(1)
    if (!this.data.loading && !this.data.noMore) {
      this.setData({
        loading: true,
        pageNo: this.data.pageNo + 1
      });
      this.reqData(true);
    }
  },

  toIntegral(){
    wx.navigateTo({
      url: '/user_center/pages/integral/integral',
    })
  },
})