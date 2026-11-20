const app = getApp();
const BASE_URL = require("../../utils/BASE_URL");
const orderStorage = require("../../utils/orderStorage.js");
const auth = require("../../utils/auth.js");
const http = require("../../utils/http.js");
var baseUrl = BASE_URL.BASE_URL //配置基础url



Page({
  data: {
    fromCity: '孝义',
    fromCityId: 2,
    toCity: '太原',
    toCityId: 1,
    date: '',
    dateLabel: '',
    dateStart: '',
    dateEnd: '',
    historyRoutes: [],
    hotRoutes: [],
    selectedKey: '',
    // 首页底部最新订单卡片（登录后才请求）
    latestOrder: null, // 处理后的展示对象；null 表示无订单/未登录
  },

  // 回到首页 = 本轮下单流程结束（不管下没下单）：清掉下单草稿，登录态与城市偏好保留。
  // 下单成功的清理由各下单页在支付成功回调里做，这里兜底「中途返回不下单」的场景。
  onShow() {
    orderStorage.clearOrderDraft();
    // 首页底部最新订单卡片：每次展示都刷一次（下单后返回首页要看到新单）
    this.loadLatestOrder();
    // this.saveCity()
    // 从城市选择页返回时，以 onPickCity 的回传值为准，不用缓存覆盖
    if (this._fromCityPicker) {
      this._fromCityPicker = false;
      return;
    }
    let city_record = wx.getStorageSync('city_record')
    if (!city_record || !city_record.fromCity) return;
    this.setData({
      fromCity: city_record.fromCity,
      fromCityId: city_record.fromCityId,
      toCity: city_record.toCity,
      toCityId: city_record.toCityId,
    })
  },

  onLoad() {
    const accountInfo = wx.getAccountInfoSync();
    const appId = accountInfo.miniProgram.appId;
    wx.setStorageSync('appId', appId)
    const today = new Date();
    const maxDate = new Date(today.getTime());
    maxDate.setDate(maxDate.getDate() + 3);
    this.setData({
      date: this.formatDate(today),
      dateLabel: this.formatLabel(today),
      dateStart: this.formatDate(today),
      dateEnd: this.formatDate(maxDate),

    });
    // 读取缓存的城市选择
    const saved = wx.getStorageSync('chengjiCity');
    if (saved) {
      const fromCity = saved.fromCity || this.data.fromCity;
      const toCity = saved.toCity || this.data.toCity;
      this.setData({
        fromCity,
        toCity,
      });
    }
    this.getLineList()
  },
  //获取路线列表
  getLineList() {
    wx.showLoading({
      title: '',
    })
    let _this = this;

    wx.request({
      url: baseUrl + '/api/BusMobile/GetHotLineCityList',
      data: {},
      method: "GET",
      success: (res) => {

        if (res.data.code == 0) {
          console.log(res)
          _this.setData({
            hotRoutes: res.data.data
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
  formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatLabel(d) {
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getMonth() + 1}月${d.getDate()}日 ${week[d.getDay()]}`;
  },

  onPickCity(e) {
    const type = e.currentTarget.dataset.type;
    console.log(type)
    // 标记本次是从城市选择页返回，onShow 不再用缓存覆盖
    this._fromCityPicker = true;
    wx.navigateTo({
      url: `/pages/city/city?from=${type}&current=${type === 'from' ? this.data.fromCity : this.data.toCity}`,
      events: {
        citySelected: (data) => {
          console.log(data)
          if (type === 'from') {
            this.setData({
              fromCity: data.cityName,
              fromCityId: data.cityId,
              selectedKey: '',
            });
          } else {
            this.setData({
              toCity: data.cityName,
              toCityId: data.cityId,
              selectedKey: '',
            });
          }
          this.saveCity();
        },
      },
    });
  },

  onSwap() {
    
    this.setData({
      fromCity: this.data.toCity,
      fromCityId:this.data.toCityId,
      toCity: this.data.fromCity,
      toCityId:this.data.fromCityId,
      selectedKey: '',
    });
    this.saveCity();
  },

  onDateChange(e) {
    const d = new Date(e.detail.value);
    this.setData({
      date: e.detail.value,
      dateLabel: this.formatLabel(d),
    });
  },

  onChipTap(e) {
    const ds = e.currentTarget.dataset;
    const route = ds.route;
    this.setData({
      fromCity: route.startName,
      fromCityId: route.startId,
      toCity: route.endName,
      toCityId: route.endId,
      selectedKey: ds.group + '-' + ds.index,
    });
    this.saveCity();
  },

  saveCity() {
    wx.setStorageSync('chengjiCity', {
      fromCity: this.data.fromCity,
      toCity: this.data.toCity,
    });
  },

  onSearch() {
    // 出发地与目的地相同不允许查询
    console.log(this.data.fromCity)
    console.log(this.data.toCity)
    if (this.data.fromCity === this.data.toCity) {
      wx.showToast({
        title: '出发地和目的地不能相同',
        icon: 'none',
      });
      return;
    }
    const query = [
      'from=' + encodeURIComponent(this.data.fromCity),
      'fromId=' + this.data.fromCityId,
      'to=' + encodeURIComponent(this.data.toCity),
      'toId=' + this.data.toCityId,
      'date=' + this.data.date,
    ].join('&');
    let city_record = {
      fromCity: this.data.fromCity,
    fromCityId: this.data.fromCityId,
    toCity: this.data.toCity,
    toCityId: this.data.toCityId,
    }
    wx.setStorageSync('city_record', city_record)
    wx.navigateTo({
      url: '/pages/ride/ride?' + query,
    });
  },

  // 返程预约入口（同旧版首页 index.js 的 fancheng）
  fancheng() {
    wx.navigateTo({
      url: '/pages/fancheng/fancheng'
    })
  },

  /**
   * 加载首页底部最新订单卡片
   * 接口：GET /api/BusMobile/GetMemberOrderCard?MemberId=
   * - 未登录时不请求，卡片不展示
   * - 后端返回 null / 空对象 / 非 0 code 时卡片不展示
   */
  loadLatestOrder() {
    if (!auth.isLogin()) {
      this.setData({ latestOrder: null });
      return;
    }
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.Id) {
      this.setData({ latestOrder: null });
      return;
    }
    http.getRequest(
      '/api/BusMobile/GetMemberOrderCard',
      { MemberId: userInfo.Id },
      wx.getStorageSync('header'),
      (res) => {
        if (!res || res.code !== 0 || !res.data) {
          this.setData({ latestOrder: null });
          return;
        }
        const card = this._formatOrderCard(res.data);
        this.setData({ latestOrder: card });
      },
      (err) => {
        console.log('loadLatestOrder fail', err);
        this.setData({ latestOrder: null });
      }
    );
  },

  /**
   * 把后端返回的订单原始数据，处理成首页卡片的展示结构。
   * 字段命名按常见约定；GetMemberOrderCard 还没上线，这里按 travelList / payDetail 已用字段猜测，
   * 等接口部署后若字段名不同，改这里即可。
   *
   * 展示规则（产品要求）：
   *  1. 订单类型：拼车 / 捎货 / 包车 / 班线
   *  2. 线路名称：起→终
   *  3. 发车时间-到达时间：
   *     - 班线（大巴）显示发车+到达
   *     - 拼车 / 捎货 / 包车 只显示发车时间（无到达时间）
   *  4. 状态显示规则：
   *     - 捎货：一直显示到送达 → 待取货 / 已拿货 / 已送达
   *     - 班线 / 拼车 / 包车：下单后显示「已预约」/「已预约成功」，上车后状态消失（卡片可继续显示但不展示状态标签）
   */
  _formatOrderCard(raw) {
    // Order_Type：1 拼车  2 包车  3 捎货  4 巴士
    const typeMap = { 1: '拼车', 2: '包车', 3: '捎货', 4: '巴士' };
    const orderType = Number(raw.Order_Type) || 0;
    const typeText = typeMap[orderType] || raw.Order_TypeName || '';
    const isBus = orderType === 4 || /巴士|班线/.test(typeText);

    // 线路：Line_Name 后端已按「起→终」格式返回
    const route = raw.Line_Name || '';

    // 时间：发车 - 到达（真实字段名）；非班线只显示发车
    const depart = this._shortTime(raw.DepartureTime || '');
    const arrive = this._shortTime(raw.ArrivalTime || '');
    let timeText = depart;
    if (isBus && arrive) {
      timeText = `${depart} - ${arrive}`;
    }

    // 状态：后端直接给 OrderState_Name
    // 规则：
    //  - 捎货（Order_Type=3）：一直显示（待取货/已拿货/已送达）
    //  - 非捎货：上车/运输后隐藏状态（只保留卡片本身）
    let statusText = raw.OrderState_Name || '';
    const isPickGoods = orderType === 3;
    if (!this._shouldShowStatus(isPickGoods, statusText)) {
      statusText = '';
    }

    return {
      id: raw.Id || '',
      isBus,
      typeText,
      route,
      timeText,
      statusText,
      statingLocation: raw.StatingLocation || '',
      _raw: raw,
    };
  },

  /**
   * 状态展示规则：
   *  - 捎货：始终显示（待取货/已拿货/已送达 等）
   *  - 非捎货：包含"上车/运输/完成"等关键字时隐藏（用户要求：巴士上车后不显示状态）
   */
  _shouldShowStatus(isPickGoods, status) {
    if (!status) return false;
    if (isPickGoods) return true;
    const hideWhen = /上车|已上车|运输|行程中|出发|已出发|完成|已完成|送达|已送达|结束|已结束/;
    return !hideWhen.test(status);
  },

  // 时间截取：只保留 YYYY-MM-DD HH:mm
  _shortTime(t) {
    if (!t) return '';
    return String(t).slice(0, 16);
  },

  /**
   * 点击最新订单卡片跳转详情
   * - 大巴 / 班线：跳 stationDetail（站点详情页，用户要求）
   *   注：stationDetail 现有 onLoad 只识别站点坐标参数，不识别订单 Id。
   *       如果后端 GetMemberOrderCard 能额外返回起点站经纬度/站名，直接带过去；
   *       否则应把 stationDetail 改造成可接受 orderId、内部自己拉站点详情。
   * - 拼车 / 包车 / 捎货：按 travelList.orderDetail() 逻辑：
   *   · FormStatus == 进行中 且有 DispatchListId → taxiDriving
   *   · 否则 → payDetail
   */
  tapLatestOrder() {
    const card = this.data.latestOrder;
    if (!card || !card.id) return;
    if (card.isBus) {
      // 大巴订单：按用户要求跳 stationDetail，带 StatingLocation（起点站 LocationId）
      const params = [
        'orderId=' + card.id,
        'statingLocation=' + encodeURIComponent(card.statingLocation || ''),
        'name=' + encodeURIComponent(card.route),
      ].join('&');
      wx.navigateTo({
        url: `/pages/stationDetail/stationDetail?${params}`,
      });
    } else {
      // 非大巴订单（拼车/包车/捎货）：统一跳 payDetail
      wx.navigateTo({
        url: `/user_center/pages/payDetail/payDetail?from=indexCard&orderId=${card.id}`,
      });
    }
  },
});