const BASE_URL = require("../../../utils/BASE_URL");
var http = require('../../../utils/httpLogin.js');
const app = getApp();
//const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';
Page({
  data: {
    hiddenLoading: false,
    agree:"",
    // avatarUrl: defaultAvatarUrl,
    // nickname:"",
    // headurl:''
  },
  onLoad(){},
  onShow() {
    this.setData({
      hiddenLoading: true
    })
  },
  //获取手机号
  getphonenumber(e) {
    wx.showLoading({
        title: '加载中...',
      })
      if (this.data.agree == ''){
        wx.showToast({
          title: '请勾选用户协议',
          icon: 'none',
          duration: 2000
        })
      } else {
        let res1 = wx.getWindowInfo();
        wx.setStorageSync('systemInfo', res1);
        if (e.detail.errMsg == "getPhoneNumber:ok") { //授权
            let code;
            wx.login({
              success(res) {
                code = res.code;
                let iv = e.detail.iv;
                let encryptedData = e.detail.encryptedData;
                let params = {
                  "LayerOrder":1,
                  "nickName" :'微信用户',
                  "avatarUrl":'https://wwww.qierchuxing.com/upload/Images/202405/c1dbbb9f35d84f64a491f4887caacc2e.png',
                  encryptedData,
                  iv,
                  code: code,
                }
                wx.request({
                  url: BASE_URL.BASE_URL + '/Api/DispatchMobile/LoginSignUp',
                  data: params,
                  method: 'POST',
                  success(res3) {
                    if (res3.data.code == 0) {
                      const header = {
                        "user_id":res3.data.data.Id
                      };
                      wx.setStorageSync('openid', res3.data.data.openid)
                      wx.setStorageSync('header', header);
                      wx.setStorageSync('userInfo', res3.data.data);
                      wx.setStorageSync('phoneNumber', res3.data.data.Phone);
                      wx.navigateBack({
                        delta: 1,
                      })
                    } else {
                      wx.showToast({
                        title: res3.data.msg,
                        icon: 'none'
                      });
                    }
                  },
                  fail(err) {
                    console.log(err)
                  },
                  complete() {
                    setTimeout(() => {
                      wx.hideLoading()
                    }, 100);
                  }
                })
              }
            })
          } else { //用户点击拒绝
            wx.hideLoading();
          }
      }
  },
  //获取手机号
  getUserInfo(e) {
    wx.showLoading({
      title: '加载中...',
    })
    if (this.data.agree == ''){
      wx.showToast({
        title: '请勾选用户协议',
        icon: 'none',
        duration: 2000
      })
    }else{
      // var nickname = this.data.nickname;
      // var headurl = this.data.headurl;
      // var avatarUrl = this.data.avatarUrl;
      // if(nickname==''){
      //   wx.showToast({
      //     title: '请点击确认昵称',
      //     icon:'none',
      //   })
      //   return false;
      // }
      let res1 = wx.getWindowInfo();
      wx.setStorageSync('systemInfo', res1)
      if (e.detail.errMsg == "getUserInfo:ok") { //授权
        let code;
        wx.login({
          success(res) {
            code = res.code;
            let iv = e.detail.iv;
            let encryptedData = e.detail.encryptedData;
            let params = {
              "LayerOrder":1,
              "nickName" :'微信用户',
              "avatarUrl":'https://wwww.qierchuxing.com/upload/Images/202405/c1dbbb9f35d84f64a491f4887caacc2e.png',
              encryptedData,
              iv,
              code: code,
            }
            wx.request({
              url: BASE_URL.BASE_URL + '/Api/DispatchMobile/LoginSignUp',
              data: params,
              method: 'POST',
              success(res3) {
                if (res3.data.code == 0) {
                  const header = {
                    "user_id":res3.data.data.Id
                  };
                  wx.setStorageSync('openid', res3.data.data.openid)
                  wx.setStorageSync('header', header);
                  wx.setStorageSync('userInfo', res3.data.data);
                  wx.setStorageSync('phoneNumber', res3.data.data.Phone);
                  wx.navigateBack({
                    delta: 1,
                  })
                } else {
                  wx.showToast({
                    title: res3.data.msg,
                    icon: 'none'
                  });
                }
              },
              fail(err) {
                console.log(err)
              },
              complete() {
                setTimeout(() => {
                  wx.hideLoading()
                }, 100);
              }
            })
          }
        })
      } else { //用户点击拒绝
        wx.hideLoading();
      }
    }
  },
  checkboxChange(e){
    const values = e.detail.value;
    this.setData({
      agree:values[0]
    })
  },
  gotoxieyi(){
    wx.navigateTo({
      url: '/user_center/pages/agreement/agreement',
    })
  },
  goyinsi(){
    wx.navigateTo({
      url: '/user_center/pages/yinsi/yinsi',
    })
  },
  quxiao(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
  // onChooseAvatar(e) {
  //   const { avatarUrl } = e.detail 
  //   this.setData({
  //     avatarUrl,
  //   })
  //   wx.uploadFile({
  //     url: BASE_URL.BASE_URL+'/Api/mobile/Picture', // 图片上传的接口地址，需要根据自己的实际情况填写
  //     filePath:avatarUrl , // 要上传的图片的本地路径
  //     name: 'file', // 上传图片时对应的参数名称，后端根据这个参数名称获取文件数据
  //     formData: { // 其他额外的参数
  //       'user': 'test'
  //     },
  //     success: (res) => {
  //       let data = JSON.parse(res.data) // 解析接口返回的数据
  //       if (data.code === 1) {
  //         this.setData({
  //           headurl:data.data
  //         })
  //       }
  //     }
  //   })
  // },
  // bindName(e){
  //   this.setData({
  //     nickname:e.detail.value
  //   })
  // },
  // onSubmit(e) {
  //   const { nickname } = e.detail.value;
  //   if(e.detail.value.nickname==''){
  //     wx.showToast({
  //       title: '请输入昵称',
  //       icon:'none'
  //     })
  //   }else{
  //     this.setData({
  //       nickname
  //     })
  //     wx.showToast({
  //       title: '已确认',
  //       icon:'none'
  //     })
  //   }
  // }
})