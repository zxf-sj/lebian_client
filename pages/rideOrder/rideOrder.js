// pages/rideOrder/rideOrder.js  拼车/包车 共用的下单页
// mode=carpool 拼车下单；mode=charter 包车下单
// 优惠券弹框、用户须知、下单支付逻辑参考旧版 pages/pingche2
const BASE_URL = require("../../utils/BASE_URL");
const throttle = require('../../utils/throttle.js').throttle;
const debounce = require('../../utils/debounce.js');
const http = require('../../utils/http.js');
const unionPayWatcher = require('../../utils/unionPayWatcher.js');
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({
  data: {
    baseUrl,
    mode: 'carpool',
    from: '',
    to: '',
    dates: [], // 固定四天：今天/明天/后天/第4天
    dateIdx: 0,
    // 时间段：由接口 GetCharterTimeListForDate 返回
    time: '',
    charterTimes: [], // [{ label, start, end }]
    timeIdx: -1,
    dateSheetOpen: false, // 日期底部弹框
    timeSheetOpen: false, // 时间段底部弹框,
    // 车型列表由 getCarType 拉取，默认选中第 1 个
    vehicles: [],
    vehSel: 0,
    TotalFare: '', //订单总额，getPriceListForLineId 计算
    carTypeId: '', //选中车型Id
    Price: '', //基本票价
    ChildPrice: '', //儿童优惠票价
    // ===== 次卡 / 优惠券（参考 pingche2） =====
    couponCount: 0, //可用张数
    coupon_num: 0, //已用优惠券张数
    membershipCard_num: 0, //已用次卡张数
    showCoupon: false, //优惠券弹框
    slideCouponParams: {}, //优惠券组件入参
    rangfenceMapList:[],//超范围列表
    hasChooseId: '', //已选次卡/优惠券 Id（逗号分隔）
    couponText: '暂无可用', //优惠券一行右侧文案
    // ===== 用户须知（参考 pingche2） =====
    isshow: false, //用户须知弹框
    agree: false,
    // ===== 乘车人 =====
    passengers: [{
      adults: 1,
      children: 0
    }, ],
    paxIdx: 0,
    actualAdultCount: 1, //按成人票价结算的人数
    phone: '',
    remark: '',
    // ===== 底部支付方式弹框 =====
    paySheetShow: false,
    payType: 'union', //union=云闪付（默认） wechat=微信
    payPromoDetailShow: false,
    payPromoRules: [
      '满5元立减1元',
      '满10元立减2元',
      '满50元立减10元',
      '满100元立减20元'
    ],
    payTypeList: [{
        img: '/assets/images/yunshanfu.png',
        key: 'union',
        name: '云闪付支付',
        tip: '选择云闪付支付随机立减',
        tag: ''
      },
      {
        img: '/assets/images/wechat.png',
        key: 'wechat',
        name: '微信支付',
        tip: '',
        tag: ''
      }
    ],
    startingAddress: '',
    endingAddress: '',
  },


  onShow() {
    unionPayWatcher.start(); // 兜底：冷启动后仍有待确认的云闪付订单时恢复监听
    let _this = this;
    let starInfo2 = wx.getStorageSync("starInfo2");
    let endInfo2 = wx.getStorageSync("endInfo2");
    if (starInfo2) {
      _this.setData({
        startingAddress: _this.trimDupCity(starInfo2.startAddress, _this.data.from)
      })
    }
    if (endInfo2) {
      _this.setData({
        endingAddress: _this.trimDupCity(endInfo2.endAddress, _this.data.to)
      })
    }
  },

  // 去掉地址里与左侧已展示城市重复的省/市前缀：
  // 「山西省吕梁市孝义市学府街」+ 已显示「孝义市」 → 「学府街」
  // 1) 先剥「山西省/吕梁市」这类行政区划前缀（不依赖城市词能否匹配）
  // 2) 再用本页城市（孝义/太原）剥一层重名
  // 缓存里的原始地址不动，只裁本页回显
  trimDupCity(addr, city) {
    if (!addr) return '';
    let s = String(addr).trim();
    s = s.replace(/^[一-龥]{1,10}?(?:省|自治区)(?:[一-龥]{1,10}?(?:市|地区|自治州|盟))*/, '')
      .replace(/^[\s,，、]+/, '');
    const key = String(city || '').trim().replace(/市$/, '');
    if (key) {
      let cut = -1;
      if (s.indexOf(key) === 0) cut = key.length;
      else {
        const i = s.indexOf(key);
        if (i > 0) cut = i + key.length;
      }
      if (cut >= 0) {
        if (s.charAt(cut) === '市') cut += 1;
        s = s.slice(cut).replace(/^[\s,，、]+/, '');
      }
    }
    return s.trim();
  },

  onPickAddr(e) {
    const direction = e.currentTarget.dataset.direction;
    const city = e.currentTarget.dataset.city;
    wx.navigateTo({
      url: `/pages/starting2/starting2?direction=${direction}&type=pc&city=${city}`,
    });
  },
  onLoad(query) {
    let _this = this;
    const mode = query.mode === 'charter' ? 'charter' : 'carpool';

    // 固定四天（今天/明天/后天/第4天），与 ride 页一致
    const dates = this.buildDates(new Date());
    // 列表页带入的日期落在哪天选哪天，默认第 1 天
    let idx = 0;
    if (query.date) {
      const hit = dates.findIndex(d => d.full === query.date);
      if (hit >= 0) idx = hit;
    }

    this.setData({
      mode,
      from: query.from ? decodeURIComponent(query.from) : this.data.from,
      to: query.to ? decodeURIComponent(query.to) : this.data.to,
      dates,
      dateIdx: idx,
      time: query.time || '',
    });
    // 下单、优惠券组件都依赖这两个缓存，先按当前日期写好
    this.syncDateCache(dates[idx]);
    this.getNews(); //获取用户须知
    // 未选址时先回显上次订单地址（可能更新线路 Id），再走「时间段→车型→优惠券」链路
    _this.getLastOrderAddress(function () {
      _this.fetchCharterTimes(idx, function () {
        _this.getCarType();
      });
    });
  },
  // ===== 缓存同步：slideCoupon 组件与下单接口都从这两个缓存取值 =====
  // storageSync.startDate：下单/历史订单校验用；pcTimeSync.propsDay：优惠券张数查询用
  syncDateCache(d) {
    if (!d) return;
    let storageSync = wx.getStorageSync('storageSync') || {};
    wx.setStorageSync('storageSync', {
      ...storageSync,
      startDate: d.full
    });
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    wx.setStorageSync('pcTimeSync', {
      ...pcTimeSync,
      propsDay: d.md
    });
  },
  // ===== 上次订单地址回显（参考 information 组件 attached 的 pc 分支） =====
  // 本页没走"选址→确认"流程时（如直接 navigateTo 进来），starInfo2/endInfo2 为空，
  // 用该接口取用户上次拼车的上下车点、线路 Id、乘车人手机号
  getLastOrderAddress(cb) {
    let _this = this;
    // 与 information 组件一致：只有起终点都未选（缓存都不存在）才回显，
    // 避免覆盖用户本次手动选择的地址
    const starInfo2 = wx.getStorageSync('starInfo2');
    const endInfo2 = wx.getStorageSync('endInfo2');
    if (starInfo2 || endInfo2) {
      cb && cb();
      return;
    }
    const userinfo = wx.getStorageSync('userInfo');
    if (!userinfo) {
      cb && cb();
      return;
    }
    const lineId = wx.getStorageSync('lineId') || '';
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLastOrderAddress',
      data: {
        LineId: lineId,
        MemberId: userinfo.Id,
        TypeId: _this.data.mode === 'charter' ? 2 : 1 // 1=拼车 2=包车 3=闪送
      },
      method: "POST",
      success: (res) => {
        if (res.data.code != 0) {
          cb && cb();
          return;
        }
        const data = res.data.data;
        if (!data) {
          cb && cb();
          return;
        }
        // 地址文案无条件回显：onShow 早已跑完，只写缓存页面不会刷新
        _this.setData({
          startingAddress: _this.trimDupCity(data.IntoLocation, _this.data.from),
          endingAddress: _this.trimDupCity(data.OffLocation, _this.data.to),
        });
        // 与 information 组件一致：坐标有效（非 0）才写入选址缓存，供价格/下单接口取经纬度
        if (data.IntoLatitude != 0) {
          wx.setStorageSync('starInfo2', {
            startAddress: data.IntoLocation,
            startLait: data.IntoLatitude,
            startLont: data.IntoLongitude,
            startName: data.IntoLocation,
            startCity: _this.data.from
          });
          wx.setStorageSync('endInfo2', {
            endAddress: data.OffLocation,
            endLait: data.OffLatitude,
            endLont: data.OffLongitude,
            endName: data.OffLocation,
            endCity: _this.data.to
          });
          // 回显线路 Id：车型/价格/优惠券接口都依赖
          const lastLineId = (data.LinePriceList && data.LinePriceList[0]) ? data.LinePriceList[0].PassengerLineId : '';
          if (lastLineId) {
            let storageSync = wx.getStorageSync('storageSync') || {};
            wx.setStorageSync('storageSync', {
              ...storageSync,
              lineId: lastLineId
            });
            wx.setStorageSync('lineId', lastLineId);
          }
          // 回显手机号
          const phone = (data.PassengerList && data.PassengerList[0]) ? data.PassengerList[0].Phone : '';
          if (phone) {
            _this.setData({
              phone: phone
            });
          }
        }
        cb && cb();
      },
      fail(err) {
        console.error('网络异常:', err);
        cb && cb();
      }
    })
  },

  //拉取车型列表
  getCarType() {
    let _this = this;
    if (!_this.data.time) {
      wx.showToast({
        title: '请先选择出发时间段',
        icon: 'none'
      })
      return;
    }
    let time = _this.data.dates[_this.data.dateIdx].full + ' ' + _this.data.time.split('~')[0].split(':')[0] + ':59:00'
    let storageSync = wx.getStorageSync('storageSync') || {}
    let data = {
      IsExclusive: '100004-0000010002',
      ShiftId: storageSync.lineId,
      ArrivalTime: time,
    };
    wx.request({
      url: baseUrl + '/api/BusMobile/GetCarpoolCarModel',
      data: data,
      method: "POST",
      success: (res) => {
        let list = res.data.data;
        if (res.data.code == 0 && list && list.length) {
          // 默认选中第 1 个可选车型，拿到 Id 后再拉优惠券
          let selIdx = list.findIndex(item => item.CarSeatState);
          if (selIdx < 0) selIdx = 0;
          _this.setData({
            vehicles: list,
            vehSel: selIdx,
            TotalFare: list[selIdx].TotalFare,
            Price: list[selIdx].Price,
            carTypeId: list[selIdx].Id
          })
          // 优惠券组件按 pcTypeId 查该车型的次卡，需同步缓存
          wx.setStorageSync('pcTypeId', list[selIdx].Id)
          _this.getCouponList();
          // 车型接口带回的 TotalFare/Price 只是默认值，实际价格由价格接口按人数+券计算
          _this.total_Price();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
      },
      fail(err) {
        console.error('网络异常:', err)
      }
    })
  },
  //拉取优惠券
  getCouponList() {
    let _this = this;
    let timeList = _this.data.dates[_this.data.dateIdx].md.split('/')
    let time = timeList[0] + '-' + timeList[1]
    let userinfo = wx.getStorageSync('userInfo')
    if (!userinfo) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return;
    }
    let lineId = wx.getStorageSync('lineId')
    let data = {
      MemberId: userinfo.Id,
      Money: 2,
      LinkId: lineId,
      SelectCarType: _this.data.carTypeId,
      ToDay: time
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/UseCanCoupon',
      data: data,
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          _this.setData({
            couponCount: (res.data.data || []).length
          })
        } else {
          _this.setData({
            couponCount: 0
          })
        }
        _this.updateCouponText();
      },
      fail(err) {
        console.error('网络异常:', err)
      }
    })
  },
  // 优惠券一行右侧文案：可用张数 = 总张数 - 已用张数
  updateCouponText() {
    const usable = this.data.couponCount - (this.data.coupon_num + this.data.membershipCard_num);
    this.setData({
      couponText: usable > 0 ? `可用${usable}张 >` : '暂无可用'
    });
  },

  // ===== 价格接口：按人数 + 已选券/次卡计算 TotalFare（参考 pingche2 total_Price） =====
  // 防抖合并连续的人数/车型/券操作，避免高频请求
  total_Price: debounce(function () {
    let _this = this;
    if (!_this.data.time || !_this.data.carTypeId) return;
    const pax = _this.data.passengers[_this.data.paxIdx] || {
      adults: 1,
      children: 0
    };
    let userinfo = wx.getStorageSync('userInfo') || {};
    let storageSync = wx.getStorageSync('storageSync') || {};
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    let starInfo2 = wx.getStorageSync('starInfo2') || {};
    let endInfo2 = wx.getStorageSync('endInfo2') || {};
    // 坐标优先取选址缓存，未选址时兜底用线路起终点坐标（storageSync 由 ride 页写入）
    let data = {
      IsExclusive: '100004-0000010002',
      Id: storageSync.lineId,
      MemberId: userinfo.Id,
      StartLat: starInfo2.startLait || storageSync.StatingLocation_Latitude,
      StartLng: starInfo2.startLont || storageSync.StatingLocation_Longitude,
      EndLat: endInfo2.endLait || storageSync.EndLocation_Latitude,
      EndLng: endInfo2.endLont || storageSync.EndLocation_Longitude,
      ArrivalTime: _this.data.dates[_this.data.dateIdx].full + ' ' + _this.data.time.split('~')[0].split(':')[0] + ':59:00',
      AdultNumber: pax.adults,
      ChildNum: pax.children,
      CouponDetailsId: pcTimeSync.hasChooseId || '',
    };
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/getPriceListForLineId',
      data: data,
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          // 返回的车型列表顺序不一定和 GetCarpoolCarModel 一致，按车型 Id 匹配
          const list = res.data.data || [];
          const item = list.find(v => v.Id === _this.data.carTypeId);
          if (item) {
            _this.setData({
              TotalFare: item.TotalFare,
              ChildPrice: item.ChildPrice,
              rangfenceMapList:item.rangfenceMapList
            });
          }
        }
      },
      fail(err) {
        console.error('价格接口异常:', err)
      }
    })
  }, 300),
  // 生成固定四天：今天/明天/后天 + 第4天显示周几（与 ride 页一致）
  buildDates(base) {
    const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const pad = n => String(n).padStart(2, '0');
    const arr = [];
    const fixed = ['今天', '明天', '后天'];
    for (let i = 0; i < 4; i++) {
      const d = new Date(base.getTime());
      d.setDate(base.getDate() + i);
      arr.push({
        label: fixed[i] || WEEK[d.getDay()],
        md: `${d.getMonth() + 1}/${d.getDate()}`,
        full: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      });
    }
    return arr;
  },

  /* ===== 日期 / 时间段 底部弹框（与 ride 页一致） ===== */
  onOpenDateSheet() {
    this.setData({
      dateSheetOpen: true,
      timeSheetOpen: false
    });
  },

  onOpenTimeSheet() {
    this.setData({
      timeSheetOpen: true,
      dateSheetOpen: false
    });
  },

  onCloseSheets() {
    this.setData({
      dateSheetOpen: false,
      timeSheetOpen: false
    });
  },

  noop() {},

  onDateSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const d = this.data.dates[idx];
    if (!d) return;
    this.setData({
      dateIdx: idx,
      dateSheetOpen: false,
    });
    this.syncDateCache(d);
    // 日期变了时间段列表也会变，拉完时间段再拉车型，车型拿到 Id 后再拉优惠券
    this.fetchCharterTimes(idx, () => {
      this.getCarType();
    });
  },

  onTimeSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const item = this.data.charterTimes[idx];
    if (!item) return;
    this.setData({
      timeIdx: idx,
      time: item.label,
      timeSheetOpen: false,
    });
    this.syncTimeCache();
    // 时间段变化会影响可选车型，重拉车型（成功回调里会带出优惠券）
    this.resetCarTypeData();
    this.getCarType();
  },

  // 获取包车可选时间段：返回 res.data[i].RunTimeShow（如 "08:00-09:00"）
  fetchCharterTimes(dateIdx, cb) {
    let _this = this;
    const d = this.data.dates[dateIdx];
    if (!d) return;
    let storageSync = wx.getStorageSync('storageSync') || {};
    wx.request({
      url: baseUrl + '/api/DispatchMobile/GetCharterTimeListForDate',
      data: {
        time: d.full,
        lineId: storageSync.lineId
      },
      method: "GET",
      success: (res) => {
        const list = res.data.code == 0 ? (res.data.data || []) : [];
        // 后端用 "08:00-09:00"，本页统一成 "08:00~09:00"
        const charterTimes = list.map(item => {
          const parts = String(item.RunTimeShow || '').split('-');
          return {
            label: parts[0] + '~' + parts[1],
            start: parts[0],
            end: parts[1]
          };
        });
        // 保持已选：原 time 还在列表里就继续选中，否则清空并重置依赖车型/优惠券的数据
        const cur = _this.data.time;
        const keepIdx = charterTimes.findIndex(t => t.label === cur);
        _this.setData({
          charterTimes,
          timeIdx: keepIdx,
          time: keepIdx >= 0 ? cur : '',
        });
        if (keepIdx < 0) {
          _this.resetCarTypeData();
        } else {
          _this.syncTimeCache();
          cb && cb();
        }
      },
      fail(err) {
        console.error('网络异常:', err)
      }
    })
  },

  // 时间段变化后，车型、金额、优惠券都失效，需重新拉取
  resetCarTypeData() {
    this.setData({
      vehicles: [],
      vehSel: 0,
      carTypeId: '',
      TotalFare: '',
      Price: '',
      ChildPrice: '',
      couponCount: 0,
    });
    this.clearCouponChoose();
    this.updateCouponText();
  },

  // 下单前的发车时间校验、优惠券组件都读 pcTimeSync.StartTime
  syncTimeCache() {
    if (!this.data.time) return;
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    wx.setStorageSync('pcTimeSync', {
      ...pcTimeSync,
      StartTime: this.data.time.split('~')[0]
    });
  },

  onVehTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const veh = this.data.vehicles[idx];
    if (!veh) return;
    if (veh.CarSeatState) {
      this.setData({
        vehSel: idx,
        Price: veh.Price,
        carTypeId: veh.Id,
      });
      // 优惠券组件读 pcTypeId，需同步；换车型后原选中的券/次卡作废
      wx.setStorageSync('pcTypeId', veh.Id);
      this.clearCouponChoose();
      // 换了车型，优惠券按新车型 Id 重拉；总额由价格接口按新车型重算
      this.getCouponList();
      this.total_Price();
    } else {
      wx.showToast({
        title: '此车型已停运',
        icon: "none"
      })
    }
  },

  /* ===== 次卡 / 优惠券 弹框（参考 pingche2） ===== */
  showCoupon() {
    if (!this.data.carTypeId) {
      wx.showToast({
        title: '请先选择车型',
        icon: 'none'
      })
      return;
    }
    this.setData({
      showCoupon: true
    })
  },
  // 弹框关闭
  couponStateHandle() {
    this.setData({
      showCoupon: false
    })
  },
  // 清掉已选券/次卡：换车型、换日期、换人数时调用
  clearCouponChoose() {
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    if (pcTimeSync.hasChooseId) {
      delete pcTimeSync.hasChooseId;
      wx.setStorageSync('pcTimeSync', pcTimeSync);
    }
    this.setData({
      hasChooseId: '',
      coupon_num: 0,
      membershipCard_num: 0,
    });
    this.updateCouponText();
  },
  // 弹框点确定后回传选中的券/次卡
  onExchangeItem(e) {
    let _this = this;
    const list = e.detail || [];
    let coupon_num = 0;
    let membershipCard_num = 0;
    list.forEach(item => {
      // CarType 有值的是次卡，空的是优惠券
      if (item.CarType) {
        membershipCard_num += 1;
      } else {
        coupon_num += 1;
      }
    })
    _this.setData({
      coupon_num,
      membershipCard_num,
      hasChooseId: list.map(item => item.Id).join(','),
      showCoupon: false,
    });
    // 选中结果写缓存：组件重开时回显，下单接口取 CouponDetailsId
    if (list.length > 0) {
      let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
      wx.setStorageSync('pcTimeSync', {
        ...pcTimeSync,
        hasChooseId: _this.data.hasChooseId
      });
    } else {
      this.clearCouponChoose();
    }
    _this.updateCouponText();
    // 券/次卡变化会改变抵扣金额，让价格接口重算 TotalFare
    _this.total_Price();
  },

  /* ===== 用户须知（参考 pingche2） ===== */
  getNews() {
    let that = this;
    http.postRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", "", wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        const WxParses = require('../../components/wxParse/wxParse.js');
        WxParses.setImageDomain(BASE_URL);
        WxParses.wxParse('content', 'html', res.data.Content, that, 5);
      }
    }, err => {
      console.log(err)
    })
  },
  // 点服务条款/复选框区域：展开用户须知弹框
  showView() {
    this.setData({
      isshow: true
    })
  },
  gotoxieyi() {
    this.setData({
      isshow: true
    })
  },
  // 用户须知__同意
  tongyi() {
    this.setData({
      agree: true,
      isshow: false
    })
  },
  // 用户须知__取消
  guanbi() {
    this.setData({
      isshow: false,
      agree: false
    })
  },

  // 成人/儿童数量仍作用于 passengers[paxIdx]（默认第 1 位）
  onAdultMinus() {
    const p = this.data.passengers[this.data.paxIdx];
    if (p.adults > 1) {
      this.setData({
        [`passengers[${this.data.paxIdx}].adults`]: p.adults - 1
      });
      this.onPaxChange();
    }
  },
  onAdultPlus() {
    const p = this.data.passengers[this.data.paxIdx];
    this.setData({
      [`passengers[${this.data.paxIdx}].adults`]: p.adults + 1
    });
    this.onPaxChange();
  },
  onChildMinus() {
    const p = this.data.passengers[this.data.paxIdx];
    if (p.children > 0) {
      this.setData({
        [`passengers[${this.data.paxIdx}].children`]: p.children - 1
      });
      this.onPaxChange();
    }
  },
  onChildPlus() {
    const p = this.data.passengers[this.data.paxIdx];
    this.setData({
      [`passengers[${this.data.paxIdx}].children`]: p.children + 1
    });
    this.onPaxChange();
  },
  // 人数变化后：可抵扣人数变了，已选券作废并重查张数
  onPaxChange() {
    const p = this.data.passengers[this.data.paxIdx];
    // 每位成人最多带一位儿童价，超出按成人票结算
    const realChild = Math.min(p.adults, p.children);
    this.setData({
      actualAdultCount: (p.adults + p.children) - realChild
    });
    this.clearCouponChoose();
    this.getCouponList();
    // 人数变化直接影响总价，交给价格接口重算
    this.total_Price();
  },

  // 返回 ride 列表页（本页被弹出销毁）时，清掉选址链路留下的缓存，
  // 避免下次进本页 onShow 读到上一次的旧地址
  onUnload() {
    ['starInfo2', 'endInfo2'].forEach(key => {
      wx.removeStorageSync(key);
    });
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  onAgreeTap() {
    this.setData({
      agree: !this.data.agree
    });
  },

  /* ===== 下单 / 支付（参考 pingche2） ===== */
  // 点「预约支付」：校验后弹出底部支付方式弹框
  onPay() {
    if (!this.data.agree) {
      wx.showToast({
        title: '请先同意服务条款',
        icon: 'none'
      });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      });
      return;
    }
    if (!this.data.carTypeId) {
      wx.showToast({
        title: '请选择车型',
        icon: 'none'
      });
      return;
    }
    this.setData({
      paySheetShow: true
    });
  },
  // 支付方式弹框：展开/收起支付立减优惠详情
  togglePayPromoDetail() {
    this.setData({
      payPromoDetailShow: !this.data.payPromoDetailShow
    })
  },
  // 支付方式弹框：切换支付方式
  onPayTypeChange(e) {
    this.setData({
      payType: e.currentTarget.dataset.key
    })
  },
  // 支付方式弹框：取消
  cancelPaySheet() {
    this.setData({
      paySheetShow: false
    })
  },
  // 支付方式弹框：确认支付并下单
  confirmPaySheet() {
    let _this = this;
    const payType = _this.data.payType;
    _this.setData({
      paySheetShow: false
    });
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    if (!pcTimeSync.StartTime) {
      wx.showToast({
        title: '请先选择出发时间段',
        icon: 'none'
      });
      return;
    }
    if (_this.isTimeInRange(formattedTime, pcTimeSync.StartTime)) {
      _this.handleCallCar(payType)
    } else {
      wx.showModal({
        title: '提示',
        content: '尊敬的乘客：距离发车时间较近，车辆调度资源紧张，为保证乘车体验，发车时间将最优安排至下单1个小时内的最快发车时段，请知悉。咨询热线：0351-6078977 感谢您的理解与耐心等候！',
        success(res) {
          if (res.confirm) {
            _this.handleCallCar(payType)
          }
        }
      })
    }
  },
  // 发车前 30 分钟内下单要提示用户
  isTimeInRange(currentTime, selectedTime) {
    const [curH, curM] = currentTime.split(':').map(Number);
    const [selH, selM] = selectedTime.split(':').map(Number);
    if (curH === selH && curM >= 30) {
      return false;
    }
    return true;
  },
  // 防重复提交
  handleCallCar: throttle(function (payType) {
    this._mainProcess(payType || this.data.payType);
  }, 3000),
  // 1. 主流程：校验 → 查历史订单 → 下单 → 支付
  async _mainProcess(payType) {
    try {
      const sessionData = this._getSessionData();
      if (!sessionData) return;
      sessionData.payType = payType || this.data.payType;

      const {
        storageSync,
        phone
      } = sessionData;

      // 同一手机号当天已有订单时先提示，确认后才继续
      const historyOrderInfo = await this._checkHistoryOrder(phone, storageSync.startDate);
      let shouldProceed = true;
      if (historyOrderInfo) {
        const modalRes = await new Promise(resolve => {
          wx.showModal({
            title: '下单记录',
            content: historyOrderInfo,
            cancelText: "取消下单",
            confirmText: "继续下单",
            success: resolve
          });
        });
        shouldProceed = modalRes.confirm;
      }
      if (!shouldProceed) {
        wx.navigateTo({
          url: '/pages/index/index'
        });
        return;
      }
      await this._processOrderAndPayment(sessionData);
    } catch (error) {
      console.error('下单流程异常:', error);
      wx.showToast({
        title: '系统繁忙，请稍后重试',
        icon: 'none'
      });
    }
  },
  // 2. 取值与校验
  _getSessionData() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login'
      });
      return null;
    }
    const user = wx.getStorageSync('userInfo');
    const startInfo = wx.getStorageSync('starInfo2') || {};
    const endInfo = wx.getStorageSync('endInfo2') || {};
    const storageSync = wx.getStorageSync('storageSync') || {};
    const pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    const lineId = wx.getStorageSync('lineId');

    const {
      phone,
      remark,
      carTypeId,
      mode,
      passengers,
      paxIdx
    } = this.data;
    const pax = passengers[paxIdx] || {
      adults: 1,
      children: 0
    };

    if (!startInfo.startLait || !endInfo.endLait) {
      wx.showToast({
        title: '请选择出发和到达位置',
        icon: 'none'
      });
      return null;
    }
    if (!storageSync.startDate || !pcTimeSync.StartTime) {
      wx.showToast({
        title: '请选择出行时间与时间段',
        icon: 'none'
      });
      return null;
    }
    if (!lineId || !carTypeId) {
      wx.showToast({
        title: '请选择线路和车型',
        icon: 'none'
      });
      return null;
    }
    return {
      user,
      startInfo,
      endInfo,
      storageSync,
      pcTimeSync,
      lineId,
      carTypeId,
      phone,
      remark,
      AdultNumber: pax.adults,
      ChildNum: pax.children,
      // 拼车/包车 Departure 字典值不同
      Departure: mode === 'charter' ? '100004-0000980002' : '100004-0000980001'
    };
  },
  // 3. 当天历史订单校验
  _checkHistoryOrder(phone, date) {
    return new Promise((resolve) => {
      http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + phone + '&timeDay=' + date, '', '', res => {
        if (res.code === 0 && res.count > 0) {
          let str = "";
          (res.data || []).forEach(item => {
            str += `${item.PassengerLineId_Name}, 订单号:${item.Code}\n`;
          });
          resolve(str);
        } else {
          resolve(false);
        }
      }, () => resolve(false));
    });
  },
  // 4. 下单 + 拉起支付
  async _processOrderAndPayment(data) {
    const {
      user,
      startInfo,
      endInfo,
      storageSync,
      pcTimeSync,
      lineId,
      carTypeId,
      phone,
      remark,
      AdultNumber,
      ChildNum,
      Departure
    } = data;

    const reqData = {
      PassengerLineId: lineId,
      IntoLocation: startInfo.startName,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endName,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      Departure,
      ArrivalTime: this._formatArrivalTime(storageSync.startDate, pcTimeSync.StartTime),
      Personal: user.Id,
      SeatNumber: 0,
      DispatchListId: "",
      IsReservation: "100004-0000010002",
      CouponDetailsId: pcTimeSync.hasChooseId || "",
      PersonalIds: phone,
      Note: remark,
      IsExclusive: "100004-0000010002",
      IsPickGoods: '100004-0000010002',
      SelectCarType: carTypeId,
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      AdultNumber,
      ChildNum,
    };

    const orderRes = await new Promise((resolve, reject) => {
      wx.request({
        url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
        data: reqData,
        method: "POST",
        success: resolve,
        fail: reject
      });
    });
    const orderData = orderRes.data;
    if (orderData.code !== 0) {
      wx.showToast({
        title: orderData.msg || '下单失败',
        icon: 'none'
      });
      return;
    }
    const orderId = orderData.data.Id;
    const payAmount = orderData.data.PayAmount;
    const payType = data.payType || this.data.payType;
    if (payAmount != 0) {
      if (payType === 'union') {
        await this._handleUnionPay(orderId, user.Id, payAmount);
      } else {
        await this._handlePayment(orderId, user.Id);
      }
    } else {
      // 0 元单：券/次卡全额抵扣
      this._handleOrderSuccess(orderId);
    }
  },
  // 5. 云闪付：跳外部小程序，回来后由 unionPayWatcher 查支付结果
  _handleUnionPay(orderId, memberInfoId, payAmount) {
    let appid = wx.getStorageSync('appId');
    return new Promise((resolve, reject) => {
      http.getRequest('/Api/DispatchMobile/GoUnionPay?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + memberInfoId + "&PaymentType=2", "", wx.getStorageSync('header'), (payRes) => {
        if (payRes.code === 0) {
          unionPayWatcher.mark(orderId, 'dispatch');
          wx.navigateToMiniProgram({
            appId: payRes.data.CqpMpAppId,
            path: payRes.data.CqpMpPath,
            fail(err) {
              console.log('打开云闪付失败', err);
              unionPayWatcher.clear();
              wx.showModal({
                title: '提示',
                content: '无法打开云闪付，可稍后在订单页继续支付。',
                confirmText: '查看订单',
                cancelText: '知道了',
                success(r) {
                  if (r.confirm) {
                    wx.reLaunch({
                      url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + '&from=orderList'
                    });
                  }
                }
              });
            }
          })
          resolve();
        } else if (payRes.code === 400 && payRes.msg === "已付款") {
          this._handleOrderSuccess(orderId);
          resolve();
        } else {
          wx.showToast({
            title: payRes.msg,
            icon: 'none'
          });
          reject(payRes);
        }
      }, reject);
    });
  },
  // 6. 微信支付
  _handlePayment(orderId, memberInfoId) {
    let appid = wx.getStorageSync('appId');
    return new Promise((resolve, reject) => {
      http.getRequest('/Api/DispatchMobile/GoUnionPay?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + memberInfoId + "&PaymentType=1", "", wx.getStorageSync('header'), (payRes) => {
        if (payRes.code === 0) {
          const payData = payRes.data;
          wx.requestPayment({
            timeStamp: payData.TimeStamp,
            nonceStr: payData.NonceStr,
            package: payData.Package,
            signType: payData.SignType,
            paySign: payData.PaySign,
            success: () => {
              this._handleOrderSuccess(orderId);
              resolve();
            },
            fail: (err) => {
              console.log('支付失败', err);
              this._clearStorageAndRedirect(orderId);
              resolve(); // 支付失败也结束流程，避免卡死
            }
          });
        } else if (payRes.code === 400 && payRes.msg === "已付款") {
          this._handleOrderSuccess(orderId);
          resolve();
        } else {
          wx.showToast({
            title: payRes.msg,
            icon: 'none'
          });
          reject(payRes);
        }
      }, reject);
    });
  },
  // 7. 下单成功统一处理
  _handleOrderSuccess(orderId) {
    wx.showModal({
      title: '预约成功',
      content: '订单已预约成功，司机将会在您出发前一小时联系你',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        this.setSubscribeMessage(); // 订阅消息
        wx.reLaunch({
          url: `/user_center/pages/payDetail/payDetail?orderId=${orderId}&from=orderList`
        });
      }
    });
  },
  // 8. 支付失败：清缓存并跳订单详情继续支付
  _clearStorageAndRedirect(orderId) {
    const keys = ['starInfo2', 'endInfo2', 'storageSync', 'pcTimeSync', 'personNum', 'pcTypeId', 'SeatNumber', 'textareaValue', 'lineId'];
    keys.forEach(key => wx.removeStorageSync(key));

    setTimeout(() => {
      wx.reLaunch({
        url: `/user_center/pages/payDetail/payDetail?orderId=${orderId}&from=orderList`
      });
    }, 1000);
  },
  // 9. 时间格式化：取时间段开始的小时 + ":59:00"
  _formatArrivalTime(date, time) {
    const hour = time.split(':')[0];
    return `${date} ${hour}:59:00`;
  },
  // 10. 订阅消息
  setSubscribeMessage() {
    wx.showModal({
      title: '提示',
      content: '即将为您开启消息提醒',
      complete: (res) => {
        if (res.confirm) {
          wx.requestSubscribeMessage({
            tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA', "LhKVmpSKt-FGzwYVDHB6UQpVrdZmMklLzcFJ6Ln_oJU"],
            success: (res) => {
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
                  success(r) {
                    if (r.confirm) {
                      wx.openSetting({});
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
    });
  },
});