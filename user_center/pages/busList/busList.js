// user_center/pages/busList/busList.js
// pages/bus-list/bus-list.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({
  data: {
    currentDateIndex: 2, // 默认选中第3个（后天）
    dateList: [], // 日期数据
    busList: [], // 车次列表数据

    // 分页加载相关
    page: 1,
    isLoading: false,
    hasMore: true,
    startId: null, // 起点ID
    endId: null, // 终点ID
    startName: '', // 起点名称（用于UI展示）
    endName: '', // 终点名称（用于UI展示）,
    // 用于动态绑定的状态列表
    stationStatus: [],
    onLoadBusDay: '',
    busDay: '',
    buslineId: '',
    startingStation: null, //起始站
    terminal: null
  },

  onLoad(e) {
    let busDay = e.busDay.split('-')
    this.setData({
      onLoadBusDay: busDay[1] + '/' + busDay[2],
      busDay: e.busDay,
      buslineId: e.LineId
    })
    this.initDates();
    this.getBusList(true); // 初始加载第一页
  },
  onShow() {

  },
  handleStart(e) {
    const {
      dindex,
      sindex
    } = e.currentTarget.dataset;
    const key = `busList[${dindex}].StartSiteList`;
    const list = this.data.busList[dindex].StartSiteList;

    const newList = list.map((item, i) => ({
      ...item,
      type: i === sindex // 点击的设为 true，其余 false
    }));
    let startingStation = newList.filter(item => item.type === true)
    this.setData({
      [key]: newList,
      startingStation: startingStation[0]
    });
  },
  handleEnd(e) {
    const {
      dindex,
      eindex
    } = e.currentTarget.dataset;
    const key = `busList[${dindex}].EndSiteList`;
    const list = this.data.busList[dindex].EndSiteList;
    const newList = list.map((item, i) => ({
      ...item,
      type: i === eindex // 点击的设为 true，其余 false
    }));
    let terminal = newList.filter(item => item.type === true)
    this.setData({
      [key]: newList,
      terminal: terminal[0]
    });
  },

  // 1. 初始化未来7天的日期
  initDates() {
    let _this = this;
    const dates = [];
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      let weekText = i === 0 ? '今天' : (i === 1 ? '明天' : weekDays[d.getDay()]);
      if (_this.data.onLoadBusDay == `${month}/${day}`) {
        _this.setData({
          currentDateIndex: i
        })
      }
      dates.push({
        id: i,
        date: `${month}/${day}`,
        week: weekText
      });
    }
    this.setData({
      dateList: dates
    });
  },

  // 2. 切换日期
  selectDate(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentDateIndex: index
    });
    // 切换日期后，重置列表并重新请求第一页
    this.getBusList(true);
  },

  // 3. 获取车次列表（模拟接口）
  getBusList(isReset = false) {
    let _this = this;
    wx.request({
      url: baseUrl + "/api/BusMobile/GetBusTimeList",
      data: {
        lineId: Number(_this.data.buslineId),
        today: _this.data.busDay,
      },
      method: "GET",
      success: (res) => {
        if (res.data.code == 0) {
          let list = res.data.data
          list.forEach(item => {
            item.StartSiteList.forEach(s => {
              s.type = false;
            });
            item.EndSiteList.forEach(e => {
              e.type = false;
            });
          })
          this.setData({
            busList: list,
          });
        }
      },
    });


  },

  // 4. 展开/隐藏途经站点
  toggleVia(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.busList;
    const item = list.find(item => item.Id === id);
    if (item) {
      item.showVia = !item.showVia; // 切换状态
      this.setData({
        busList: list
      });
    }
  },
  handleReservation(e) {
    const id = e.currentTarget.dataset.id;
    const time = e.currentTarget.dataset.time;
    let _this = this;
    if (_this.data.startingStation === null && _this.data.terminal === null) {
      const list = _this.data.busList;
      const item = list.find(item => item.Id === id);
      if (item) {
        item.showVia = true; // 切换状态
        _this.setData({
          busList: list
        });
      }
      wx.showToast({
        title: '请选择上车点、下车点',
        icon: 'none',
        duration: 2000
      })
    } else if (_this.data.startingStation === null && _this.data.terminal !== null) {
      wx.showToast({
        title: '请选择上车点',
        icon: 'none',
        duration: 2000
      })
    } else if (_this.data.startingStation !== null && _this.data.terminal === null) {
      wx.showToast({
        title: '请选择下车点',
        icon: 'none',
        duration: 2000
      })
    } else if (_this.data.startingStation !== null && _this.data.terminal !== null) {
      console.log(JSON.stringify(_this.data.startingStation))
      wx.navigateTo({
        url: '/user_center/pages/busOrder/busOrder?startingStation=' + JSON.stringify(_this.data.startingStation) + "&terminal=" + JSON.stringify(_this.data.terminal) + "&busDay=" + _this.data.busDay + "&buslineId=" + _this.data.buslineId + "&time=" + time + "&id=" + id,
      })
    }

  },
  // 5. 上拉加载更多
  loadMore() {
    console.log('触发上拉加载');
    this.getBusList(false);
  }
})