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
    var score = options.score;
    this.setData({
      number:score
    })
  },

  onShow: function () {
    this.setData({
      pageNo:1
    })
    this.reqData(false);
  },

  reqData(isPage) {
    var userinfo = wx.getStorageSync('userInfo');
    let url = "/Api/DispatchMobile/GetScoreLog?MemberId="+userinfo.Id+"&limit=10&page="+ this.data.pageNo;
    http.getRequest(url, '', wx.getStorageSync('header'), res => {
      this.setData({
        loading: false
      })
      if (res.code == 0) {
        let listData = res.data;
        if (isPage) {
          this.setData({
            listData: this.data.listData.concat(listData)
          })
          if (res.data.length === 0) {
            this.setData({
              noMore: true
            })
          }
        } else {
          if (res.data.length === 0) {
            this.setData({
              hasOrder: false
            })
          }else{
            this.setData({
              listData,
              hasOrder:true
            })
          }
        }
      } else {
        this.setData({
          hasOrder: false
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

  toIntegral(){
    wx.navigateBack({
      delta: 1,
    })
  },

  toOrder(){
    wx.navigateTo({
      url: '/user_center/pages/integralOrderList/integralOrderList',
    })
  },
})