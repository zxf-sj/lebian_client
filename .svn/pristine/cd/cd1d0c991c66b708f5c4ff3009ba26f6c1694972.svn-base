// user_center/pages/integral/integral.js
import http from '../../../utils/http';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingFailed: false,
    loading: false,
    noMore: false,
    pageNo: 1,
    number:0,
    listData: null,
    hasOrder:true,
  },
  onLoad: async function (opt) {

  },
  onShow: function () {
    this.setData({
      pageNo:1
    })
    this.reqData(false);
  },

  reqData(isPage) {
    // let data = {
    //   businessType:0,
    //   cityCode:"",
    //   pageSize:10,
    //   currentPage:this.data.pageNo
    // }
    var userinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/DispatchMobile/GetScores?MemberId="+userinfo.Id, '', wx.getStorageSync('header'), res => {
      this.setData({
        loading: false
      })
      if(res.code==0){
        console.log(res);
        this.setData({
          number:res.data.Score
        })
      }
    }, err => {
      console.log(err)
    })
  },
  //到达底部
  scrollToLower: function (e) {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({
        loading: true,
        pageNo: this.data.pageNo + 1
      });
      this.reqData(true);
    }
  },

  toIntegralDetail(e){
    wx.navigateTo({
      url: '/user_center/pages/integralDetail/integralDetail?score='+e.currentTarget.dataset.score,
    })
  },

  toMyOrder(){
    wx.navigateTo({
      url: '/user_center/pages/travelList/travelList',
    })
  },

  toGoodsDetail(e){
    wx.navigateTo({
      url: '/user_center/pages/integralGoodsDetail/integralGoodsDetail?item='+JSON.stringify(e.currentTarget.dataset.item),
    })
  }
})