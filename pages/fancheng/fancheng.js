const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const DAY_LABEL = ['今天', '明天', '后天', '大后天'];

// 去程航班模板
const OUT_TPL = [{
    dep: '22:00',
    dap: '武宿T2',
    arr: '00:10',
    aap: '双流T1',
    air: '川航',
    type: '中型机',
    share: true
  },
  {
    dep: '21:30',
    dap: '武宿T1',
    arr: '23:40',
    aap: '双流T2',
    air: '藏航',
    type: '中型机',
    share: true
  },
  {
    dep: '19:35',
    dap: '武宿T2',
    arr: '21:55',
    aap: '天府T2',
    air: '东航',
    type: '中型机',
    share: true
  },
  {
    dep: '12:40',
    dap: '武宿T2',
    arr: '15:05',
    aap: '双流T1',
    air: '川航',
    type: '中型机',
    share: false
  },
  {
    dep: '08:05',
    dap: '武宿T1',
    arr: '10:30',
    aap: '双流T2',
    air: '东航',
    type: '大型机',
    share: false
  },
  {
    dep: '15:20',
    dap: '武宿T2',
    arr: '17:45',
    aap: '天府T2',
    air: '川航',
    type: '中型机',
    share: true
  }
];

// 返程航班模板
const RET_TPL = [{
    dep: '19:15',
    dap: '双流T1',
    arr: '21:05',
    aap: '武宿T2',
    air: '川航',
    type: '中型机',
    share: true
  },
  {
    dep: '11:55',
    dap: '天府T2',
    arr: '14:15',
    aap: '武宿T2',
    air: '东航',
    type: '中型机',
    share: true
  },
  {
    dep: '19:10',
    dap: '天府T2',
    arr: '21:15',
    aap: '武宿T2',
    air: '东航',
    type: '中型机',
    share: true
  },
  {
    dep: '16:15',
    dap: '天府T2',
    arr: '18:15',
    aap: '武宿T2',
    air: '东航',
    type: '中型机',
    share: true
  },
  {
    dep: '09:15',
    dap: '天府T2',
    arr: '11:15',
    aap: '武宿T2',
    air: '川航',
    type: '中型机',
    share: true
  },
  {
    dep: '07:30',
    dap: '双流T2',
    arr: '09:40',
    aap: '武宿T1',
    air: '藏航',
    type: '中型机',
    share: false
  }
];

