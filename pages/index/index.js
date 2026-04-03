import http from '../../utils/http';
import util from "../../utils/util";
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL
const app = getApp();
Page({
  data: {
    showNotice: false,
    noticeCont: null,
    driverImg: '/assets/images/driver.png',
    // 远程
    fixedLine: false,
    loading: false,
    noMore: false,
    hideCityNoService: true,
    title: "乐遍家小程序已新版为新版本，系统还在优化升级中，会员使用过程中如有任何意见建议可在投诉建议提供您的宝贵留言~",
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    size: 28,
    marqueeWidth: 660,
    marqueeMargin: 40,
    avatar: "/assets/images/touxiang.png",
    showCoupon: false,
    hasNewOrder: false,
    orderId: "",
    type: "",
    IsPickGoods: "",
    latitude: "",
    longitude: "",
    markers: [],
    lunBoImg: [],
    imgUrl: "",
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    ischeck: false,
    listData: [],
    imgbaseUrl:""
  },
  onLoad: async function (opt) {
    //发布之前改时间 推迟几个小时
    var time = "2026-04-03 18:00:00";
    // var time = "2026-04-03 18:00:00";
    var t = util.formatTime(new Date());
    this.setData({
      ischeck: t < time ? true : false
    })
    this.setData({
      imgbaseUrl:baseUrl
    })
    await this.getSystemInfo();
    await this.getLunBo();
    wx.removeStorageSync('strAddress');
    wx.removeStorageSync('strLatitude');
    wx.removeStorageSync('strLongitude');
    wx.removeStorageSync('LineName');
    // wx.removeStorageSync('goType');
    // wx.removeStorageSync('yuYue');
    wx.removeStorageSync('endCity');
    wx.removeStorageSync('line_id');
    wx.removeStorageSync('lineId');
    // wx.removeStorageSync('TicketPrice');
    wx.removeStorageSync('endlong');
    wx.removeStorageSync('endlati');
    // wx.removeStorageSync('isyue');
    // wx.removeStorageSync('siteStr');
    // wx.removeStorageSync('cartypeId');
    // wx.removeStorageSync('startDate');
    // wx.removeStorageSync('Tindex');
    // wx.removeStorageSync('siteInfoStr');
    // wx.removeStorageSync('dispatchListId');
    // wx.removeStorageSync('tuijian');
    // wx.removeStorageSync('isTui');
    // wx.removeStorageSync('showCarType');
    // wx.removeStorageSync('renNum');
    wx.removeStorageSync('mrPrice');
    wx.removeStorageSync('ReservationDelay');
    wx.removeStorageSync('lineIndex');
    wx.removeStorageSync('lineItme');
    wx.removeStorageSync('startInfo');
    wx.removeStorageSync('endInfo');
    wx.removeStorageSync('totalNum');
    wx.removeStorageSync('personStr');
    wx.removeStorageSync('note');
    wx.removeStorageSync('startDate');
    wx.removeStorageSync('startTime');
    wx.removeStorageSync('timeIndex');
    wx.removeStorageSync('timeArr');
    wx.removeStorageSync('cartype');
    wx.removeStorageSync('cartypelist');
    // ======================
    wx.removeStorageSync('storageSync')
    wx.removeStorageSync('passengerList')
    wx.removeStorageSync('pcTimeSync')
    wx.removeStorageSync('starInfo2')
    wx.removeStorageSync('endInfo2')
    wx.removeStorageSync('textareaValue')
    wx.removeStorageSync('pcTypeId')
    wx.removeStorageSync('numberOfPeople')
    wx.removeStorageSync('SeatNumber')
    wx.removeStorageSync('personStr')
    wx.removeStorageSync('personNum')
    wx.removeStorageSync('phoneStr')
    // ======================
    this.getNotice();
    this.getFormTypeId();
    if (wx.getStorageSync('userInfo')) {
      this.getCanUesCoupan();
    }
    // let that = this;
    // wx.getSystemInfo({
    //   success:function(res){
    //     that.setData({
    //       windowHeight:res.windowHeight,
    //       windowWidth:res.windowWidth,
    //       buttonTop:res.windowHeight * 0.45,
    //       buttonLeft:res.windowWidth * 0.85
    //     })
    //   }
    // })
  },
  onShow() {
    this.setData({
      imgbaseUrl:baseUrl
    })
  //   let syncData = {
  //     "Birthday": "",
  //     "City": "Vip202506260800042232",
  //     "Code": "",
  //     "County": "",
  //     "CreateDate": "2025-06-26 08:00:04.000",
  //     "CreateUserId": "",
  //     "DeleteMark": "0",
  //     "FormTypeId": "200015-f419e6c12fd74fa38aa056396021ec4c",
  //     "FormTypeId_Name:": "会员乘客",
  //     "Gender": "100004-0000070001",
  //     "Gender_Name": "男",
  //     "HeadIcon": "",
  //     "Id": "300089-43ee037cfa4c4b118dd080023eb0788a",
  //     "LoginPassword": "123456",
  //     "MainAccount": "300090-af9d807d63f249ceab6767a3801cce35",
  //     "Name": "0",
  //     "Phone": "15203587622",
  //     "Province": "",
  //     "RealName": "",
  //     "StatusId": "100004-0000020001",
  //     "StatusId_Name": "启用",
  //     "Version": "0",
  //     "avatarUr": "",
  //     "nickName": "",
  //     "openid": "oG4kB7Khn6HKySxjHeLEMWCg4_C8"
  // }
  // wx.setStorageSync('userInfo', syncData)
    var _this = this;
    if (wx.getStorageSync('openid')) {
      _this.reqHasOrder();
    }
    _this.getNews();
    var length = _this.data.title.length * _this.data.size; //计算文字的长度
    _this.setData({
      length: length,
      // 当文字长度小于屏幕长度时，需要增加补白
      marqueeMargin: length < _this.data.marqueeWidth ? (_this.data.marqueeWidth - length) / 4 : _this.data.marqueeMargin
    })
    if (_this.data.length > _this.data.marqueeWidth) {
      _this.run1();
    }
    var openid = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userInfo');
    if (openid) {
      _this.setData({
        avatar: userinfo.HeadIcon ? app.globalData.httpsUrl + userinfo.HeadIcon : "/assets/images/touxiang.png"
      })
    }

  },
  
  ceshi() {
    wx.navigateTo({
      url: '/user_center/pages/ceshi/ceshi'
    })
  },
  getLunBo() {
    var userinfo = wx.getStorageSync('userInfo') || {Id:''};
    console.log(userinfo)
    http.getRequest("/api/CarPromotion/GetCompanyInfoImgList?Id=300007-fa5b6d0d40594f02ad91425ef44141eb&MemberId=" + userinfo.Id, '', '', res => {
      console.log('轮播图',res)
      if (res.code == 0) {
          this.setData({
            lunBoImg: res.data,
            imgUrl: app.globalData.httpsUrl,
            autoplay: true,
            indicatorDots: false,
            interval: 3000,
            duration: 500
          })
      }
    }, err => {
      console.log(err)
    })
  },
  getCanUesCoupan() {
    var userinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/NewMobile/LoginCoupon?MemberId=" + userinfo.Id + "&page=1&limit=10", '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        let data = res.data;
        if (data.length > 0) {
          const newList = data.map(item => ({
            ...item,
            LineName: item.LineName.replace(/===>/g, '>')
          }));
          this.setData({
            showCoupon: true,
            listData: newList
          })
        }
      }
    }, err => {
      console.log(err)
    })
  },
  getFormTypeId() {
    var code = app.globalData.companyCode;
    http.getRequest("/Api/DispatchMobile/CompanyConfig?Code=" + code, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        this.setData({
          FormTypeId: res.data[0].ConfigContent
        })
        wx.setStorageSync('FormTypeId', res.data[0].ConfigContent);
      }
    }, err => {
      console.log(err)
    })
  },
  run1: function () {
    var that = this;
    var mytime = setInterval(function () {
      if (-that.data.marqueeDistance < that.data.length) {
        that.setData({
          marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
        })
      } else {
        clearInterval(mytime);
        that.setData({
          marqueeDistance: that.data.marqueeWidth
        });
        that.run1();
      }
    }, 30)
  },
  // 转发
  onShareAppMessage(e) {
    console.log(e)
    return {
      title: '乐遍出行',
      imageUrl: "/assets/images/indexFX.jpg",
      path: "/pages/index/index",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  // 是否有未完成订单
  reqHasOrder() {
    let _this = this;
    var userinfo = wx.getStorageSync('userInfo');
    http.postRequest("/Api/DispatchMobile/getRideTicketOrderHome?userId=" + userinfo.Id, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        if (res.data.Id) {
          // if(res.data.DispatchListId && res.data.FormState=='100004-0001020002'){
          //   this.setData({
          //     orderId:res.data.Id,
          //     type:'taxiDriving',
          //     hasNewOrder:true,
          //     IsPickGoods:res.data.IsPickGoods
          //   })
          // }else if(!res.data.DispatchListId && res.data.FormState=='100004-0001020002'){
          //   this.setData({
          //     orderId:res.data.Id,
          //     type:'orderService',
          //     hasNewOrder:true,
          //     IsPickGoods:res.data.IsPickGoods
          //   })
          // }else if(res.data.DispatchListId && res.data.FormState !='100004-0001020002'){
          //   this.setData({
          //     orderId:res.data.Id,
          //     type:'payDetail',
          //     hasNewOrder:true,
          //     IsPickGoods:res.data.IsPickGoods
          //   })
          // }
          this.setData({
            orderId: res.data.Id,
            type: 'taxiDriving',
            hasNewOrder: true,
            IsPickGoods: res.data.IsPickGoods
          })
        }
      }
    }, err => {})
  },
  goDeTail() {
    let that = this;
    var type = that.data.type;
    var orderId = that.data.orderId;
    var IsPickGoods = that.data.IsPickGoods;
    // if(type=='taxiDriving'){
    //   wx.navigateTo({
    //     url: '/driving_status/pages/taxiDriving/taxiDriving?orderId='+orderId
    //   })
    // }else if(type=='orderService'){
    //   wx.navigateTo({
    //     url: '/driving_status/pages/orderService/orderService?order_id='+orderId+"&from=call"
    //   })
    // }else{
    if (IsPickGoods == '100004-0000010002') {
      wx.navigateTo({
        url: '/user_center/pages/payDetail/payDetail?from=orderList&orderId=' + orderId
      })
    } else {
      wx.navigateTo({
        url: '/user_center/pages/travelList/travelList?menuTapCurrent=1'
      })
    }
    //}
  },
  showUser() {
    var openid = wx.getStorageSync('openid');
    if (openid) {
      wx.navigateTo({
        url: "/user_center/pages/personalCenter/personalCenter",
      })
    } else {
      wx.navigateTo({
        url: "/user_center/pages/login/login",
      })
    }
  },
  //关闭优惠券弹窗
  handleClose() {
    this.setData({
      showCoupon: false
    })
  },
  closeCoupon() {
    wx.navigateTo({
      url: "/driving_status/pages/payCard/payCard",
    })
   
  },
  hideDelModal() {
    this.setData({
      showDel: null
    })
  },
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: '0351-6078977',
      success() {
        console.log('拨打成功')
      }
    })
  },
  getNotice() {
    let that = this;
    that.setData({
      showNotice: false,
      noticeCont: "太交专车上线啦！！！"
    })
    app.globalData.reqNotice = false;
  },
  closeNotice() {
    this.setData({
      showNotice: false,
    })
  },
  //领取
  couponCheck() {
    let that = this;
    wx.navigateTo({
      url: "/driving_status/pages/payCard/payCard",
    })
    // var userinfo = wx.getStorageSync('userInfo');
    // let ids = that.data.listData.map(item => item.Id)
    // let idStr = ids.join(',')
    // http.getRequest("/Api/NewMobile/ClaimCoupon?MemberId=" + userinfo.Id + "&CouponId=" + idStr, '', wx.getStorageSync('header'), res => {
    //   if (res.code === 0) {
    //     console.log(res)
    //     console.log('领取成功2')
    //     wx.showToast({
    //       title: '领取成功',
    //       icon: 'none',
    //     })
    //     that.setData({
    //       showCoupon: false
    //     })
    //   }
    // }, err => {
    //   console.log(err)
    // })
    // wx.navigateTo({
    //   url: '/user_center/pages/coupon/coupon',
    // })
  },
  // getList(){
  //   var userinfo = wx.getStorageSync('userInfo');
  //   http.getRequest("/Api/NewMobile/LoginCoupon?MemberId="+userinfo.Id+"&page=1&limit=10",'',wx.getStorageSync('header'),res=>{
  //     if(res.code === 0){
  //       let data = res.data;
  //       const newList = data.map(item => ({
  //         ...item,
  //         LineName: item.LineName.replace(/===>/g, '>')
  //       }));
  //       this.setData({
  //         listData:newList  
  //       })
  //     }
  //   },err=>{
  //     console.log(err)
  //   })
  // },
  toMyIntegral() {
    wx.navigateTo({
      url: '/user_center/pages/integral/integral',
    })
  },
  getSystemInfo() {
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        wx.setStorageSync('servicePhone', res.data.Phone);
        wx.setStorageSync('LayerOrder', res.data.LayerOrder);
        wx.setStorageSync('IsBalance', res.data.IsBalance);
      }
    }, err => {
      console.log(err)
    })
  },
  getNews() {
    var data = {
      "FormTypeId": app.globalData.formIdType,
      "page": "1",
      "limit": "10",
    };
    http.postRequest("/Api/DispatchMobile/GetRideTicket", data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        var data = res.data;
        this.setData({
          title: data[0].MainContent
        })
      }
    }, err => {
      console.log(err)
    })
  },
  pingche() {
    var openid = wx.getStorageSync('openid');
    // if (openid) {
    wx.navigateTo({
      url: '/pages/pingche/pingche',
    })
    // } else {                                                                           
    //   wx.navigateTo({
    //     url: "/user_center/pages/login/login",
    //   })
    // }
  },
  duxiang() {
    var openid = wx.getStorageSync('openid');
    // if (openid) {
    wx.navigateTo({
      url: '/pages/duxiang/duxiang',
    })
    // } else {
    //   wx.navigateTo({
    //     url: "/user_center/pages/login/login",
    //   })
    // }
  },
  zuche() {
    
      wx.navigateTo({
        url: '/pages/zuche/zuche',
      })
   
  },
  huodong() {
    wx.showModal({
      title: '定制活动',
      content: '定制活动客服电话:0351-6078977' + "\n" + '手机号15034051525',
    })
  },
  ad() {
    wx.showModal({
      title: '乐遍广告',
      content: '广告咨询电话:0351-6078977' + "\n" + '手机号15034051525',
    })
  },
  hezuo() {
    // wx.navigateTo({
    //   url: "/user_center/pages/coupon/coupon",
    // })
     wx.navigateTo({
      url: "/driving_status/pages/payCard/payCard",
    })
    // wx.showModal({
    //   title: '乐遍合作',
    //   content: '合作咨询电话:0351-6078977',
    // })
  },
  order() {
   
      wx.navigateTo({
        url: '/user_center/pages/travelList/travelList',
      })
  
  },
  kaipiao() {
    
      wx.navigateTo({
        url: '/user_center/pages/invoiceList/invoiceList',
      })
   
  },
  tousu() {
    // var openid = wx.getStorageSync('openid');
    // if (openid) {
      wx.navigateTo({
        url: '/user_center/pages/complaint/complaint?orderId=00000',
      })
    // } else {
    //   wx.navigateTo({
    //     url: "/user_center/pages/login/login",
    //   })
    // }
  },
  bar() {
    wx.navigateTo({
      url: '/pages/bar/bar',
    })
  },
  shaohuo() {
    wx.navigateTo({
      url: '/driving_status/pages/beforeOrder/beforeOrder',
    })
  },
  my() {
    // var openid = wx.getStorageSync('openid');
    // if (openid) {
      wx.navigateTo({
        url: '/user_center/pages/personalCenter/personalCenter',
      })
    // } else {
    //   wx.navigateTo({
    //     url: '/user_center/pages/login/login',
    //   })
    // }
  },
  peizhen() {
  
      wx.navigateTo({
        url: '/driving_status/pages/peizhenList/peizhenList',
      })
  
  },
  lvyou() {
    // var openid = wx.getStorageSync('openid');
    // if (openid) {
      wx.navigateTo({
        url: '/driving_status/pages/lvyouList/lvyouList',
      })
    // } else {
    //   wx.navigateTo({
    //     url: '/user_center/pages/login/login',
    //   })
    // }
  },
  chengji() {
    // var openid = wx.getStorageSync('openid');
    // if (openid) {
      wx.navigateTo({
        url: '/pages/chengji/chengji',
      })
    // } else {
    //   wx.navigateTo({
    //     url: '/user_center/pages/login/login',
    //   })
    // }

  },
  onShareTimeline() {
    return {
      title: '乐遍出行',
      imageUrl: '/assets/images/share.jpg' // 自定义图片（建议尺寸 1080*1920）
    }
  }
})