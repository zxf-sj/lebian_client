// pages/ride/ride.js  站点上车/拼车上门/包车出发/跨城跑腿
// 包车出发 tab 的接口与下单逻辑参考旧版 user_center/pages/baoche
const BASE_URL = require("../../utils/BASE_URL");
const throttle = require('../../utils/throttle.js').throttle;
const http = require('../../utils/http.js');
const unionPayWatcher = require('../../utils/unionPayWatcher.js');
var baseUrl = BASE_URL.BASE_URL //配置基础url
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
// 捎货货物照片分片上传（同旧版 shaohuo 页）
const fs = wx.getFileSystemManager();
const CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB 原始数据（Base64 后约 2MB）
const UPLOAD_API = baseUrl + '/Api/UploadMobile/ImageChunk';

// 服务类型 tab（价格为示例，实际由接口返回）
const TABS = [{
    name: '站点\n上车',
    price: '¥18起',
    id: 0
  },
  {
    name: '拼车\n上门',
    price: '¥49.9起',
    id: 1
  },
  {
    name: '包车\n出发',
    price: '¥240起',
    badge: '推荐',
    id: 2
  },
  {
    name: '跨城\n跑腿',
    price: '¥30起',
    id: 3
  },
];


function pad(n) {
  return String(n).padStart(2, '0');
}

