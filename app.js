const BASE_URL = require("./utils/BASE_URL");
var http = require('./utils/httpLogin');
var httpReq = require('./utils/httpLogin'); 

App({

  onLaunch(){
    this.hasUpdate();
  },
  onShow() {
    // var clientDriving=this.globalData.clientDriving
    // if (wx.getStorageSync('token')) {
    //   if(!clientDriving){
    //     this.mqttConfig();
    //   }
    // }
  },

  onHide() {
    // console.log('App onHide')
    // if (this.globalData.clientDriving) {
    //   this.globalData.clientDriving.end();
    //   this.globalData.clientDriving=null;
    // }
  },

  globalData: {
    originCity: '', //定位城市
    originAddress: '', //定位地址
    originLongitude: 0, //定位经度
    originLatitude: 0, //定位纬度
    startCity: '', //起点市
    startCityAdcode: '', //起点区域代码
    strAddress: '', //选择的起点
    strLatitude: "", //起点纬度 
    strLongitude:"", //起点经度
    destinationCity: '', //终点地市
    destination: '', //终点地址
    endLatitude: 0, //终点纬度 
    endLongitude: 0, //终点经度
    clientDriving: null,
    friendDriver: null,
    nowOrFutureId: null,
    friendStartDate: null,
    scanDriverId: null,
    reqNotice: true,
    couponModal: false,
    lineCityCode: '',
    lineStartCity: '',
    lineStartAddress: '',
    lineStartLat: 0,
    lineStartLng: 0,
    lineEndAddress: '',
    lineEndLat: 0,
    lineEndLng: 0,
    exclusiveCarCityCode: '',
    exclusiveCarStartCity: '',
    hideCityNoService: true,
    // httpsUrl:'https://www.qierchuxing.com',//线上环境
    httpsUrl:'https://qece.lebianjia.com',//测试环境
    // httpsUrl:'https://www.lebianjia.com',//新线上环境
    
    companyCode:'CP20240001',//贝壳
    //companyCode:'CP20247684',//科华
    formIdType:"200015-131fa56a8be843caae3dbc8daa9db83e",//贝壳
    //formIdType:"200015-1ebbb231b2ab40e28273dedb2f35dbb0"//科华
  },
  eventCenter: {
    events: {},
    on(event, callback) {
      this.events[event] = callback
    },
    emit(event, data) {
      this.events[event]?.(data)
    }
  },
  eventVersion: {
    events: {},
    on(event, callback) {
      this.events[event] = callback
    },
    emit(event, data) {
      this.events[event]?.(data)
    }
  },
  /**
   * API：connect([url], options)
   * description：连接到由给定的url和options
   */
  mqttConfig() {
    // const options = {
    //   clientId: wx.getStorageSync('uuid') ? 'mini_' + wx.getStorageSync('uuid') + '_' +new Date().getTime() : 'mini_' + Math.random().toString(16).substr(2, 8),
    //   keepalive: 60,
    //   reschedulePings: true,
    //   protocolId: 'MQTT',
    //   protocolVersion: 4,
    //   reconnectPeriod: 1000,
    //   connectTimeout: 30 * 1000,
    //   clean: true,
    //   resubscribe: true,
    //   username: wx.getStorageSync('uuid') ? `mini_p_${wx.getStorageSync('uuid')}` : `admin`,
    //   password: wx.getStorageSync('token') || 'password',
    // }
    // if(options.username === 'admin'){
    //   wx.clearStorageSync()
    // }
    // console.log(options.clientId,options.username,options.password)

    //  const host = 'wss://www.qierchuxing.com/mqtt'; // 开发

    // this.globalData.pubTopic = wx.getStorageSync('uuid') ? `mini/event/mini_p_${wx.getStorageSync('uuid')}` : `mini/event/mini_p_${this.globalData.uuid}` //发布消息主题，数据类型为String
    // this.globalData.clientDriving = mqtt.connect(host, options);

    // this.globalData.clientDriving.on('reconnect', (error) => {
    //   console.log('正在重连...111')
    // })

    // this.globalData.clientDriving.subscribe(this.globalData.pubTopic, (err, granted) => {
    //   console.log('订阅成功in app')
    // })
  },

  hasUpdate() {
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
})