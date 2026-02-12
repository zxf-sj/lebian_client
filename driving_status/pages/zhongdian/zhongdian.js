import qqmapsdk from '../../../libs/qqMap';
const app = getApp();
Page({
  data: {
    startCity: '',
    value: '',
    address: [],
    pois: null,
    type:"",//start 取件地址 end收件地址
    latitude:'',
    longitude:'',
    scale:15,
    isyun:""
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext("indexMap",this); // 地图组件的id
  },
  onLoad(opt) {
    this.setData({
      type:opt.type,
      isyun:opt.isyun
    });
  },
  onShow() {
    let that = this;
    var item = wx.getStorageSync('lineItme');
    var type = that.data.type;
    if(item){
      if(type=='start'){
        wx.getLocation({
          type: "gcj02",
          isHighAccuracy:true,
          success(res) {
            qqmapsdk.reverseGeocoder({
              location: {
                latitude: res.latitude,
                longitude: res.longitude,
              },
              success: function (res1) {
                let adRes = res1.result;
                if(adRes.address_component.city == item.StatingLocation_Name){
                  that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    startCity:adRes.address_component.city,
                    value:adRes.formatted_addresses.recommend
                  })
                  var starInfo = {};
                  starInfo.startCity = adRes.address_component.city;
                  starInfo.startAddress = adRes.formatted_addresses.recommend;
                  starInfo.startLait = adRes.location.lat;
                  starInfo.startLont = adRes.location.lng;
                  wx.setStorageSync('startInfo',starInfo);
                }else{
                  that.setData({
                    startCity:item.StatingLocation_Name,
                    latitude:item.StatingLocation_Latitude,
                    longitude:item.StatingLocation_Longitude,
                  })
                }
              },
            });
          },
          fail(err) {
            console.log(err);
          }
        })
      }else if(type=='end'){
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: item.EndLocation_Latitude,
            longitude: item.EndLocation_Longitude,
          },
          success: function (res1) {
            let adRes = res1.result;
            that.setData({
              startCity:item.EndLocation_Name,
              latitude:item.EndLocation_Latitude,
              longitude:item.EndLocation_Longitude,
              value:adRes.formatted_addresses.recommend
            })
          },
        });
      }
    }else{
      that.getUserLocation();
    }
  },
  getUserLocation(){
    var _self = this
    wx.getLocation({
      type: "gcj02",
      success(res) {
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: function (res1) {
            let adRes = res1.result;
            console.log(adRes);
            _self.setData({
              latitude: res.latitude,
              longitude: res.longitude,
              startCity:adRes.address_component.city
            })
          },
        });
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  quxiao(){
    this.setData({
      value:"",
      address:[]
    })
  },
  clickAddress(e) {
    let that = this;
    let item = e.currentTarget.dataset.item
    var starInfo = {};
    starInfo.startCity = item.city;
    starInfo.startAddress = item.title;
    starInfo.startLait = item.location.lat;
    starInfo.startLont = item.location.lng;
    wx.setStorageSync('startInfo',starInfo);
    that.setData({
      address:[],
      value:item.title,
      latitude:item.location.lat,
      longitude:item.location.lng,
      scale:18
    })
  },
  searchInputend(e) {
    var _this = this;
    var value = e.detail.value
    if (value) {
      qqmapsdk.getSuggestion({
        keyword: value,
        region: _this.data.isyun==1?_this.data.startCity:'',
        region_fix:_this.data.isyun==1?1:0,
        success: function (res) {
          let data = res.data
          _this.setData({
            address: data,
            value
          })
        }
      })
    } else {
      this.setData({
        address: this.data.pois,
        value: '',
      })
    }
  },
  bindArea(e){
    var area = e.currentTarget.dataset.area;
    let that = this;
    that.setData({
      value:area
    })
    that.searchInputend1(area);
  },
  searchInputend1(area) {
    var _this = this;
    if (area) {
      qqmapsdk.getSuggestion({
        keyword: area,
        region: _this.data.isyun==1?_this.data.startCity:'',
        region_fix:_this.data.isyun==1?1:0,
        policy:1,
        success: function (res) {
          let data = res.data
          _this.setData({
            address: data,
          })
        }
      })
    } else {
      this.setData({
        address:[],
        value: '',
      })
    }
  },
  bindregionchange: function (e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      let that = this;
      var startCity = that.data.startCity;
      var type = that.data.type;
      that.mapCtx.getCenterLocation({
        success: function (res) {
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude,
            },
            success: function (res) {
              let adRes = res.result;
              if(that.data.isyun==1){
                if(startCity!= adRes.address_component.city){
                  if(startCity!= adRes.address_component.district){
                    wx.showToast({
                      title: '该线路没开通',
                      icon:'none'
                    })
                  }else{
                    if(type =='start'){
                      var starInfo = {};
                      starInfo.startCity = startCity;
                      starInfo.startAddress = adRes.formatted_addresses.recommend;
                      starInfo.startLait = adRes.location.lat;
                      starInfo.startLont = adRes.location.lng;
                      wx.setStorageSync('startInfo',starInfo);
                    }else if(type=="end"){
                      var endInfo = {};
                      endInfo.endCity = startCity;
                      endInfo.endAddress = adRes.formatted_addresses.recommend;
                      endInfo.endLati = adRes.location.lat;
                      endInfo.endLong = adRes.location.lng;
                      wx.setStorageSync('endInfo',endInfo);
                    }
                    that.setData({
                      value:adRes.formatted_addresses.recommend
                    })
                  }
                }else{
                  var starInfo = {};
                  starInfo.startCity = startCity;
                  starInfo.startAddress = adRes.formatted_addresses.recommend;
                  starInfo.startLait = adRes.location.lat;
                  starInfo.startLont = adRes.location.lng;
                  wx.setStorageSync('startInfo',starInfo);
                  that.setData({
                    value:adRes.formatted_addresses.recommend
                  })
                }
              }else{
                if(type =="start"){
                  var starInfo = {};
                  starInfo.startCity = startCity;
                  starInfo.startAddress = adRes.formatted_addresses.recommend;
                  starInfo.startLait = adRes.location.lat;
                  starInfo.startLont = adRes.location.lng;
                  wx.setStorageSync('startInfo',starInfo);
                }else if(type =="end"){
                  var endInfo = {};
                  endInfo.endCity = startCity;
                  endInfo.endAddress = adRes.formatted_addresses.recommend;
                  endInfo.endLati = adRes.location.lat;
                  endInfo.endLong = adRes.location.lng;
                  wx.setStorageSync('endInfo',endInfo);
                }
                that.setData({
                  value:adRes.formatted_addresses.recommend
                })
              }
            },
          });
        }
      })
    }
  },
  checkOk(){
    var type = this.data.type;
    var startInfo = wx.getStorageSync('startInfo');
    var endInfo = wx.getStorageSync('endInfo');
    if(type=='start'){
      if(startInfo.startAddress==""){
        wx.showToast({
          title: '请选择取件地址',
          icon:'none'
        })
        return false;
      }
    }else if(type == 'end'){
      if(endInfo.startAddress==""){
        wx.showToast({
          title: '请选择取件地址',
          icon:'none'
        })
        return false;
      }
    }
    wx.navigateTo({
      url: '/driving_status/pages/beforeOrder/beforeOrder',
    })
    
  },
  //切换城市
  chooseCity() {
    if(this.data.fixedLine){
      wx.navigateTo({
        url: "/pages/searchCity/searchCity?urlFrom=1&type=fixedLine",
      })
    }else{
      wx.navigateTo({
        url: "/pages/searchCity/searchCity?urlFrom=1",
      })
    }
  },
    // clickAddress(e) {
  //   let item = e.currentTarget.dataset.item
  //   let pages = getCurrentPages();
  //   let prevPages = pages[pages.length-2];
  //   if (this.data.fixedLine) {
  //     app.globalData.startCity = item.city;
  //     app.globalData.lineStartAddress = item.title;
  //     app.globalData.lineStartLat = item.location.lat;
  //     app.globalData.lineStartLng = item.location.lng;
  //     prevPages.setData({
  //       fromStartDetail:true,
  //       fromEndDetail:false,
  //       lineAdcode:item.adcode
  //     })
  //     wx.navigateBack({
  //       delta: 1
  //     })
  //   } else if(this.data.exclusiveCar){
  //     app.globalData.EXCStartAddress = item.title;
  //     app.globalData.EXCStartLat = item.location.lat;
  //     app.globalData.EXCStartLng = item.location.lng;
  //     prevPages.setData({
  //       strAddress: item.title,
  //       lat: item.location.lat,
  //       lng: item.location.lng,
  //       lineAdcode:item.adcode
  //     })
  //     prevPages.checkStartAddress();
  //           wx.redirectTo({
  //       url: '/pages/confirmCall/confirmCall',
  //     })
  //   } else {
  //     app.globalData.startCity = item.city;
  //     app.globalData.strAddress = item.title;
  //     app.globalData.strLatitude = item.location.lat;
  //     app.globalData.strLongitude = item.location.lng;
  //     const pageSize = getCurrentPages().length;
  //     console.log(pageSize);
  //     if(wx.getStorageSync('goType')=='bendi'){
  //       if(pageSize<=3){
  //         wx.navigateBack({
  //           delta: 1
  //         })
  //       }else if(pageSize>=4){
  //         wx.redirectTo({
  //           url: '/pages/confirmCall/confirmCall',
  //         })
  //       }
  //     }else{
  //       if(pageSize<=4){
  //         wx.navigateBack({
  //           delta: 1
  //         })
  //       }else if(pageSize>=5){
  //         wx.redirectTo({
  //           url: '/pages/confirmCall/confirmCall',
  //         })
  //       }
  //     }
  //   }
  // },
})