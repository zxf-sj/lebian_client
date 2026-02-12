const app = getApp();
import http from '../../../utils/http';
Page({
  data: {
    current: 0,
    attitude: true,
    time: true,
    efficiency: true,
    environment: true,
    professional: true,
    jishu:true,
    userStars: [
      "/assets/images/stars.png",
      "/assets/images/stars.png",
      "/assets/images/stars.png",
      "/assets/images/stars.png",
      "/assets/images/stars.png"
    ],
    wjxScore: 5,
    // textarea
    min: 5,//最少字数
    max: 300, //最多字数 (根据自己需求改变)
    //pics: [],
    content:'',
    orderId:""
  },
  // 星星点击事件
  starTap: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index; // 获取当前点击的是第几颗星星
    var tempUserStars = this.data.userStars; // 暂存星星数组
    var len = tempUserStars.length; // 获取星星数组的长度
    for (var i = 0; i < len; i++) {
      if (i <= index) { // 小于等于index的是满心
        tempUserStars[i] = "/assets/images/stars.png";
        that.setData({
          wjxScore: i + 1,
        })
      } else { // 其他是空心
        tempUserStars[i] = "/assets/images/kxing.png"
      }
    }
    // 重新赋值就可以显示了
    that.setData({
      userStars: tempUserStars
    })
  },
  // 标签
  label: function (e) {
    var that = this;
    that.setData({
      attitude: !e.currentTarget.dataset.index
    })
  },
  label1: function (e) {
    var that = this;
    that.setData({
      time: !e.currentTarget.dataset.index
    })
  },
  label2: function (e) {
    var that = this;
    that.setData({
      efficiency: !e.currentTarget.dataset.index
    })
  },
  label3: function (e) {
    var that = this;
    that.setData({
      environment: !e.currentTarget.dataset.index
    })
  },
  label4: function (e) {
    var that = this;
    that.setData({
      professional: !e.currentTarget.dataset.index
    })
  },
  label5: function (e) {
    var that = this;
    that.setData({
      jishu: !e.currentTarget.dataset.index
    })
  },
  // 留言
  //字数限制
  inputs: function (e) {
    // 获取输入框的内容
    var value = e.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);
    //最多字数限制
    if (len > this.data.max)
    return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentWordNumber: len, //当前字数
      content:value
    });
  },
  // 图片
  // choose: function (e) {//这里是选取图片的方法
  //   var that = this;
  //   var pics = that.data.pics;
  //   wx.chooseImage({
  //     count: 5 - pics.length, // 最多可以选择的图片张数，默认9
  //     sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
  //     sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
  //     success: function (res) {
  //       var imgsrc = res.tempFilePaths;
  //       pics = pics.concat(imgsrc);
  //       console.log(pics);
  //       // console.log(imgsrc);
  //       that.setData({
  //         pics: pics,
  //         // console.log(pics),
  //       });
  //     },
  //     fail: function () {
  //       // fail
  //     },
  //     complete: function () {
  //       // complete
  //     }
  //   })

  // },
  // uploadimg: function () {//这里触发图片上传的方法
  //   var pics = this.data.pics;
  //   console.log(pics);
  //   app.uploadimg({
  //     url: 'https://........',//这里是你图片上传的接口
  //     path: pics//这里是选取的图片的地址数组
  //   });
  // },
  onLoad: function (options) {
    this.setData({
      orderId:options.orderId
    })
  },
  // 删除图片
  // deleteImg: function (e) {
  //   var pics = this.data.pics;
  //   var index = e.currentTarget.dataset.index;
  //   pics.splice(index, 1);
  //   this.setData({
  //     pics: pics
  //   });
  // },
  // 预览图片
  // previewImg: function (e) {
  //   //获取当前图片的下标
  //   var index = e.currentTarget.dataset.index;
  //   //所有图片
  //   var pics = this.data.pics;
  //   wx.previewImage({
  //     //当前显示图片
  //     current: pics[index],
  //     //所有图片
  //     urls: pics
  //   })
  // },
  handleBtn(){
    var userInfo = wx.getStorageSync('userInfo');
    var data = {};
    data = {
      "FormType": "200015-fd38fd819a2f4fba99a1f6c51377a9db",
      "FormId": this.data.orderId,
      "LikeLevel":this.data.wjxScore,
      "Content": this.data.content,
      "MemberId":userInfo.Id
    }

    http.postRequest('/Api/DispatchMobile/CommentAdd',data, wx.getStorageSync('header'), (res) => {
      if (res.code == 0) {
        wx.showToast({
          title: '评价成功',
          icon:'success',
          duration:3000,
          success:function(res){
            wx.navigateBack(-1);
          }
        })
      }else{
        wx.showToast({
          title: '评价失败',
          icon:'error',
          duration:2000
        })
      }
    }, (err) => {
      console.log(err)
    })
  }
})