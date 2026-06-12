import http from '../../../utils/http';
import util from "../../../utils/util";
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const throttle = require('../../../utils/throttle').throttle;
const app = getApp();
Page({
  data: {
    baseUrl: '',

    activeTab: 0,
    activeTab2: 0,
    starInfo: '',
    endInfo: '',
    starting_point: '',
    endting_point: '',
    tabs: ['旅游包车', '旅游租车', '协议客户'],
    tabs2: ['环城易租', '悦驾易租', '环城易驾'],
    // 模拟车型数据 (图片使用了占位图，实际开发请替换为真实URL)
    carList: [],
    timeArr: [],
    selectedCarId: '', // 默认选中第一个
    roundTrip: false, //单程、往返
    arrivalTime: '', //包车时间
    // 行程类型
    tripTypes: [{
        name: '单程',
        value: 'one_way',
        checked: true
      },
      {
        name: '往返',
        value: 'round_trip',
        checked: false
      }
    ],
    lvyouTel: '',
    lvyouTel_phoneError: '',
    hcyzTel: '',
    hcyzTel_phoneError: '',
    hcyjTel: '',
    hcyjTel_phoneError: '',
    lvyou_date: '请选择日期',
    rentCarList: [],
    yizu_zucheDay: '请选择租用日期',
    yizu_zucheTime: '',
    yizu_huancheDay: '请选择还车日期',
    yizu_huancheTime: '',
    hcyz_remake: '',
    hcyz_carId: '',
    daijia_list: [],
    hcyj_qidian: '',
    hcyj_zhongdian:'',
    daijia_direction: '',
    PassengerId: '',
    hcyj_remake: '',
    img_list: [{
        id: 1,
        ShowPicUrl: '/wxImg/b1.jpg'
      },
      {
        id: 1,
        ShowPicUrl: '/wxImg/b2.jpg'
      },
      {
        id: 1,
        ShowPicUrl: '/wxImg/b3.jpg'
      },
      {
        id: 1,
        ShowPicUrl: '/wxImg/b4.jpg'
      }
    ],
    deposit: '',
    hotLintList: [],
    type:'',
    hcyjPrice:''
  },
  onLoad: async function (opt) {
    let _this = this;
    console.log(opt)
    if (opt.type == 'hcyj') {
      _this.setData({
        activeTab: 1,
        activeTab2: 2,
      })
    }
    this.setData({
      baseUrl,
      type:opt.type
    })

    // await _this.getLunBo();
  },
  onShow() {
    console.log('onShow')
    var _this = this;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 补0
    const day = String(now.getDate()).padStart(2, '0'); // 补0
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formatToday = `${year}-${month}-${day}`;
    const times = `${hours}:${minutes}:${seconds}`;
    _this.setData({
      arrivalTime: formatToday + " " + times,
      lvyou_date: formatToday
    })
    //旅游包车 、协议客户传 1 ，旅游租车传 2
    if (_this.data.activeTab == 0) {
      _this.getTimeList(1)
      _this.getlvyouCar()
    } else if (_this.data.activeTab == 1) {
      _this.getTimeList(2)
    } else if (_this.data.activeTab == 2) {
      _this.getTimeList(1)
    }
    this.getTime
    let starInfo = wx.getStorageSync("starInfo2");
    let endInfo = wx.getStorageSync("endInfo2");
    if (starInfo) {
      _this.setData({
        starting_point: starInfo.startName,
        hcyj_qidian: starInfo.startName,
        starInfo
      })
      this.getlvyouCar()
    }
    if (endInfo) {
      _this.setData({
        endting_point: endInfo.endName,
        hcyj_zhongdian: endInfo.endName,
        endInfo
      })
      this.getlvyouCar()
    }
    console.log(starInfo)
    console.log(endInfo)
    console.log(_this.data.type)
    if(starInfo && endInfo && _this.data.type == 'hcyj') {
      _this.setHcyjMoney()
    }
    // _this.getDaijia()
    _this.getHotLine()
  },
  //获取热门线路
  getHotLine() {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetHotTravelLines",
      data: {},
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          console.log(res.data)
          _this.setData({
            hotLintList: res.data.data
          })
        }
      },
    });
  },
  //点击热门线路
  handleHotLine(e) {
    console.log(e.currentTarget.dataset.item)
    let data = e.currentTarget.dataset.item
    let item = JSON.stringify(data)
    wx.navigateTo({
      url: '/driving_status/pages/hotLine/hotLine?data=' + item
    })
    // let _this = this;
    // let data = e.currentTarget.dataset.item;
    // _this.setData({
    //   starting_point:data.Start,
    //   endting_point:data.End
    // })
  },
  //获取时间列表
  getTimeList(SwitchType) {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetTravelTimeListForDate",
      data: {
        SwitchType
      },
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          _this.setData({
            timeArr: res.data.data
          })
        }
      },
    });
  },
  //获取车型
  getlvyouCar() {
    let _this = this;
    if (_this.data.arrivalTime == '') {
      return
    }
    let openid = wx.getStorageSync('openid');
    let start_city = wx.getStorageSync('start_city')
    let line_Id = '';
    if (start_city) {
      if (start_city == "太原市") {
        line_Id = "300213-96f23d82cea647168541241650c39790"
      } else if (start_city == "孝义市") {
        line_Id = "300213-7bc4de5562764200a0610b630859d384"
      }
    }
    wx.request({
      url: baseUrl + "/api/DispatchMobile/GetTravelPriceListForLineId",
      data: {
        Id: line_Id,
        StartLat: _this.data.starInfo.startLait,
        StartLng: _this.data.starInfo.startLont,
        EndLat: _this.data.endInfo.endLait,
        EndLng: _this.data.endInfo.endLont,
        MemberId: openid,
        AdultNumber: "1",
        ArrivalTime: _this.data.arrivalTime,
        IsRoundTrip: _this.data.roundTrip
      },
      method: "POST",
      success: (res) => {
        // wx.removeStorageSync('start_city')
        if (res.data.code == 0) {
          _this.setData({
            carList: res.data.data,
            selectedCarId: res.data.data[0].Id
          })
        }
      },
    });
  },
  //选择起点
  startingPoint() {
    wx.navigateTo({
      url: "/pages/starting2/starting2?direction=starting&type=ly"
    });
  },
  //选择终点
  endting_point() {
    wx.navigateTo({
      url: "/pages/starting2/starting2?direction=ending&type=ly"
    });
  },
  //旅游包车电话
  searchInputend(e) {
    let phone = e.detail.value.replace(/\D/g, '').slice(0, 11); // 只留数字，最多11位
    const valid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({
      lvyouTel: phone,
      lvyouTel_phoneError: valid ? '' : '*请输入正确手机号'
    });
  },
  hcyz_tel(e) {
    let phone = e.detail.value.replace(/\D/g, '').slice(0, 11); // 只留数字，最多11位
    const valid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({
      hcyzTel: phone,
      hcyzTel_phoneError: valid ? '' : '*请输入正确手机号'
    });
  },
  //旅游包车日期
  lvyou_bindDateChange(e) {
    let _this = this;
    let checkTime = ''
    let dateStr = _this.data.timeArr[e.detail.value].RunTime
    // 1. 把传入的日期字符串去掉横杠，变成 "20260525"
    const formatInputDate = dateStr.replace(/-/g, '');

    // 2. 获取今天的日期，也格式化成 "20260525"
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 补0
    const day = String(now.getDate()).padStart(2, '0'); // 补0
    // 获取时、分、秒，并转为字符串补零（例如 9 变成 "09"）
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // 拼接成最终格式
    const timeStr = `${hours}:${minutes}:${seconds}`;
    const formatToday = `${year}${month}${day}`;
    // 3. 进行对比
    if (formatInputDate === formatToday) {
      checkTime = dateStr + ' ' + timeStr
    } else {
      checkTime = dateStr + ' ' + '04:59:59'
    }
    this.setData({
      lvyou_date: _this.data.timeArr[e.detail.value].RunTime,
      arrivalTime: checkTime
    })
    this.getlvyouCar()
  },
  //环城易租 租用日期
  yizu_zuche(e) {
    let _this = this;
    let dateStr = _this.data.timeArr[e.detail.value].RunTime;
    let checkTime = dateStr + ' 00:00:00'
    this.setData({
      yizu_zucheDay: _this.data.timeArr[e.detail.value].RunTime,
      yizu_zucheTime: checkTime
    })
    _this.getRentCar()
  },
  yizu_huanche(e) {
    let _this = this;
    let dateStr = _this.data.timeArr[e.detail.value].RunTime;
    let checkTime = dateStr + ' 00:00:00'
    this.setData({
      yizu_huancheDay: _this.data.timeArr[e.detail.value].RunTime,
      yizu_huancheTime: checkTime
    })
  },

  // 切换顶部 Tab
  switchTab(e) {
    var _this = this;
    const index = e.currentTarget.dataset.index;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 补0
    const day = String(now.getDate()).padStart(2, '0'); // 补0
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formatToday = `${year}-${month}-${day}`;
    const times = `${hours}:${minutes}:${seconds}`;
    if (index == 2) {
      wx.showModal({
        title: '提示',
        content: '请拨打电话咨询',
        success(res) {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: '13133387813' // 你要拨打的电话号码
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else if (index == 0) {
      this.setData({
        activeTab: index,
        starting_point: '',
        endting_point: '',
        lvyouTel: '',
        lvyou_date: '请选择日期',
        carList: [],
        arrivalTime: '',
        selectedCarId: '',
        roundTrip: true,
      });
      _this.setData({
        arrivalTime: formatToday + " " + times,
        lvyou_date: formatToday
      })
      _this.getlvyouCar()
    } else if (index == 1) {
      this.setData({
        activeTab: index,
        starting_point: '',
        endting_point: '',
        lvyouTel: '',
        lvyou_date: '请选择日期',
        carList: [],
        arrivalTime: '',
        selectedCarId: '',
        roundTrip: true,
      });
      _this.setData({
        yizu_zucheDay: formatToday,
        yizu_zucheTime: formatToday + " " + times
      })
      _this.getRentCar()
    }

  },
  // 切换顶部 Tab
  switchTab2(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab2: index,

    });
    wx.removeStorageSync('start_city')
    wx.removeStorageSync('starInfo2')
    wx.removeStorageSync('endInfo2')
  },
  // 选择车型
  selectCar(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedCarId: id
    });
  },

  // 选择单程/往返
  radioChange(e) {
    let _this = this;
    const val = e.detail.value;
    let types = _this.data.tripTypes;
    types.forEach(item => {
      item.checked = (item.value === val);
    });
    if (val == 'one_way') {
      _this.setData({
        roundTrip: false
      });
    } else if (val == 'round_trip') {
      _this.setData({
        roundTrip: true
      });
    }
    _this.setData({
      tripTypes: types
    });
    this.getlvyouCar()
  },

  // 模拟日期选择
  showDatePicker() {
    wx.showToast({
      title: '打开日期选择器',
      icon: 'none'
    });
  },
  submit: throttle(function () {
    let _this = this;
    if (_this.data.starInfo == '') {
      wx.showToast({
        title: '请选择起点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.endInfo == '') {
      wx.showToast({
        title: '请选择终点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.arrivalTime == '') {
      wx.showToast({
        title: '请选择出发日期',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.lvyouTel == '') {
      wx.showToast({
        title: '请输入电话',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.selectedCarId == '') {
      wx.showToast({
        title: '请选择车型',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let start_city = wx.getStorageSync('start_city')
    let line_Id = '';
    if (start_city == "太原市") {
      line_Id = "300213-96f23d82cea647168541241650c39790"
    } else if (start_city == "孝义市") {
      line_Id = "300213-7bc4de5562764200a0610b630859d384"
    }
    var userInfo = wx.getStorageSync('userInfo');
    wx.request({
      url: baseUrl + "/api/DriverApp/CreateTravelTicketOrder",
      data: {
        PassengerLineId: line_Id,
        IntoLocation: _this.data.starInfo.startAddress,
        IntoLongitude: _this.data.starInfo.startLont,
        IntoLatitude: _this.data.starInfo.startLait,
        OffLocation: _this.data.endInfo.endAddress,
        OffLongitude: _this.data.endInfo.endLont,
        OffLatitude: _this.data.endInfo.endLait,
        Departure: "100004-0000980002",
        ArrivalTime: _this.data.arrivalTime,
        Personal: userInfo.Id,
        DispatchListId: "",
        IsReservation: "100004-0000010002",
        CouponDetailsId: "",
        PersonalIds: _this.data.lvyouTel,
        Note: '',
        IsExclusive: "100004-0000010001",
        IsPickGoods: '100004-0000010002',
        SelectCarType: _this.data.selectedCarId,
        OrderSource: "小程序",
        priceType: '100004-0001270004',
        AdultNumber: 1, //成人数
        ChildNum: 0, //儿童数
        TravelType: 1,
        IsRoundTrip: _this.data.roundTrip
      },
      method: "POST",
      success: (res) => {
        console.log(res)
        if (res.data.code == 0) {
          http.getRequest('/api/DispatchMobile/GoHotTravelLineReservedPay?LayerOrder=1&Id=' + res.data.data.TravelReserved + '&MemberInfoId=' + userInfo.Id, "", wx.getStorageSync('header'), (LayerOrderRes) => {
            console.log('请求成功', LayerOrderRes)
            if (LayerOrderRes.code == 0) {
              console.log('获取支付所需信息成功')
              var data = JSON.parse(LayerOrderRes.data);
              console.log('拉起支+付', data)
              // wx.hideLoading();
              wx.requestPayment({
                timeStamp: data.timeStamp,
                nonceStr: data.nonceStr,
                package: data.package,
                signType: 'MD5',
                paySign: data.paySign,
                success(paymentRes) {
                  console.log('支付成功', paymentRes)
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000,
                    success: function () {
                      console.log('支付成功')
                      wx.removeStorageSync('start_city')
                      wx.removeStorageSync('start_city')
                      wx.removeStorageSync('starInfo2')
                      wx.removeStorageSync('endInfo2')
                      // _this.setSubscribeMessage();
                      setTimeout(function () {
                        wx.reLaunch({
                          url: '/user_center/pages/payDetail/payDetail?orderId=' + res.data.data.Id + "&from=orderList"
                        })
                      }, 1000)
                    }
                  })
                }
              })
            } else if (LayerOrderRes.code == 400 && LayerOrderRes.msg == "已付款") {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000,
                success: function () {
                  console.log('支付成功2')
                  wx.removeStorageSync('start_city')
                  wx.removeStorageSync('start_city')
                  wx.removeStorageSync('starInfo2')
                  wx.removeStorageSync('endInfo2')
                  // _this.setSubscribeMessage();
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                    })
                  }, 1000)
                }
              })
            } else {
              console.log('获取支付所需信息失败')
              wx.showToast({
                title: LayerOrderRes.msg,
                icon: 'success',
                duration: 2000,
              })
            }
          }, (LayerOrderRrr) => {
            console.log('请求失败', LayerOrderRrr)
          })
        }








      },
    });
  }, 5000),
  //获取租车车型列表
  getRentCar() {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetRentCarTypeList",
      data: {
        today: _this.data.yizu_zucheDay + " 00:00:00"
      },
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          let targetSeat = res.data.data.find(item => item.CarSeatState === true);
          _this.setData({
            rentCarList: res.data.data,
            hcyz_carId: targetSeat.Id,
            deposit: targetSeat.Deposit,
          })
        }
      },
    });
  },
  handleRemark(e) {
    this.setData({
      hcyz_remake: e.detail.value
    })
  },
  handlehcyjRemark(e) {
    this.setData({
      hcyj_remake: e.detail.value
    })
  },
  hcyz_car(e) {
    if (e.currentTarget.dataset.state) {
      this.setData({
        hcyz_carId: e.currentTarget.dataset.id,
        deposit: e.currentTarget.dataset.deposit
      })
    }

  },
  //环城易租  立即预订
  hcyz_submit: throttle(function () {
    let _this = this;
    if (_this.data.yizu_zucheDay == '') {
      wx.showToast({
        title: '请选择租用日期',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.yizu_huancheDay == '') {
      wx.showToast({
        title: '请选择还车日期',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.hcyzTel == '') {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none',
        duration: 2000
      })
      return
    }
    var userInfo = wx.getStorageSync('userInfo');
    wx.request({
      url: baseUrl + "/api/DriverApp/CreateRentCarOrder",
      data: {
        MemberId: userInfo.Id,
        CarType: _this.data.hcyz_carId,
        StartTime: _this.data.yizu_zucheDay + " 00:00:00",
        EndTime: _this.data.yizu_huancheDay + " 00:00:00",
        Phone: _this.data.hcyzTel,
        OrderType: _this.data.activeTab2 == 0 ? 1 : 2,
        Note: _this.data.hcyz_remake
      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '预订成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 2000);
        }
      },
    });
  }, 5000),
  getDaijia() {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/DriverApp/GetDriverCarLine",
      data: {},
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          _this.setData({
            daijia_list: res.data.data
          })
        }
      },
    });
  },
  hcyj_tel(e) {
    let phone = e.detail.value.replace(/\D/g, '').slice(0, 11); // 只留数字，最多11位
    const valid = /^1[3-9]\d{9}$/.test(phone);
    this.setData({
      hcyjTel: phone,
      hcyjTel_phoneError: valid ? '' : '*请输入正确手机号'
    });

  },
  hxyj_getqi() {
    wx.navigateTo({
      url: "/pages/starting2/starting2?direction=starting&type=hcyj"
    });
  },
  hxyj_getzhong() {
    wx.navigateTo({
      url: "/pages/starting2/starting2?direction=ending&type=hcyj"
    });
  },
  setSubscribeMessage: function () {
    console.log('调用通知')
    wx.showModal({
      title: '提示',
      content: '即将为您开启消息提醒',
      complete: (res) => {
        if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA', "LhKVmpSKt-FGzwYVDHB6UQpVrdZmMklLzcFJ6Ln_oJU"],
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
        }

      }
    })

  },
  hcyj_direction(e) {
    let _this = this;
    _this.setData({
      daijia_direction: _this.data.daijia_list[e.detail.value].LineName,
      PassengerId: _this.data.daijia_list[e.detail.value].Id,
    })

  },
  handle_hcyj: throttle(function () {
    console.log('进来没')
    let _this = this;
    if (_this.data.hcyj_qidian == '') {
      wx.showToast({
        title: '请选择起点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.hcyj_zhongdian == '') {
      wx.showToast({
        title: '请选择终点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (_this.data.hcyjTel == '') {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none',
        duration: 2000
      })
      return
    }
    // if (_this.data.daijia_list == '') {
    //   wx.showToast({
    //     title: '请选择方向',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // }
    var userInfo = wx.getStorageSync('userInfo');
    var starInfo = wx.getStorageSync('starInfo2');
    let endInfo = wx.getStorageSync("endInfo2");
    wx.request({
      url: baseUrl + "/api/DriverApp/CreateDriverCarOrder",
      data: {
        MemberId: userInfo.Id,
        StartingPosition: starInfo.startAddress,
        IntoLongitude: starInfo.startLont,
        IntoLatitude: starInfo.startLait,
        OffLocation: endInfo.endAddress,
        OffLongitude:  endInfo.endLont,
        OffLatitude: endInfo.endLait,
        Phone: _this.data.hcyjTel,
        OrderType: 3,
        Note: _this.data.hcyj_remake
      },
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          wx.showToast({
            title: '预订成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }, 2000);
        }
      },
    });
  }, 5000),
  setHcyjMoney() {
    let _this = this;
    let userInfo = wx.getStorageSync('userInfo')
    let starInfo = wx.getStorageSync("starInfo2");
    let endInfo = wx.getStorageSync("endInfo2");
    wx.request({
      url: baseUrl + '/api/DriverApp/GetDriverCarPrice',
      data:  {
        MemberId: userInfo.Id,
        StartingPosition:starInfo.startAddress,
        IntoLongitude: starInfo.startLont,
        IntoLatitude: starInfo.startLait,
        OffLocation: endInfo.endAddress,
        OffLongitude: endInfo.endLont,
        OffLatitude: endInfo.endLait
    },
      method: "POST",
      success: (res) => {
        console.log(res)
        if(res.data.code == 0) {
          console.log(res.data)
          _this.setData({
            hcyjPrice:res.data.data
          })
        }
      }
    })
  },
  onUnload() {

  }
})