Page({
  data: {
    from: '孝义',
    fromId: null,
    to: '太原',
    toId: null,
    today: null,
    dateIdx: 0,
    dates: [], // 固定四天：今天/明天/后天/周几
    dateLabel: '', // 顶部出发日期文案，如 10月12日

    tabs: TABS,
    tab: 0,

    timeSlotIdx: 2,
    hotStations: [],
    hotCount: 1,
    stationRoutes: [],

    /* --- 拼车上门 / 包车出发：右侧共用同一套班次列表 --- */
    periods: [],
    periodIdx: 0,
    carpoolAll: [{
        id: 'c1',
        period: 0,
        time: '08:00~09:00',
        seats: 4,
        sold: false
      },
      {
        id: 'c2',
        period: 1,
        time: '12:00~13:00',
        seats: 2,
        sold: false
      },
      {
        id: 'c3',
        period: 2,
        time: '14:00~15:00',
        seats: 135,
        sold: false
      },
      {
        id: 'c4',
        period: 2,
        time: '15:00~16:00',
        seats: 135,
        sold: false
      },
      {
        id: 'c5',
        period: 2,
        time: '16:00~17:00',
        seats: 135,
        sold: false
      },
      {
        id: 'c6',
        period: 2,
        time: '17:00~18:00',
        seats: 135,
        sold: false
      },
      {
        id: 'c7',
        period: 2,
        time: '18:00~19:00',
        seats: 0,
        sold: true
      },
      {
        id: 'c8',
        period: 3,
        time: '19:00~20:00',
        seats: 135,
        sold: false
      },
    ],
    carpool:[],
    carpoolShow: [],
    carpoolSel: '',

    /* --- 包车出发：右侧直接下单（接口逻辑参考 baoche 页） --- */
    baseUrl,
    addrFrom: '',
    addrTo: '',
    // 时间段：GetCharterTimeListForDate 返回
    tripTime: '',
    charterTimes: [], // [{ label, start, end }]
    timeIdx: -1,
    lineId: '',
    dateSheetOpen: false, // 日期底部弹框
    timeSheetOpen: false, // 时间段底部弹框
    timeLoading: false,
    carTypeList: [], //车型列表（getPriceListForLineId）
    carType: 0, //车型选中下标
    price: '', //总价 = Price + 摆渡价
    initialPrice: '', //基本票价
    version: 0, //摆渡价
    rangfenceMapList: [], //超范围费用列表
    phone: '',
    remark: '',
    agree: false,
    isshow: false, //用户须知弹框
    // ===== 底部支付方式弹框 =====
    paySheetShow: false,
    payType: 'union', //union=云闪付（默认） wechat=微信
    paySheetPhone: '',
    payFrom: 'charter', // 弹框确认后的下单来源：charter=包车出发 errand=城际捎货
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

    /* --- 跨城跑腿：城际捎货 / 城际跑腿 --- */
    errandSub: 0, // 0=城际捎货 1=城际跑腿
    // 捎货（规格/时效数据与下单链路同旧版 shaohuo 页）
    cargoSpeedList: [], // 捎货时效（remarkList：带 DeliveryTimeState）
    cargoSpeed: -1, // 选中时效下标
    cargoSpecList: [], // 货物类别（informationList）
    cargoType: -1, // 选中货物类别下标
    cargoName: '', // 货物名称 → GoodsSize
    cargoImgs: [], // 货物照片（上传后的服务器 URL，1~3 张）
    senderName: '', // 寄件称呼（选填）→ DeliverGoodsName
    senderPhone: '', // 寄件联系方式 → DeliverGoodsTel
    receiverName: '', // 收件称呼（选填）→ TakeOverGoodsName
    receiverPhone: '', // 收件联系方式 → TakeOverGoodsTel
    cargoRemark: '', // 寄件备注 → Note
    shVersion: 0, // 摆渡价（getPriceListForLineId）
    cargoLoading: false, // 规格/时效列表加载中
    // 跑腿
    runType: 0, // 选中服务类型下标
    runTypes: [{
        name: '代取外卖：到店取餐，负责城际运输送达，客户自己点餐',
        price: 30
      },
      {
        name: '带点外卖：代点餐品，负责城际运输送达不含外卖费用',
        price: 60
      },
    ],
    shopName: '',
    foodReq: '',
    runName: '',
    runPhone: '',
    runAddr: '',
    orderPhone: '',
    runRemark: '',
    // 费用与协议
    erBase: 30,
    erUrgent: 0,
    erTotal: 30,
    erAgree: false,
  },


  onShow() {
    unionPayWatcher.start(); // 兜底：冷启动后仍有待确认的云闪付订单时恢复监听
    // 从 starting2 选完地址返回时，回填上下车地址并重新询价
    const start = wx.getStorageSync('starInfo2');
    const end = wx.getStorageSync('endInfo2');
    const patch = {};
    if (start && start.startAddress) patch.addrFrom = start.startAddress;
    if (end && end.endAddress) patch.addrTo = end.endAddress;
    if (Object.keys(patch).length) {
      this.setData(patch, () => {
        if (this.data.tab === 2) this.getCarList();
        // 捎货的摆渡价依赖上下车坐标，选址后重新询价
        if (this.data.tab === 3 && this.data.errandSub === 0) this.shGetPrice();
      });
    }
  },

  onPickAddr(e) {
    const direction = e.currentTarget.dataset.direction;
    const city = direction === 'starting' ? this.data.from : this.data.to;
    // type=pc 才会 navigateBack 回本页并写入 starInfo2/endInfo2
    wx.navigateTo({
      url: `/pages/starting2/starting2?direction=${direction}&type=pc&city=${encodeURIComponent(city)}`,
    });
  },
  onLoad(query) {
    console.log('query', query)

    // 出发地/目的地/日期由首页 index 页查询带入
    const from = query.from ? decodeURIComponent(query.from) : this.data.from;
    const to = query.to ? decodeURIComponent(query.to) : this.data.to;

    // 可选四天固定以真实今天为基准（今天/明天/后天/第4天），不受传入日期影响
    const base = new Date();
    const dates = this.buildDates(base);

    // 传入日期落在哪天就选中哪天，默认第 1 天
    let idx = 0;
    if (query.date) {
      const hit = dates.findIndex(d => d.full === query.date);
      if (hit >= 0) idx = hit;
    }
    this.setData({
      from,
      to,
      fromId: query.fromId,
      toId: query.toId,
      dates,
      dateIdx: idx,
      today: query.date
    });
    this.syncDateCache(dates[idx]);
    this.applyDate(idx);
    this.filterCarpool();
    this.getNews(); //获取用户须知
    // 未选址时先回显上次订单地址（会更新线路 Id），再拉线路、时间段、车型
    this.getLastOrderAddress(() => {
      this.getLineId();
    });
  },
  // ===== 缓存同步：时间段接口、价格接口与下单都从这两个缓存取值 =====
  // storageSync.startDate：价格/下单/历史订单校验用；pcTimeSync.propsDay：优惠券查询用
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
  // 下单前的临近发车校验读 pcTimeSync.StartTime
  syncTimeCache() {
    if (!this.data.tripTime) return;
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    wx.setStorageSync('pcTimeSync', {
      ...pcTimeSync,
      StartTime: this.data.tripTime.split('~')[0]
    });
  },
  // ===== 上次订单地址回显（参考 information 组件 attached 的 pc/bc 分支） =====
  // 起终点都没选过时，用该接口取上次包车的上下车点、线路 Id、乘车人手机号
  getLastOrderAddress(cb) {
    let _this = this;
    const starInfo2 = wx.getStorageSync('starInfo2');
    const endInfo2 = wx.getStorageSync('endInfo2');
    // 本次已选过址（任一缓存存在）就不再回显，避免覆盖用户选择
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
        TypeId: 2 // 1=拼车 2=包车 3=闪送
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
        _this.setData({
          addrFrom: data.IntoLocation || '',
          addrTo: data.OffLocation || '',
        });
        // 坐标有效（非 0）才写选址缓存，供价格/下单接口取经纬度
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
          const lastLineId = (data.LinePriceList && data.LinePriceList[0]) ? data.LinePriceList[0].PassengerLineId : '';
          if (lastLineId) {
            let stored = wx.getStorageSync('storageSync') || {};
            wx.setStorageSync('storageSync', {
              ...stored,
              lineId: lastLineId
            });
            wx.setStorageSync('lineId', lastLineId);
          }
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
  // ===== 用户须知（参考 baoche 页 getNews） =====
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
  //获取线路Id
  getLineId() {
    wx.showLoading({
      title: '',
    })
    let _this = this;
    let data = {
      startId: _this.data.fromId != 'null' ? _this.data.fromId : 1,
      endId: _this.data.toId != 'null' ? _this.data.toId : 2,
      today: _this.data.today
    };
    wx.request({
      url: baseUrl + '/api/BusMobile/GetIntercityLineList',
      data: data,
      method: "GET",
      success: (res) => {
        console.log(res.data)
        let data = res.data.data;
        if (res.data.code == 0) {
          
          if (data.BusState) {
            if (data.Bus_HotSiteList) {
              let Bus_HotSiteList = data.Bus_HotSiteList
              Bus_HotSiteList.forEach(item => {
                item.sel = false; // 直接赋值添加新属性
              });
              _this.setData({
                hotStations: Bus_HotSiteList
              })
            } else {
              console.log('没有班次')
            }

          } else {
            // 合并写入：保留 syncDateCache 已写入的 startDate，整体覆盖会丢失出行日期
          let oldSync = wx.getStorageSync('storageSync') || {};
          let storageSync = {
            ...oldSync,
            EndLocation_Latitude: data.SedanEndLatLng.Lat,
            EndLocation_Longitude: data.SedanEndLatLng.Long,
            StatingLocation_Latitude: data.SedanStartLatLng.Lat,
            StatingLocation_Longitude: data.SedanStartLatLng.Long,
            lineId: data.Sedan_LineId,
          }
          wx.setStorageSync('storageSync', storageSync)
          wx.setStorageSync('lineId', data.Sedan_LineId)
          // 线路 Id 就绪后再拉包车可选时间段（后端定义几点到几点）
          _this.fetchCharterTimes(_this.data.dateIdx);
            let periods = []
            data.Sedan_ShiftList.forEach((item) => {
              periods.push(item.TimeName)
            })
            let tabs = TABS.slice(1);
            _this.setData({
              tabs,
              tab: 1,
              periods,
              carpool:data.Sedan_ShiftList,
              carpoolShow:data.Sedan_ShiftList[0].Sedan_ShiftList
            })
            console.log(_this.data.carpoolShow)
          }
          _this.setData({
            stationRoutes: data.Bus_ShiftList
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
      },
      fail(err) {
        console.error('网络异常:', err)
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  //获取包车车型列表（参考 baoche 页 getCarList）
  getCarList() {
    let _this = this;
    var userinfo = wx.getStorageSync('userInfo') || {};
    let starInfo2 = wx.getStorageSync('starInfo2') || {};
    let endInfo2 = wx.getStorageSync('endInfo2') || {};
    var storageSync = wx.getStorageSync('storageSync') || {};
    var pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    var startDate = storageSync.startDate;
    if (!storageSync.lineId || !pcTimeSync.StartTime) return;
    let ArrivalTime = startDate + ' ' + pcTimeSync.StartTime.split(':')[0] + ':59:00';
    var data = {
      IsExclusive: '100004-0000010001',
      Id: storageSync.lineId,
      // 坐标兜底：未选址时用线路起终点（GetIntercityLineList 写入），选了址用真实位置
      StartLat: starInfo2.startLait || storageSync.StatingLocation_Latitude,
      StartLng: starInfo2.startLont || storageSync.StatingLocation_Longitude,
      EndLat: endInfo2.endLait || storageSync.EndLocation_Latitude,
      EndLng: endInfo2.endLont || storageSync.EndLocation_Longitude,
      ArrivalTime: ArrivalTime,
      MemberId: userinfo.Id,
      AdultNumber: 1,
    };
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/getPriceListForLineId',
      data: data,
      method: "POST",
      success: (res) => {
        if (res.data.code == 0) {
          let list = res.data.data || [];
          if (!list.length) {
            _this.setData({
              carTypeList: [],
              price: '',
              initialPrice: '',
              rangfenceMapList: []
            })
            return;
          }
          // 默认选中第一辆车（与 baoche 一致）
          let first = list[0];
          wx.setStorageSync('pcTypeId', first.Id);
          _this.setData({
            carTypeList: list,
            carType: 0,
            rangfenceMapList: first.rangfenceMapList || [], //超范围列表
            price: first.Price + Number(first.Version || 0), //总价
            initialPrice: first.Price, //基本票价
            version: Number(first.Version || 0)
          })
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
  //点击车型（参考 baoche 页 chooseCarType）
  onVehTap(e) {
    let index = Number(e.currentTarget.dataset.index);
    let data = this.data.carTypeList[index];
    if (!data) return;
    wx.setStorageSync('pcTypeId', data.Id);
    this.setData({
      carType: index,
      rangfenceMapList: data.rangfenceMapList || [],
      price: data.Price + Number(data.Version || 0),
      initialPrice: data.Price,
      version: Number(data.Version || 0),
    })
  },
  // 生成固定四天：今天/明天/后天 + 第4天显示周几
  buildDates(base) {
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

  // 切日期：顶部出发日期文案同步
  applyDate(idx) {
    const d = this.data.dates[idx];
    if (!d) return;
    const dt = new Date(d.full.replace(/-/g, '/'));
    this.setData({
      dateLabel: `${dt.getMonth() + 1}月${dt.getDate()}日`,
    });
  },

  onDateTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({
      dateIdx: idx,
      today:e.currentTarget.dataset.item.full
    });
    this.applyDate(idx);
    if(this.data.tab == 0) {
      // 换日期后重新拉站点上车时间段
      this.getLineId()
    }else if(this.data.tab == 1) {

    }else if(this.data.tab == 2) {
      // 换日期后重新拉包车时间段
      this.syncDateCache(this.data.dates[idx]);
      this.fetchCharterTimes(idx);
    }else if(this.data.tab == 3) {
      // 换日期后重新同步缓存并拉取捎货规格、时效与摆渡价
      this.syncDateCache(this.data.dates[idx]);
      if (this.data.errandSub === 0) this.loadCargoOptions();
    }
  },

  /* ===== 包车出发：日期 / 时间段 底部弹框 ===== */
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

  // 弹框里选日期：dates 只有四天，天然限制在 今天~第4天
  onDateSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({
      dateIdx: idx,
      dateSheetOpen: false
    });
    this.syncDateCache(this.data.dates[idx]);
    this.applyDate(idx);
    this.fetchCharterTimes(idx);
  },

  // 弹框里选时间段（选项由后端返回）
  onTimeSheetTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const item = this.data.charterTimes[idx];
    if (!item) return;
    this.setData({
      timeIdx: idx,
      tripTime: item.label,
      timeSheetOpen: false,
    });
    // 时间段决定 ArrivalTime，选完同步缓存并询价
    this.syncTimeCache();
    this.getCarList();
  },

  // 获取包车可选时间段：GetCharterTimeListForDate 返回 res.data[i].RunTimeShow（如 "08:00-09:00"）
  fetchCharterTimes(dateIdx) {
    const d = this.data.dates[dateIdx];
    if (!d) return;
    const lineId = (wx.getStorageSync('storageSync') || {}).lineId;
    if (!lineId) return;
    this.setData({
      timeLoading: true
    });
    wx.request({
      url: baseUrl + '/api/DispatchMobile/GetCharterTimeListForDate',
      data: {
        time: d.full,
        lineId: lineId
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
        // 优先保持已选；原 tripTime 不在列表里（或首次进入）时默认选中第一个时间段
        const cur = this.data.tripTime;
        let keepIdx = charterTimes.findIndex(t => t.label === cur);
        if (keepIdx < 0 && charterTimes.length) keepIdx = 0;
        this.setData({
          charterTimes: charterTimes,
          timeIdx: keepIdx,
          tripTime: keepIdx >= 0 ? charterTimes[keepIdx].label : '',
          timeLoading: false,
        });
        // 时间段决定 ArrivalTime，有效时同步缓存并重新询价车型
        if (keepIdx >= 0) {
          this.syncTimeCache();
          this.getCarList();
        } else {
          this.setData({
            carTypeList: [],
            price: '',
            initialPrice: '',
            rangfenceMapList: []
          })
        }
      },
      fail: (err) => {
        console.error('网络异常:', err)
        this.setData({
          timeLoading: false
        });
      }
    })
  },

  onTabTap(e) {
    console.log(e.currentTarget.dataset)
    this.setData({
      tab: Number(e.currentTarget.dataset.item.id)
    });
    // 跨城跑腿下的城际捎货需要接口返回的规格与时效
    if (this.data.tab === 3 && this.data.errandSub === 0) {
      this.loadCargoOptions();
    }
  },



  onSwap() {
    this.setData({
      from: this.data.to,
      to: this.data.from
    });
  },

  /* ===== 站点上车 ===== */
  onHotTap(e) {
    const i = Number(e.currentTarget.dataset.idx);
    const key = `hotStations[${i}].sel`;
    const sel = !this.data.hotStations[i].sel;
    this.setData({
      [key]: sel,
      hotCount: this.data.hotStations.filter(h => h.sel).length + (sel ? 1 : -1),
    });
  },

  onOpenStationPage() {
    wx.showToast({
      title: '选择上下车站点（待接入）',
      icon: 'none'
    });
  },

  onBookStation(e) {
    const item = this.data.stationRoutes[Number(e.currentTarget.dataset.idx)];
    wx.navigateTo({
      url: '/pages/stationOrder/stationOrder?price=' + item.platformPrice
    });
  },

  /* ===== 拼车上门 / 包车出发 ===== */
  filterCarpool() {
    const p = this.data.periodIdx;
    this.setData({
      carpoolShow: this.data.carpoolAll.filter(c => c.period === p)
    });
  },

  onPeriodTap(e) {
    let carpoolShow = this.data.carpool.filter(item => {
      return item.TimeName == e.currentTarget.dataset.item
    })
    this.setData({
      periodIdx: Number(e.currentTarget.dataset.idx),
      carpoolShow:carpoolShow[0].Sedan_ShiftList
    });
    console.log(this.data.carpoolShow)
  },

  // 选中班次并跳转下单页（仅拼车上门）
  onCarpoolTap(e) {
    let _this = this;
    console.log(e.currentTarget.dataset)
    let data = e.currentTarget.dataset.item
    console.log(data)
    if (data.SeatNum == 0) {
      wx.showToast({
        title: '该时段已售罄',
        icon: 'none'
      });
      return;
    }
    // const item = this.data.carpoolAll.find(c => c.id === id);
    const d = this.data.dates[this.data.dateIdx];
    console.log(d)
    this.setData({
      carpoolSel: data.StartTime
    });
   
    wx.navigateTo({
      url: `/pages/rideOrder/rideOrder?mode=carpool` +
        `&from=${encodeURIComponent(this.data.from)}` +
        `&to=${encodeURIComponent(this.data.to)}` +
        `&dayLabel=${d.label}&md=${d.md}&time=${data.StartTime + '~' + data.EndTime}&date=${d.full}` ,
      fail(err) {
        wx.showModal({
          title: '跳转失败',
          content: String((err && err.errMsg) || err),
          showCancel: false,
        });
      },
    });
  },

  /* ===== 包车出发：右侧直接下单（逻辑参考 baoche 页） ===== */
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

  // 点「预约支付」：校验条款/手机号后弹出底部支付方式弹框
  onCharterPay() {
    let _this = this;
    if (!_this.data.agree) {
      wx.showToast({
        title: '请先同意服务条款',
        icon: 'none'
      });
      return;
    }
    if (!_this.data.phone) {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    const reg = /^1[3-9]\d{9}$/;
    if (!reg.test(_this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    _this.setData({
      payFrom: 'charter',
      paySheetShow: true,
      paySheetPhone: _this.data.phone
    });
  },
  // 支付方式弹框：展开/收起支付立减详情
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
  // 支付方式弹框：确认
  confirmPaySheet() {
    let _this = this;
    const payType = _this.data.payType;
    _this.setData({
      paySheetShow: false
    });
    // 城际捎货：走旧版 shaohuo 下单链路（取送货物订单）
    if (_this.data.payFrom === 'errand') {
      _this._doErrandOrder();
      return;
    }
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    if (!pcTimeSync.StartTime) {
      wx.showToast({
        title: '请选择出发时间段',
        icon: 'none'
      });
      return;
    }
    if (_this.isTimeInRange(formattedTime, pcTimeSync.StartTime)) {
      _this.callCar(payType)
    } else {
      wx.showModal({
        title: '提示',
        content: '尊敬的乘客：距离发车时间较近，车辆调度资源紧张，为保证乘车体验，发车时间将最优安排至下单1个小时内的最快发车时段，请知悉。咨询热线：0351-6078977 感谢您的理解与耐心等候！',
        success(res) {
          if (res.confirm) {
            _this.callCar(payType)
          }
        }
      })
    }
  },
  isTimeInRange(currentTime, selectedTime) {
    const [curH, curM] = currentTime.split(':').map(Number);
    const [selH, selM] = selectedTime.split(':').map(Number);
    if (curH === selH && curM >= 45) {
      return false;
    }
    return true;
  },

  // ===== 支付流程公共状态与工具 =====
  _payBusy: false, //下单/支付进行中，忽略重复点击，避免产生多笔订单
  _showPayLoading() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  },
  _finishPayFlow() {
    this._payBusy = false;
    wx.hideLoading();
  },
  // 下单成功后清理行程草稿缓存
  _clearOrderDraft() {
    ['starInfo2', 'endInfo2', 'storageSync', 'pcTimeSync', 'personNum', 'pcTypeId', 'textareaValue', 'phoneStr', 'lineId'].forEach(function (key) {
      wx.removeStorageSync(key);
    });
  },
  _goPayDetail(orderId) {
    wx.reLaunch({
      url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + '&from=orderList'
    });
  },
  // 云闪付：跳外部小程序，返回后由 unionPayWatcher 查支付结果
  _handleUnionPay(orderId, memberInfoId) {
    let that = this;
    let appid = wx.getStorageSync('appId');
    http.getRequest('/Api/DispatchMobile/GoUnionPay?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + memberInfoId + "&PaymentType=2", "", wx.getStorageSync('header'), (res) => {
      if (res.code != 0) {
        that._finishPayFlow();
        wx.showToast({
          title: res.msg || '获取支付信息失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      that._finishPayFlow();
      let payData = res.data || {};
      unionPayWatcher.mark(orderId, 'dispatch');
      wx.navigateToMiniProgram({
        appId: payData.CqpMpAppId,
        path: payData.CqpMpPath,
        fail(err) {
          console.log('打开云闪付失败', err);
          unionPayWatcher.clear();
          wx.showModal({
            title: '提示',
            content: '无法打开云闪付，可稍后在订单页继续支付。',
            confirmText: '查看订单',
            cancelText: '知道了',
            success(r) {
              if (r.confirm) that._goPayDetail(orderId);
            }
          });
        }
      });
    }, (err) => {
      console.log(err);
      that._finishPayFlow();
      wx.showToast({
        title: '获取支付信息失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    });
  },
  // 换取支付参数并唤起微信收银台
  _launchWechatPay(orderId, memberInfoId) {
    let that = this;
    let appid = wx.getStorageSync('appId');
    http.getRequest('/Api/DispatchMobile/GoUnionPay?appid=' + appid + '&Id=' + orderId + '&MemberInfoId=' + memberInfoId + "&PaymentType=1", "", wx.getStorageSync('header'), (res) => {
      if (res.code != 0) {
        that._finishPayFlow();
        wx.showToast({
          title: res.msg || '获取支付信息失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      wx.hideLoading();
      let payData = res.data || {};
      wx.requestPayment({
        timeStamp: payData.TimeStamp,
        nonceStr: payData.NonceStr,
        package: payData.Package,
        signType: payData.SignType,
        paySign: payData.PaySign,
        success() {
          that._clearOrderDraft();
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
            success: function () {
              that.setSubscribeMessage();
              setTimeout(function () {
                that._goPayDetail(orderId);
              }, 1000);
            }
          });
        },
        fail(err) {
          console.log('拉起支付失败', err);
          that._finishPayFlow();
          setTimeout(function () {
            that._goPayDetail(orderId);
          }, 1000);
        }
      });
    }, (err) => {
      console.log(err);
      that._finishPayFlow();
      wx.showToast({
        title: '获取支付信息失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    });
  },
  // 创建包车订单
  _createOrder(reqData, memberInfoId) {
    let that = this;
    that._showPayLoading();
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/CreatePersonTicketOrder',
      data: reqData,
      method: 'POST',
      success(res) {
        let ress = res.data;
        if (ress.code != '0' || !ress.data) {
          that._finishPayFlow();
          wx.showToast({
            title: ress.msg || '下单失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        let orderId = ress.data.Id;
        if (that.data.payType === 'union') {
          that._finishPayFlow();
          that._handleUnionPay(orderId, memberInfoId);
          return;
        }
        that._launchWechatPay(orderId, memberInfoId);
      },
      fail(err) {
        console.log('下单请求失败', err);
        that._finishPayFlow();
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  // 当日已有订单：列出历史订单，用户选择取消或继续下单
  _showDayOrderModal(list, onContinue) {
    let that = this;
    let str = '';
    (list || []).forEach(function (item) {
      str += item.PassengerLineId_Name + ',' + '订单号为:' + item.Code + '\n';
    });
    wx.showModal({
      title: '下单记录',
      content: str,
      cancelText: '取消下单',
      confirmText: '继续下单',
      complete: (res) => {
        if (res.confirm) {
          onContinue();
        } else {
          that._finishPayFlow();
          if (res.cancel) {
            wx.navigateTo({
              url: '/pages/index/index',
            });
          }
        }
      }
    });
  },
  // 叫车（下单 + 支付入口）
  callCar: throttle(function (payType) {
    let _this = this;
    if (_this._payBusy) return false;
    if (payType) _this.setData({
      payType: payType
    });
    _this._payBusy = true;

    let openid = wx.getStorageSync('openid');
    if (!openid) {
      _this._finishPayFlow();
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      });
      return false;
    }
    let user = wx.getStorageSync('userInfo') || {};
    let startInfo = wx.getStorageSync('starInfo2') || {};
    let endInfo = wx.getStorageSync('endInfo2') || {};
    let storageSync = wx.getStorageSync('storageSync') || {};
    let pcTimeSync = wx.getStorageSync('pcTimeSync') || {};
    let pcTypeId = wx.getStorageSync('pcTypeId');
    let startDate = storageSync.startDate;

    let invalidMsg = (!startInfo.startAddress && '请选择出发乘车位置') ||
      (!endInfo.endAddress && '请选择下车位置') ||
      (!_this.data.phone && '请填写联系方式') ||
      (!pcTimeSync.StartTime && '请选择出发时间');
    if (invalidMsg) {
      _this._finishPayFlow();
      wx.showToast({
        title: invalidMsg,
        icon: 'none',
        duration: 2000
      });
      return false;
    }

    let ArrivalTime = startDate + ' ' + pcTimeSync.StartTime.split(':')[0] + ':59:00';
    let reqData = {
      PassengerLineId: storageSync.lineId,
      IntoLocation: startInfo.startAddress,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endAddress,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      Departure: "100004-0000980002",
      ArrivalTime: ArrivalTime,
      Personal: user.Id,
      DispatchListId: "",
      IsReservation: "100004-0000010002",
      CouponDetailsId: pcTimeSync.hasChooseId ? pcTimeSync.hasChooseId : "",
      PersonalIds: _this.data.phone,
      Note: _this.data.remark,
      IsExclusive: "100004-0000010001",
      IsPickGoods: '100004-0000010002',
      SelectCarType: pcTypeId,
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      AdultNumber: 1,
      ChildNum: 0,
    };

    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + _this.data.phone + '&timeDay=' + startDate, '', '', (res) => {
      if (res.code != 0) {
        _this._finishPayFlow();
        wx.showToast({
          title: '数据请求失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if (!res.count) {
        _this._createOrder(reqData, user.Id);
      } else {
        _this._showDayOrderModal(res.data, function () {
          _this._createOrder(reqData, user.Id);
        });
      }
    }, (err) => {
      console.log(err);
      _this._finishPayFlow();
      wx.showToast({
        title: '数据请求失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    });
  }, 5000),
  // 订阅消息
  setSubscribeMessage: function () {
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
    })
  },



  /* ===== 跨城跑腿 ===== */
  /* ===== 城际捎货：规格/时效与摆渡价（接口与计价同旧版 shaohuo 页） ===== */
  // 切到「跨城跑腿」或子标签「城际捎货」时拉取规格、时效列表
  loadCargoOptions() {
    const userinfo = wx.getStorageSync('userInfo');
    if (!userinfo) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      });
      return;
    }
    const lineId = wx.getStorageSync('lineId') || '';
    this.setData({
      cargoLoading: true
    });
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLastOrderAddress',
      data: {
        LineId: lineId,
        MemberId: userinfo.Id,
        TypeId: 3 // 1=拼车 2=包车 3=捎货/闪送
      },
      method: "POST",
      success: (res) => {
        if (res.data.code != 0 || !res.data.data) {
          this.setData({
            cargoLoading: false
          });
          wx.showToast({
            title: res.data.msg || '货物规格获取失败',
            icon: 'none'
          });
          return;
        }
        const data = res.data.data;
        const list = data.LinePriceList || [];
        // 无 DeliveryTimeState 的是货物规格，有值的是捎货时效（普通/加急）
        const specList = list.filter(item => item.DeliveryTimeState == '');
        const speedList = list.filter(item => item.DeliveryTimeState != '');
        const patch = {
          cargoSpecList: specList,
          cargoSpeedList: speedList,
          cargoLoading: false
        };
        // 保留已选项（按 Id 匹配），否则默认选中第一项
        const curSpec = this.data.cargoSpecList[this.data.cargoType];
        const specKeep = curSpec ? specList.findIndex(s => s.Id === curSpec.Id) : -1;
        patch.cargoType = specKeep >= 0 ? specKeep : (specList.length ? 0 : -1);
        const curSpeed = this.data.cargoSpeedList[this.data.cargoSpeed];
        const speedKeep = curSpeed ? speedList.findIndex(s => s.Id === curSpeed.Id) : -1;
        patch.cargoSpeed = speedKeep >= 0 ? speedKeep : (speedList.length ? 0 : -1);

        // 起终点都没选过时，用上次捎货订单回显联系方式与上下车位置
        const hasAddr = wx.getStorageSync('starInfo2') || wx.getStorageSync('endInfo2');
        if (!hasAddr && data.IntoLatitude != 0) {
          patch.senderPhone = data.DeliverGoodsTel || this.data.senderPhone;
          patch.senderName = data.DeliverGoodsName || this.data.senderName;
          patch.receiverPhone = data.TakeOverGoodsTel || this.data.receiverPhone;
          patch.receiverName = data.TakeOverGoodsName || this.data.receiverName;
          patch.addrFrom = data.IntoLocation || '';
          patch.addrTo = data.OffLocation || '';
          wx.setStorageSync('starInfo2', {
            startAddress: data.IntoLocation,
            startLait: data.IntoLatitude,
            startLont: data.IntoLongitude,
            startName: data.IntoLocation,
            startCity: this.data.from
          });
          wx.setStorageSync('endInfo2', {
            endAddress: data.OffLocation,
            endLait: data.OffLatitude,
            endLont: data.OffLongitude,
            endName: data.OffLocation,
            endCity: this.data.to
          });
        }
        this.setData(patch, () => {
          this.calcErrandFee();
          this.shGetPrice();
        });
      },
      fail: (err) => {
        console.error('捎货规格接口异常:', err);
        this.setData({
          cargoLoading: false
        });
      }
    });
  },

  // 捎货询价：取摆渡价 Version 与超范围费用（旧版 information 组件 sh 分支口径）
  shGetPrice() {
    const storageSync = wx.getStorageSync('storageSync') || {};
    if (!storageSync.lineId) return;
    const starInfo2 = wx.getStorageSync('starInfo2') || {};
    const endInfo2 = wx.getStorageSync('endInfo2') || {};
    const userinfo = wx.getStorageSync('userInfo') || {};
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/getPriceListForLineId',
      data: {
        IsExclusive: '100004-0000010002', // 拼车/捎货口径
        Id: storageSync.lineId,
        StartLat: starInfo2.startLait || storageSync.StatingLocation_Latitude,
        StartLng: starInfo2.startLont || storageSync.StatingLocation_Longitude,
        EndLat: endInfo2.endLait || storageSync.EndLocation_Latitude,
        EndLng: endInfo2.endLont || storageSync.EndLocation_Longitude,
        MemberId: userinfo.Id,
        AdultNumber: 1,
      },
      method: "POST",
      success: (res) => {
        if (res.data.code != 0) {
          if (res.data.msg && res.data.msg !== '请选择下车位置') {
            wx.showModal({
              title: "服务范围提示",
              content: "不在营运线路范围内,下单请联系客服，电话:0351-6078977，是否电话？",
              confirmText: "确定",
              cancelText: "关闭",
              success(r) {
                if (r.confirm) wx.makePhoneCall({ phoneNumber: "0351-6078977" });
              },
            });
          }
          return;
        }
        const first = (res.data.data || [])[0] || {};
        // 只取摆渡价，超范围列表仍归包车流程使用
        this.setData({
          shVersion: Number(first.Version || 0)
        });
        this.calcErrandFee();
      },
      fail: (err) => {
        console.error('捎货询价异常:', err);
      }
    });
  },

  /* ===== 跨城跑腿：子tab与表单 ===== */
  onErrandSubTap(e) {
    this.setData({
      errandSub: Number(e.currentTarget.dataset.idx)
    });
    this.calcErrandFee();
    // 切到城际捎货时按旧版链路重新拉取规格、时效与摆渡价（已选项按 Id 保留）
    if (this.data.errandSub === 0) this.loadCargoOptions();
  },

  onErInput(e) {
    this.setData({
      [e.currentTarget.dataset.k]: e.detail.value
    });
  },

  // 捎货：时效 / 类别
  onCargoSpeedTap(e) {
    this.setData({
      cargoSpeed: Number(e.currentTarget.dataset.idx)
    });
    this.calcErrandFee();
  },
  onCargoTypeTap(e) {
    this.setData({
      cargoType: Number(e.currentTarget.dataset.idx)
    });
    this.calcErrandFee();
  },

  // 捎货：货物照片（选图后分片上传服务器，最多3张，同旧版 shaohuo 页）
  onCargoImgAdd() {
    const left = 3 - this.data.cargoImgs.length;
    if (left <= 0) {
      wx.showToast({
        title: '最多上传三张图片',
        icon: 'none'
      });
      return;
    }
    const that = this;
    wx.chooseMedia({
      count: left,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      async success(res) {
        const paths = (res.tempFiles || []).map(f => f.tempFilePath);
        if (!paths.length) return;
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        const urls = [];
        // 串行上传（避免内存溢出）
        for (const path of paths) {
          try {
            const url = await that.uploadFileChunked(path);
            urls.push(baseUrl + url.data);
          } catch (err) {
            wx.showToast({
              title: '部分上传失败',
              icon: 'none'
            });
            console.error('Upload failed:', err);
          }
        }
        that.setData({
          cargoImgs: that.data.cargoImgs.concat(urls).slice(0, 3)
        });
        wx.hideLoading();
        if (urls.length) {
          wx.showToast({
            title: '上传完成'
          });
        }
      },
    });
  },
  // 分片上传单个文件：/Api/UploadMobile/ImageChunk
  uploadFileChunked(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile({
        filePath,
        success: ({
          data: arrayBuffer
        }) => {
          const totalSize = arrayBuffer.byteLength;
          const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
          const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          let uploadedCount = 0;
          for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, totalSize);
            const chunk = arrayBuffer.slice(start, end);
            const base64 = wx.arrayBufferToBase64(chunk);
            wx.request({
              url: UPLOAD_API,
              method: 'POST',
              data: {
                FileKey: fileId,
                ChunkIndex: i,
                ChunkCount: totalChunks,
                ChunkData: base64
              },
              timeout: 30000,
              success: res => {
                if (res.statusCode !== 200) {
                  return reject(new Error(`分片 ${i} 失败: ${res.statusCode}`));
                }
                uploadedCount++;
                // 最后一片上传完成，返回 { data: "/wxImg/xxx.jpg" }
                if (uploadedCount === totalChunks) {
                  const url = res.data;
                  if (url) resolve(url);
                  else reject(new Error('未返回有效 URL'));
                }
              },
              fail: reject
            });
          }
        },
        fail: reject
      });
    });
  },
  onCargoImgDel(e) {
    const imgs = this.data.cargoImgs.slice();
    imgs.splice(Number(e.currentTarget.dataset.idx), 1);
    this.setData({
      cargoImgs: imgs
    });
  },

  // 跑腿：服务类型
  onRunTypeTap(e) {
    this.setData({
      runType: Number(e.currentTarget.dataset.idx)
    });
    this.calcErrandFee();
  },

  onErAgreeTap() {
    this.setData({
      erAgree: !this.data.erAgree
    });
  },

  // 费用：捎货=规格价+时效加价+摆渡价（同旧版 orderBottom）；跑腿=服务类型价
  calcErrandFee() {
    let base, urgent;
    if (this.data.errandSub === 0) {
      const spec = this.data.cargoSpecList[this.data.cargoType];
      const speed = this.data.cargoSpeedList[this.data.cargoSpeed];
      base = spec ? Number(spec.Price || 0) : 0;
      urgent = speed ? Number(speed.Price || 0) : 0;
      this.setData({
        erBase: base,
        erUrgent: urgent,
        erTotal: base + urgent + Number(this.data.shVersion || 0)
      });
      return;
    }
    base = this.data.runTypes[this.data.runType].price;
    urgent = 0;
    this.setData({
      erBase: base,
      erUrgent: urgent,
      erTotal: base + urgent
    });
  },

  onErrandPay() {
    const d = this.data;
    if (!d.erAgree) {
      wx.showToast({
        title: '请先同意服务条款',
        icon: 'none'
      });
      return;
    }
    const need = (v, msg) => {
      if (!v) {
        wx.showToast({
          title: msg,
          icon: 'none'
        });
        return false;
      }
      return true;
    };
    const phoneOk = (v) => /^1\d{10}$/.test(v);
    if (d.errandSub === 0) {
      // 校验口径同旧版 shaohuo：上下车位置、货物规格、时效、名称、寄/收件联系方式
      const startInfo = wx.getStorageSync('starInfo2') || {};
      const endInfo = wx.getStorageSync('endInfo2') || {};
      if (!startInfo.startAddress) {
        wx.showToast({
          title: '请选择出发乘车位置',
          icon: 'none'
        });
        return;
      }
      if (!endInfo.endAddress) {
        wx.showToast({
          title: '请选择下车位置',
          icon: 'none'
        });
        return;
      }
      if (!d.cargoSpecList[d.cargoType]) {
        wx.showToast({
          title: '请选择物品大小',
          icon: 'none'
        });
        return;
      }
      if (d.cargoSpeed < 0) {
        wx.showToast({
          title: '请选择捎货时效',
          icon: 'none'
        });
        return;
      }
      if (!need(d.cargoName, '请填写货物名称')) return;
      if (!need(d.senderPhone, '请输入寄件人联系方式')) return;
      if (!phoneOk(d.senderPhone)) {
        wx.showToast({
          title: '寄件人手机号格式不正确',
          icon: 'none'
        });
        return;
      }
      if (!need(d.receiverPhone, '请输入收件人联系方式')) return;
      if (!phoneOk(d.receiverPhone)) {
        wx.showToast({
          title: '收件人手机号格式不正确',
          icon: 'none'
        });
        return;
      }
      if (!d.cargoImgs.length) {
        wx.showToast({
          title: '请至少上传1张货物照片',
          icon: 'none'
        });
        return;
      }
      // 校验通过：弹出底部支付方式弹框，确认后走 _doErrandOrder
      this.setData({
        payFrom: 'errand',
        paySheetShow: true,
        paySheetPhone: d.receiverPhone || d.senderPhone || ''
      });
      return;
    } else {
      if (!need(d.shopName, '请填写点餐店铺')) return;
      if (!need(d.foodReq, '请填写餐品要求')) return;
      if (!need(d.runName, '请填写送达人称呼') || !need(d.runPhone, '请填写送达人电话')) return;
      if (!phoneOk(d.runPhone)) {
        wx.showToast({
          title: '送达人手机号格式不正确',
          icon: 'none'
        });
        return;
      }
      if (!need(d.runAddr, '请填写取件地址')) return;
      if (!need(d.orderPhone, '请填写下单人联系电话')) return;
      if (!phoneOk(d.orderPhone)) {
        wx.showToast({
          title: '下单人手机号格式不正确',
          icon: 'none'
        });
        return;
      }
    }
    // TODO 接入下单接口
    wx.showToast({
      title: `下单成功 ¥${d.erTotal}`,
      icon: 'none'
    });
  },

  // ===== 城际捎货：创建取送货物订单并拉起支付（流程同旧版 shaohuo 页） =====
  _doErrandOrder() {
    let that = this;
    if (that._payBusy) return false; // 上一次下单/支付未结束，忽略重复点击
    that._payBusy = true;

    const openid = wx.getStorageSync('openid');
    if (!openid) {
      that._finishPayFlow();
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      });
      return false;
    }
    const user = wx.getStorageSync('userInfo') || {};
    const startInfo = wx.getStorageSync('starInfo2') || {};
    const endInfo = wx.getStorageSync('endInfo2') || {};
    const storageSync = wx.getStorageSync('storageSync') || {};
    const startDate = storageSync.startDate;
    const spec = that.data.cargoSpecList[that.data.cargoType];
    const speed = that.data.cargoSpeedList[that.data.cargoSpeed];
    if (!spec || !speed) {
      that._finishPayFlow();
      wx.showToast({
        title: '货物规格信息缺失，请重试',
        icon: 'none'
      });
      return false;
    }

    let reqData = {
      PassengerLineId: storageSync.lineId,
      IntoLocation: startInfo.startAddress,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endAddress,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      PassengerNumber: 1,
      Departure: "100004-0000980002",
      Personal: user.Id,
      SeatNumber: '',
      IsReservation: "100004-0000010002",
      Note: that.data.cargoRemark,
      IsExclusive: "100004-0000010001",
      IsPickGoods: '100004-0000010001',
      SelectCarType: spec.Id, // 货物规格Id
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      DeliverGoodsTel: that.data.senderPhone,
      DeliverGoodsName: that.data.senderName,
      TakeOverGoodsTel: that.data.receiverPhone,
      TakeOverGoodsName: that.data.receiverName,
      GoodsSize: that.data.cargoName,
      ImgList: that.data.cargoImgs,
      DeliveryType: speed.Id // 捎货时效Id
    };
    let phoneStr = that.data.senderPhone + '|' + (that.data.senderName || '') + ',' + that.data.receiverPhone + '|' + (that.data.receiverName || '');

    // 先查该联系方式当日是否已有订单，再决定直接下单还是让用户确认
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + phoneStr + '&timeDay=' + startDate, '', '', (res) => {
      if (res.code != 0) {
        that._finishPayFlow();
        wx.showToast({
          title: '数据请求失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      if (!res.count) {
        that._createErrandOrder(reqData, user.Id);
      } else {
        that._showDayOrderModal(res.data, function () {
          that._createErrandOrder(reqData, user.Id);
        });
      }
    }, (err) => {
      console.log(err);
      that._finishPayFlow();
      wx.showToast({
        title: '数据请求失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    });
  },
  // 创建取送货物订单：成功后按所选支付方式分流（云闪付/微信）
  _createErrandOrder(reqData, memberInfoId) {
    let that = this;
    that._showPayLoading();
    wx.request({
      url: baseUrl + '/Api/DispatchMobile/CreateBringGoodsOrder',
      data: reqData,
      method: 'POST',
      success(res) {
        let ress = (res && res.data) || {};
        if (ress.code != '0' || !ress.data) {
          that._finishPayFlow();
          wx.showToast({
            title: ress.msg || '下单失败，请稍后重试',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        let orderId = ress.data.Id;
        if (that.data.payType === 'union') {
          that._finishPayFlow();
          that._handleUnionPay(orderId, memberInfoId);
          return;
        }
        that._launchWechatPay(orderId, memberInfoId);
      },
      fail(err) {
        console.log('下单请求失败', err);
        that._finishPayFlow();
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
});