// pages/lineList/lineList.js
import http from '../../utils/http';
const app = getApp();
Page({
  data: {
    list: null,
    from: '',
    currentCity:'',
  },

  onLoad: function (options) {
    console.log(options)
    this.setData({
      currentCity: app.globalData.lineStartCity
    })
    if (options.from === 'startLine' && options.startList) {
      this.setData({
        list: JSON.parse(options.startList),
        from: 'startLine'
      })
    } else if (options.from === 'endLine' && options.startId) {
      this.setData({
        from: 'endLine'
      })

      // 请求终点线路列表
      http.postRequest('/v2/passenger/remote/getRemoteEndStationListByStartStationId?stationId='+options.startId, '', wx.getStorageSync('header'), res => {
        this.setData({
          list: res.content
        })
      }, err => {
        console.log(err)
      })
    }

  },

  onShow(){

  },

  chooseStation(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)

    let pages = getCurrentPages();
    let prevPages = pages[pages.length-2];
    if(this.data.from === 'startLine'){
      prevPages.setData({
        lineStartItem:item,
        lineEndItem:null,
        strContract:false,
        endContract:false,
      })
      app.globalData.startCity = '';
      app.globalData.lineStartAddress = '';
      app.globalData.lineStartLat = '';
      app.globalData.lineStartLng = '';
    }else if(this.data.from === 'endLine'){
      prevPages.setData({
        lineEndItem:item,
        lineCarIcon:item.stationType,
        endContract:false,
        hasChooseLineTime:false,
        d40 : new Date().getTime() + 2400000
      })
      app.globalData.destinationCity = '';
      app.globalData.lineStartAddress = '';
      app.globalData.lineEndAddress = '';
      app.globalData.lineEndLat = '';
      app.globalData.lineEndLng = '';
    }
    wx.navigateBack({
      delta:1
    })
  },
})