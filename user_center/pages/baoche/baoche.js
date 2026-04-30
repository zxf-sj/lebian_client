// user_center/pages/baoche/baoche.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
import http from '../../../utils/http.js';
const debounce = require('../../../utils/debounce');
const app = getApp();
const throttle = require('../../../utils/throttle.js').throttle;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    distanceNav_Data:'',//出行日期、时间子->父->子传值
    carTypeList:[],//车型列表
    rangfenceMapList:[],//超范围列表
    price:"",//总价
    initialPrice: '', //初始票价
    baseUrl:'',
    version: 0,
    carType: 0, //车型选中下标
    textareaValue:"",//备注信息
    phone_number:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
   //获取用户须知
   this.getNews()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      baseUrl:baseUrl
    })
  },
  //手机号
  person_phone: debounce(function (res) {
    let _this = this
    let phone_number = res.detail.value;
    // const reg = /^1[3-9]\d{9}$/;
    // let isphone = reg.test(phone_number);
    // if(isphone) {
      _this.setData({
        phone_number
      })
    // } else {
    //   wx.showToast({
    //     title: '请输入正确的手机号',
    //     icon: 'error',
    //     duration: 2000
    //   })
    // }
  }, 500),
  information_phone_number(e) {
    console.log(e.detail)
    this.setData({
      phone_number:e.detail
    })
  },
  //获取车辆列表
  getCarList() {
    console.log('????????????')
    let that = this
    var userinfo = wx.getStorageSync('userInfo');
    let starInfo2 = wx.getStorageSync('starInfo2')
    let endInfo2 = wx.getStorageSync('endInfo2')
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    let starTime = pcTimeSync.StartTime.split(':')[0] + ':59:00'
    let ArrivalTime = startDate + ' ' + starTime
    var data = {
      IsExclusive: '100004-0000010001',
      Id: storageSync.lineId,
      StartLat: starInfo2.startLait,
      StartLng: starInfo2.startLont,
      EndLat: endInfo2.endLait,
      EndLng: endInfo2.endLont,
      ArrivalTime: ArrivalTime,
      MemberId: userinfo.Id,
      AdultNumber: 1,
    };
    console.log("shijin",pcTimeSync.StartTime)
    if (storageSync.lineId && pcTimeSync.StartTime) {
      http.postRequest('/Api/DispatchMobile/getPriceListForLineId', data, '', (res) => {
        if (res.code == '0') {
          //这里是默认值  默认选中第一辆车
          let data = res.data[0];
          // if(!data.CarSeatState) {
          //   data = res.data[1]
          //   that.setData({
          //     carType:1
          //   })
          // }
          wx.setStorageSync('pcTypeId', data.Id)
          // if (data.CarSeatState) {
            //默认价格 
            let price = 0
          console.log(res.data)
              price = data.Price + Number(data.Version)
            that.setData({
              rangfenceMapList: data.rangfenceMapList, //超范围列表
              carTypeList: res.data, //车型列表
              price, //总价
              initialPrice: data.Price, //初始票价
              version: Number(data.Version)
            })
          // } else {
          //   wx.showToast({
          //     title: 'CarSeatState : false',
          //     icon: 'error',
          //     duration: 2000
          //   })
          // }
        }
      }, (err) => {
        console.log(err)
      })
    }
  },
  //点击车型
  chooseCarType(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let data = that.data.carTypeList[index]
    wx.setStorageSync('pcTypeId', data.Id)
    // if (data.CarSeatState) {
      //默认价格 
      let price = data.Price + Number(data.Version)
      that.setData({
        rangfenceMapList: data.rangfenceMapList, //超范围列表
        price, //总价
        carType: index, //车型选中下标
        version: Number(data.Version),
      })
    // } else {
    //   wx.showToast({
    //     title: 'CarSeatState : false',
    //     icon: 'error',
    //     duration: 2000
    //   })
    // }
  },
  handletel() {
    let _this = this;
    if (_this.data.phone_number == '') {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      const reg = /^1[3-9]\d{9}$/;
      let isphone = reg.test(_this.data.phone_number);
      if (!isphone) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'error',
          duration: 2000
        })
        return false;
      } else {
        wx.showModal({
          title: '提示',
          content: '请确认手机号:' + _this.data.phone_number,
          success(res) {
            if (res.confirm) {
              console.log('用户单击确定');
              _this.callCar()
            } else if (res.cancel) {
              console.log('用户单击取消');
            }
          }
        });
      }
    }

  },
  // 叫车
  callCar:throttle(function(){
    let _this = this;
    const phoneStr = wx.getStorageSync('phoneStr');
    var openid = wx.getStorageSync('openid');
    if(!openid){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    var user = wx.getStorageSync('userInfo');//用
    var startInfo = wx.getStorageSync('starInfo2'); 
    var endInfo = wx.getStorageSync('endInfo2');
    var storageSync = wx.getStorageSync('storageSync')
    var pcTimeSync = wx.getStorageSync('pcTimeSync')
    var pcTypeId = wx.getStorageSync('pcTypeId');
    var note = wx.getStorageSync('textareaValue');
    var startDate = storageSync.startDate;
    if(!startInfo.startAddress){
      wx.showToast({
        title: '请选择出发乘车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(!endInfo.endAddress){
      wx.showToast({
        title: '请选择下车位置',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if (_this.data.phone_number == '') {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    console.log(pcTimeSync)
    console.log(pcTimeSync.StartTime)
    if (!pcTimeSync.StartTime) {
      wx.showToast({
        title: '请选择出发时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    let starTime =  pcTimeSync.StartTime.split(':')[0] + ':59:00'  
    let ArrivalTime =  startDate + ' ' + starTime
    let reqData = {
      PassengerLineId:storageSync.lineId,
      IntoLocation:startInfo.startAddress,
      IntoLongitude:startInfo.startLont,
      IntoLatitude:startInfo.startLait,
      OffLocation:endInfo.endAddress,
      OffLongitude:endInfo.endLont,
      OffLatitude:endInfo.endLait,
      Departure:"100004-0000980002",
      ArrivalTime:ArrivalTime,
      Personal:user.Id,
      DispatchListId:"",
      IsReservation:"100004-0000010002",
      CouponDetailsId:pcTimeSync.hasChooseId?pcTimeSync.hasChooseId:"",
      PersonalIds:_this.data.phone_number,
      Note:_this.data.textareaValue,
      IsExclusive:"100004-0000010001",
      IsPickGoods:'100004-0000010002',
      SelectCarType:pcTypeId, 
      OrderSource:"小程序",
      priceType:'100004-0001270001',
      AdultNumber:1,//成人数
      ChildNum:0,//儿童数
    };
    console.log('查线路')
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone='+_this.data.phone_number+'&timeDay='+startDate,'','', res => {
      console.log(res)
      if(res.code==0){
        if(res.count==0){
          if(this.data.dispatchListId){
            wx.showLoading({
              title: '车辆调度中',
            })
          }else{
            wx.showLoading({
              title: '加载中...',
            })
          }
          let that = this;
          console.log('下单')
          wx.request({
            url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
            data:reqData,
            method:"POST",
            success(res) {
              var ress = res.data
              console.log(ress)
              if (ress.code == '0') {
                  wx.hideLoading();
                  console.log('拿支付信息')
                  http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (res) => {
                    console.log(res)
                    if (res.code == 0) {
                      var data = JSON.parse(res.data);
                      wx.requestPayment({
                        timeStamp: data.timeStamp,
                        nonceStr: data.nonceStr,
                        package: data.package,
                        signType: 'MD5',
                        paySign: data.paySign,
                        success(res) {
                          console.log('回调',res)
                          wx.removeStorageSync('starInfo2'); 
                          wx.removeStorageSync('endInfo2');
                          wx.removeStorageSync('storageSync')
                          wx.removeStorageSync('pcTimeSync')
                          wx.removeStorageSync('personNum')
                          wx.removeStorageSync('pcTypeId');
                          wx.removeStorageSync('textareaValue');
                          wx.removeStorageSync('phoneStr')
                          wx.removeStorageSync('lineId');
                          console.log('拉起支付')
                          wx.showToast({
                            title: '支付成功',
                            icon: 'success',
                            duration: 2000,
                            success: function () {
                              console.log('支付成功')
                              that.setSubscribeMessage();
                              setTimeout(function () {
                                wx.reLaunch({
                                  url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                })
                              }, 1000)
                             
                              // if (that.data.orderDetail.IsPickGoods == '100004-0000010002') {
                              //   setTimeout(function () {
                              //     wx.redirectTo({
                              //       url: '/user_center/pages/payDetail/payDetail?orderId=' + that.data.orderDetail.Id,
                              //     })
                              //   }, 3000)
                              // } else {
                              //   setTimeout(function () {
                              //     wx.redirectTo({
                              //       url: '/user_center/pages/travelList/travelList?menuTapCurrent=1',
                              //     })
                              //   }, 3000)
                              // }
                            }
                          })
                        },
                        fail(res) {
                          console.log('拉起支付失败',res)
                          setTimeout(function () {
                            wx.reLaunch({
                              url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                            })
                          }, 1000)
                        }
                      })
                    } else {
                      wx.showToast({
                        title: res.msg,
                        icon: 'success',
                        duration: 2000,
                      })
                    }
                  }, (err) => {
                    console.log(err)
                  })
                 
              }else{
                wx.showToast({
                  title: ress.msg,
                  icon:'none',
                  duration:2000
                })
              }
            },
          })
        }else{
          var list = res.data;
          var str ="";
          list.forEach(function(item,index){
            str += item.PassengerLineId_Name+","+"订单号为:"+item.Code+"\n"
          });
          wx.showModal({
            title: '下单记录',
            content: str,
            cancelText:"取消下单",
            confirmText:"继续下单",
            complete: (res) => {
              if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/index/index',
                }) 
              }
              if (res.confirm) {
                if(this.data.dispatchListId){
                  wx.showLoading({
                    title: '车辆调度中',
                  })
                }else{
                  wx.showLoading({
                    title: '加载中...',
                  })
                }
                let that = this;
                console.log('去下单',reqData)
                if (!pcTimeSync.StartTime) {
                  wx.showToast({
                    title: '请选择出发时间',
                    icon: 'none',
                    duration: 2000
                  })
                  return false;
                }
                wx.request({
                  url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
                  data:reqData,
                  method:"POST",
                  success(res) {
                    console.log(res)
                    var ress = res.data
                    if (ress.code == '0') {
                        wx.hideLoading();
                        console.log('拿支付信息')
                        http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (res) => {
                          console.log(res)
                          if (res.code == 0) {
                            var data = JSON.parse(res.data);
                            console.log('拉起支付')
                            wx.requestPayment({
                              timeStamp: data.timeStamp,
                              nonceStr: data.nonceStr,
                              package: data.package,
                              signType: 'MD5',
                              paySign: data.paySign,
                              success(res) {
                                console.log('回调',res)
                                wx.removeStorageSync('starInfo2'); 
                                wx.removeStorageSync('endInfo2');
                                wx.removeStorageSync('storageSync')
                                wx.removeStorageSync('pcTimeSync')
                                wx.removeStorageSync('personNum')
                                wx.removeStorageSync('pcTypeId');
                                wx.removeStorageSync('textareaValue');
                                wx.removeStorageSync('phoneStr')
                                wx.removeStorageSync('lineId');
                                console.log('支付成功')
                                wx.showToast({
                                  title: '支付成功',
                                  icon: 'success',
                                  duration: 2000,
                                  success: function () {
                                    that.setSubscribeMessage();
                                    setTimeout(function () {
                                      wx.reLaunch({
                                        url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                      })
                                    }, 1000)
                                  }
                                })
                              },
                              fail(res) {
                                console.log('拉起支付失败',res)
                                setTimeout(function () {
                                  wx.reLaunch({
                                    url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                  })
                                }, 1000)
                              }
                            })
                          } else {
                            wx.showToast({
                              title: res.msg,
                              icon: 'success',
                              duration: 2000,
                            })
                          }
                        }, (err) => {
                          console.log(err)
                        })
                       
                    }else{
                      wx.showToast({
                        title: ress.msg,
                        icon:'none',
                        duration:2000
                      })
                    }
                  },
                })
              }
            }
          })
        }
      }else{
        wx.showToast({
          title: '数据请求失败，请稍后重试111',
          icon:"error"
        })
      }
    }, err => {
      console.log(1111,err)
    })
  },5000),
  setSubscribeMessage:function(){
    wx.requestSubscribeMessage({
      tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'],
      success(res) {
        if (res['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'] === 'accept') {
          console.log('用户同意接收订阅消息');
        } else {
          wx.showModal({
            title: '订阅消息',
            content: '您当前拒绝接受消息通知，是否去开启',
            confirmText: '开启授权',
            confirmColor: '#345391',
            cancelText: '仍然拒绝',
            cancelColor: '#999999',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting);
                  },
                  fail(err) {
                    //失败
                    console.log(err);
                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        }
      },
      fail(err) {
        console.log('请求订阅消息权限失败：', err);
      }
    });
  },
  //information 组件 triggerEvent 传值 
  updatedData(e) {
    console.log(e.detail)
    const newData = e.detail; 
    this.setData({
      distanceNav_Data: newData
    });
    //拉车型列表
    this.getCarList()
  },
   //点击备注信息
   handleRemarks() {
    this.setData({
      remark: true
    })
  },
  //备注信息传值
  handleTextareaValue(res) {
    this.setData({
      textareaValue: res.detail
    })
  },
   //用户须知
   showView() {
    let that = this;
    that.setData({
      isshow: true
    })
  },
  //用户须知__同意
  tongyi() {
    let that = this;
    that.setData({
      agree: true,
      isshow: false
    })
  },
  //用户须知__取消
  guanbi() {
    let that = this;
    that.setData({
      isshow: false,
      agree: false
    })
  },
  //获取用户须知
  getNews() {
    let that = this;
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        let content = res.data.Content;
        const WxParses = require('../wxParse/wxParse');
        WxParses.setImageDomain(BASE_URL);
        WxParses.wxParse('content', 'html', content, that, 5);
      }
    }, err => {
      console.log(err)
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})