// 固定线路（AA -> BB），供底部弹框上下滑动选择
const CITY_ROUTES = [
  ['太原', '成都'],
  ['成都', '太原'],
  ['太原', '北京'],
  ['北京', '太原'],
  ['太原', '上海'],
  ['上海', '太原'],
  ['太原', '西安'],
  ['西安', '太原'],
  ['太原', '重庆'],
  ['重庆', '太原'],
  ['成都', '北京'],
  ['北京', '成都'],
  ['成都', '上海'],
  ['上海', '成都'],
  ['成都', '广州'],
  ['广州', '成都'],
  ['西安', '上海'],
  ['上海', '西安'],
  ['重庆', '深圳'],
  ['深圳', '重庆']
];

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function hhmm(t) {
  const p = t.split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

Page({
  data: {
    dates: [],
    outDateIdx: 0,
    retDateIdx: 0,
    from: '太原',
    fromIndex: null,
    to: '孝义',
    toIndex: null,
    outList: [],
    retList: [],
    outSelId: '',
    retSelId: '',
    // 线路弹框
    showRoute: false,
    routes: [],
    // 临近日期推荐（去程列底部）
    nearTip: null,
    startScheduleList: [],
    roundScheduleList: [],
    return_car:[],
    from_car:[]
  },

  onLoad() {
    console.log(this.data.routes)
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dates = [];
    for (let i = 0; i < 4; i++) { // 限制：今天起共 4 天
      const d = new Date(base.getTime() + i * 86400000);
      dates.push({
        idx: i,
        md: pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
        week: WEEK[d.getDay()],
        label: DAY_LABEL[i],
        full: (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEK[d.getDay()]
      });
      
    }
    console.log(dates)
    this.setData({
      dates
    });
    this.rebuild();
    this.getLineList()
  },

  /* ---------- 列表构建 ---------- */
  grom_carType(e) {
    console.log(e.currentTarget.dataset)
    if(e.currentTarget.dataset.items.SeatNum != 0) {
      console.log('进来了')
      this.setData({
        fromIndex:e.currentTarget.dataset.index
      })
    }
    
  },
  to_carType(e) {
    console.log(e.currentTarget.dataset)
    if(e.currentTarget.dataset.items.SeatNum != 0) {
      this.setData({
        toIndex:e.currentTarget.dataset.index
      })
    }
    
  },
  //获取路线列表
  getLineList() {
    wx.showLoading({
      title: '',
    })
    let that = this;
    let params = {}
    if (that.from == '太原') {
      params = {
        startlineId: '300213-96f23d82cea647168541241650c39790',
        roundlineId: '300213-7bc4de5562764200a0610b630859d384'
      }
    } else {
      params = {
        startlineId: '300213-7bc4de5562764200a0610b630859d384',
        roundlineId: '300213-96f23d82cea647168541241650c39790'
      }
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLineRoundTripList',
      data: params,
      method: "GET",
      success: (res) => {
        that.setData({
          roundScheduleList: res.data.data.roundScheduleList,
          startScheduleList: res.data.data.startScheduleList
        })
        wx.hideLoading()
      }
    })
  },
  buildList(kind, dateIdx) {
    const tpl = kind === 'out' ? OUT_TPL : RET_TPL;
    const next = this.data.dates[Math.min(dateIdx + 1, 3)];
    return tpl.map((t, i) => {
      const cross = hhmm(t.arr) < hhmm(t.dep); // 跨天
      return {
        id: kind + '-' + dateIdx + '-' + i,
        dep: t.dep,
        dap: t.dap,
        arr: t.arr,
        aap: t.aap,
        air: t.air,
        type: t.type,
        share: t.share,
        arrDay: cross ? next.md + ' ' + next.week : ''
      };
    });
  },

  rebuild() {
    const outList = this.buildList('out', this.data.outDateIdx);
    const retList = this.buildList('ret', this.data.retDateIdx);
    const patch = {
      outList,
      retList
    };
    // 选中项失效时默认选中第一个
    if (!outList.some(x => x.id === this.data.outSelId)) patch.outSelId = outList.length ? outList[0].id : '';
    if (!retList.some(x => x.id === this.data.retSelId)) patch.retSelId = retList.length ? retList[0].id : '';
    this.setData(patch);
  },

  /* ---------- 日期 ---------- */
  onDateTap(e) {
    let that = this;
    that.setData({
      startScheduleList: [],
      roundScheduleList:[],
      fromIndex:null,
      toIndex:null
    })
    const {
      kind,
      idx
    } = e.currentTarget.dataset;
    const key = kind === 'out' ? 'outDateIdx' : 'retDateIdx';
    this.setData({
      outDateIdx: idx,
      retDateIdx: idx
    }, () => this.rebuild());
    let lineId = ''
    let lineId2 = ''
    if (that.data.from == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
      lineId2 = "300213-7bc4de5562764200a0610b630859d384"
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
      lineId2 = "300213-96f23d82cea647168541241650c39790"
    }
    let params = {
      ReturnLineId:lineId2,
      ArrivalTime: "2026-" + that.data.dates[idx].md + ' 00:00:00',
      lineId: lineId,
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLineTimeList',
      data: params,
      method: "POST",
      success: (res) => {
       
        that.setData({
          startScheduleList: res.data.data.startScheduleList,
          roundScheduleList:res.data.data.roundScheduleList,
        })
        console.log(this.data.startScheduleList)
        console.log(this.data.roundScheduleList)
        wx.hideLoading()
      }
    })
  },
  onDateTap2(e) {
    let that = this;
    that.setData({
      roundScheduleList: [],
      fromIndex:null,
      toIndex:null
    })
    const {
      kind,
      idx
    } = e.currentTarget.dataset;
    const key = kind === 'out' ? 'outDateIdx' : 'retDateIdx';
    this.setData({
      [key]: idx
    }, () => this.rebuild());
    let lineId = ''
    if (that.data.to == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
    }
    let params = {
      GoArrivalTime: "2026-" + that.data.dates[that.data.outDateIdx].md + ' 00:00:00',
      ArrivalTime: "2026-" + that.data.dates[idx].md + ' 00:00:00',
      lineId: lineId,
      IsReturn: false
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLineTimeList',
      data: params,
      method: "POST",
      success: (res) => {
        console.log(res.data.data)
        that.setData({
          roundScheduleList: res.data.data
        })
        wx.hideLoading()
      }
    })
  },
  onCalendar() {
    wx.showToast({
      title: '仅支持今天起 4 天内选择',
      icon: 'none'
    });
  },

  /* ---------- 选航班 ---------- */
  onPick(e) {
    let that = this;
    const {
      item,
      index
    } = e.currentTarget.dataset;
    console.log(item, index)
    console.log(item.DepartureTime)
    if(item.SeatNum == 0) {
      return
    }
    this.setData({
      outSelId: item.DepartureTime,
      from_car:item.PriceList
    })
    that.setData({
      roundScheduleList: [],
      roundScheduleList:[]
    })

    let lineId = ''
    let lineId2 = ''
    if (that.data.to == '太原') {
      lineId = '300213-96f23d82cea647168541241650c39790'
      lineId2="300213-7bc4de5562764200a0610b630859d384"
    } else {
      lineId = '300213-7bc4de5562764200a0610b630859d384'
      lineId2="300213-96f23d82cea647168541241650c39790"
    }
    let params = {
      ArrivalTime: item.DepartureTime,
      lineId: lineId,
      ReturnLineId:lineId2
    }
    wx.request({
      url: baseUrl + '/api/CarPromotion/GetLineTimeList',
      data: params,
      method: "POST",
      success: (res) => {
        console.log(res.data.data)
        that.setData({
          startScheduleList: res.data.data.startScheduleList,
          roundScheduleList:res.data.data.roundScheduleList,
        })
        wx.hideLoading()
      }
    })
  },
  onPick2(e) {
    const {
      item,
      index
    } = e.currentTarget.dataset;
    console.log(item, index)
    this.setData({
      retSelId: item.DepartureTime,
      return_car:item.PriceList
    })
  },
  /* ---------- 线路弹框（固定 AA -> BB 列表，上下滑动） ---------- */
  openRoute() {
    if (this.data.from == '太原') {
      this.setData({
        from: '孝义',
        to: '太原',
        roundScheduleList: [],
        startScheduleList: []
      })
    } else {
      this.setData({
        from: '太原',
        to: '孝义',
        roundScheduleList: [],
        startScheduleList: []
      })
    }
    this.getLineList()
  },
  closeRoute() {
    this.setData({
      showRoute: false
    });
  },
  noop() {},
  chooseRoute(e) {
    console.log(e)
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      line: e.currentTarget.dataset.idx
    })
    const r = this.data.routes[idx];
    this.setData({
      from: r.StatingLocation_City,
      to: r.EndLocation_Name,
      showRoute: false
    });
  },

  /* ---------- 底部 ---------- */
  
  onShareAppMessage() {
    return {
      title: '分享标题',          // 卡片标题，最多28个汉字
      path: '/pages/fancheng/fancheng',  // 点击卡片后进入的页面路径，必须以 / 开头
      imageUrl: '' // 分享图，建议 500x400px，不填则截取当前页面
    }
  },
  onNext() {
    var userinfo = wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
    }
    const a = this.data.dates[this.data.outDateIdx].md
    const b = this.data.dates[this.data.retDateIdx].md
    if(a > b) {
      wx.showToast({
        title: '返程不可早于去程',
        icon: 'none'
      });
      return
    }
    if(this.data.fromIndex == null) {
      wx.showToast({
        title: '请选择去程车型',
        icon: 'none'
      });
      return
    }
    if(this.data.toIndex == null) {
      wx.showToast({
        title: '请选择返程车型',
        icon: 'none'
      });
      return
    }
    let fromCarType = this.data.from_car[this.data.fromIndex].Id
    let returnCarType = this.data.return_car[this.data.toIndex].Id
    wx.navigateTo({
      url: '/pages/fanchengmap/fanchengmap?from=' + this.data.from + '&to=' + this.data.to + "&outSelId=" + this.data.outSelId + '&retSelId=' + this.data.retSelId + '&fromCarType=' + fromCarType + '&returnCarType=' + returnCarType,
    })
  }
})