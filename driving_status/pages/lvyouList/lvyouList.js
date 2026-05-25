import http from '../../../utils/http';
import util from "../../../utils/util";
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const throttle = require('../../../utils/throttle').throttle;
const app = getApp();
Page({
  data: {
    baseUrl: '',
    title: "乐遍家小程序已新版为新版本，系统还在优化升级中，会员使用过程中如有任何意见建议可在投诉建议提供您的宝贵留言~",
    marqueePace: 1, //滚动速度
    marqueeDistance: 0, //初始滚动距离
    size: 28,
    marqueeWidth: 660,
    marqueeMargin: 40, //留
    activeTab: 0,
    activeTab2: 0,
    starInfo:'',
    endInfo:'',
    starting_point: '',
    endting_point: '',
    tabs: ['旅游包车', '旅游租车', '协议客户'],
    tabs2: ['环城易租', '悦驾易租', '环城易驾'],
    // 模拟车型数据 (图片使用了占位图，实际开发请替换为真实URL)
    carList: [],
    timeArr: [],
    selectedCarId: '', // 默认选中第一个
    roundTrip: true, //单程、往返
    arrivalTime:'',//包车时间
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
    lvyou_date: '请选择日期'
  },
  onLoad: async function (opt) {
    console.log('onLoad', opt)
    this.setData({
      baseUrl
    })
    let _this = this;
    await _this.getLunBo();
  },
  onShow() {
    console.log('onShow')
    var _this = this;
    //旅游包车 、协议客户传 1 ，旅游租车传 2
    if (_this.data.activeTab == 1) {
      _this.getTimeList(2)
    } else {
      _this.getTimeList(1)
    }
    this.getTime
    let starInfo = wx.getStorageSync("starInfo2");
    let endInfo = wx.getStorageSync("endInfo2");
    if (starInfo) {
      console.log('starInfo', starInfo)
      _this.setData({
        starting_point: starInfo.startName,
        starInfo
      })
      this.getlvyouCar()
    }
    if (endInfo) {
      console.log('endInfo', endInfo)
      _this.setData({
        endting_point: endInfo.endName,
        endInfo
      })
      this.getlvyouCar()
    }
    // if (starInfo && endInfo) {
    //   console.log('去请求车型')
    //   this.getlvyouCar(starInfo, endInfo)
    // }
    var length = _this.data.title.length * _this.data.size; //计算文字的长度
    _this.setData({
      length: length,
      // 当文字长度小于屏幕长度时，需要增加补白
      marqueeMargin: length < _this.data.marqueeWidth ? (_this.data.marqueeWidth - length) / 4 : _this.data.marqueeMargin
    })
    if (_this.data.length > _this.data.marqueeWidth) {
      _this.run1();
    }

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
        console.log(res.data.data)
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
    console.log('进来了')
    let _this = this;
    if(_this.data.starInfo == '') {
      return
    }
    if(_this.data.endInfo == '') {
      return
    }
    if(_this.data.arrivalTime == '') {
      return
    }
    var openid = wx.getStorageSync('openid');
    let start_city = wx.getStorageSync('start_city')
    let line_Id = '';
    if (start_city == "太原市") {
      line_Id = "300213-96f23d82cea647168541241650c39790"
    } else if (start_city == "孝义市") {
      line_Id = "300213-7bc4de5562764200a0610b630859d384"
    }
    console.log('faqingqiu')
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
        console.log(res.data)
        // wx.removeStorageSync('start_city')
        if (res.data.code == 0) {
          _this.setData({
            carList: res.data.data,
            selectedCarId:res.data.data[0].Id
          })
          console.log(_this.data.carList)
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
      console.log('是今天！');
      checkTime = dateStr + ' ' + timeStr
    } else {
      console.log('不是今天。');
      checkTime = dateStr + ' ' + '04:59:59'
    }
    this.setData({
      lvyou_date: _this.data.timeArr[e.detail.value].RunTime,
      arrivalTime:checkTime
    })
    this.getlvyouCar()
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
  getLunBo() {
    http.getRequest("/Api/Mobile/getCompanyDetail?type=1&Id=300007-fa5b6d0d40594f02ad91425ef44141eb", '', '', res => {
      if (res.s) {
        if (res.data.configList) {
          this.setData({
            lunBoImg: res.data.configList,
            imgUrl: app.globalData.httpsUrl,
            autoplay: true,
            indicatorDots: false,
            interval: 3000,
            duration: 500
          })
        }
      }
    }, err => {
      console.log(err)
    })
  },
  // 切换顶部 Tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index
    });

  },
  // 切换顶部 Tab
  switchTab2(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab2: index
    });

  },
  // 选择车型
  selectCar(e) {
    console.log(e)
    const id = e.currentTarget.dataset.id;
    
    this.setData({
      selectedCarId: id
    });
  },

  // 选择单程/往返
  radioChange(e) {
    let _this = this;
    const val = e.detail.value;
    console.log(val)
    let types = _this.data.tripTypes;
    types.forEach(item => {
      item.checked = (item.value === val);
    });
    if (val == 'one_way') {
      _this.setData({
        roundTrip: true
      });
    } else if (val == 'round_trip') {
      _this.setData({
        roundTrip: false
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
  submit:throttle (function() {
    let _this = this;
    if(_this.data.starInfo == '') {
      wx.showToast({
        title: '请选择起点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(_this.data.endInfo == '') {
      wx.showToast({
        title: '请选择终点',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(_this.data.arrivalTime == '') {
      wx.showToast({
        title: '请选择出发日期',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(_this.data.lvyouTel == '') {
      wx.showToast({
        title: '请输入电话',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(_this.data.selectedCarId == '') {
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
    var openid = wx.getStorageSync('openid');
    wx.request({
      url: baseUrl + "/api/DriverApp/CreateTravelTicketOrder",
      data: {
      PassengerLineId:line_Id,
      IntoLocation:_this.data.starInfo.startAddress,
      IntoLongitude:_this.data.starInfo.startLont,
      IntoLatitude:_this.data.starInfo.startLait,
      OffLocation:_this.data.endInfo.endAddress,
      OffLongitude:_this.data.endInfo.endLont,
      OffLatitude:_this.data.endInfo.endLait,
      Departure:"100004-0000980002",
      ArrivalTime:_this.data.arrivalTime,
      Personal:openid,
      DispatchListId:"",
      IsReservation:"100004-0000010002",
      CouponDetailsId:"",
      PersonalIds:_this.data.lvyouTel,
      Note:'',
      IsExclusive:"100004-0000010001",
      IsPickGoods:'100004-0000010002',
      SelectCarType:_this.data.selectedCarId, 
      OrderSource:"小程序",
      priceType:'100004-0001270004',
      AdultNumber:1,//成人数
      ChildNum:0,//儿童数
      TravelType:1,
      IsRoundTrip:_this.data.roundTrip
      },
      method: "POST",
      success: (res) => {
        console.log(res.data)
        wx.removeStorageSync('start_city')
        if (res.data.code == 0) {
          wx.removeStorageSync('start_city')
          wx.removeStorageSync('starInfo2')
          wx.removeStorageSync('endInfo2')
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
  },5000),
  onUnload() {

  }
})