import http from '../../utils/http';
// pages/noticeDetail/noticeDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:null,
    id:null,
    pageSize:1,
    titleSize:10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.id
    })
    this.reqList(false);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onUnload(){

  },
  reqList(isPage){
    let data = {
      messageTypeId:parseInt(this.data.id),
      pageSize:this.data.pageSize,
      titleSize:this.data.titleSize,
    }
    // http.postRequest("/v1/passenger/message/getAllMessageByMessageTypeId?messageTypeId="+this.data.id+'&pageSize='+this.data.pageSize+'&titleSize='+this.data.titleSize, '', wx.getStorageSync('header'), res =>{
    //   console.log('消息详情：',res)
    //   this.setData({
    //     loading: false
    //   })
    //   if(res.code === '1'){
    //     if(isPage){
    //       this.setData({
    //         list:this.data.list.concat(res.content),
    //       })
    //     }else{
    //       this.setData({
    //         list:res.content,
    //       })
    //     }
    //     if (res.content.length == 0) {
    //       this.setData({
    //         noMore: true
    //       })
    //     }
    //   }else{
    //     this.setData({
    //       loadingFailed: true
    //     })
    //   }
    // },err=>{
    //   console.log(err)
    //   this.setData({
    //     loadingFailed: true
    //   })
    //   return false;
    // })
    var datas = {"id":"1","title":"这是标题","messageInfo":"这是内容的封建等级分级分类介绍的链接发来的数据撒旦解放了世界的分厘卡据了解法拉利九点零分卡拉附件快乐老家四道口附近","timeDescribe":"2024-04-01 12:00:00","readState":"0"};
    this.setData({
      list:datas,
    })
  },
  //到达底部
  scrollToLower: function (e) {
    if (!this.data.loading && !this.data.noMore){
      this.setData({
        loading: true,
        pageSize: this.data.pageSize + 1
      })
      this.reqList(true);
    }
  },
})