import http from '../../utils/http';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeList: null,
    allRead:false,
    noMessage:false,
    page:1
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.getNoticeList()
  },

  getNoticeList() {
    var postData = {};
    var userinfo = wx.getStorageSync('userInfo');
    postData = {
      "FormTypeId":'200015-ad323eee0b2a41fe886e7c6e2f0bc28f',//贝壳
      //"FormTypeId":"200015-fd208d76e7b947338f7d0538c000346a",//网约
      "page":this.data.page,
      "limit":10,
      "MemberId":userinfo.Id
    }
    http.postRequest("/Api/DispatchMobile/GetNotice",postData, wx.getStorageSync('header'), res => {
      console.log('通知',res)
      if (res.code === 0) {
        if(this.data.page ==1){
            this.setData({
              noMessage:false,
              noticeList:res.data
            })
        }else{
          var noticeList = res.data
            this.setData({
              noticeList: this.data.noticeList.concat(noticeList)
            })
            if (res.data.length === 0) {
              this.setData({
                noMessage: false
              })
            }
        }
      }else{
        wx.showToast({
          title:"获取数据失败",
          icon:'none'
        })
        this.setData({
          noMessage:true,
        })
      }
    }, err => {
      console.log(err)
    })
  },
  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/noticeDetail/noticeDetail?id='+id,
    })
  },
  loadMore: function() {
    wx.showLoading({
      title: '正在加载中...',
    });
    let that = this;
    that.setData({
      page:this.data.page + 1
    })
    that.getNoticeList();
  }
})