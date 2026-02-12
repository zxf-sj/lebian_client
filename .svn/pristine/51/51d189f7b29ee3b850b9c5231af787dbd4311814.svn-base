//import qqmapsdk from '../../libs/qqMap';
var bmap = require('../../libs/bmap-wx.min');
const debounce = require('../../utils/debounce');
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url


const app = getApp();
Page({
  data: {
    startCity: '',
    value: '',
    address: [],
    pois: null,
    // fixedLine: false,
    // exclusiveCar: false,
    type:"",//pc 拼车 dx独享 选完地址后返回页面
    latitude:'',
    longitude:'',
    scale:15,
    isyun:""
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext("indexMap",this); // 地图组件的id
    console.log(this.mapCtx)
  },
  onLoad(opt) {
    let that = this;
    //that.searchNearby();
    // that.getMyLocation()
    console.log("传进来的值",opt)
    that.setData({
      type:opt.type,
      isyun:opt.isyun
    })
  },
  onShow() {
    
    var item = wx.getStorageSync('lineItme');
    console.log(item)
    let that = this;
    var BMap = new bmap.BMapWX({
      ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
    });
    if(item){
      var BMap = new bmap.BMapWX({
        ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      });
      BMap.regeocoding({  
        success:function(res){
          var data = res.wxMarkerData[0];
          BMap.regeocoding({
            success: function (res1) {
              let adRes = res1.originalData.result;
              if(adRes.addressComponent.city == item.StatingLocation_Name){
                  that.setData({
                      latitude: data.latitude,
                      longitude: data.longitude,
                      startCity:adRes.addressComponent.city,
                      value:adRes.formatted_address
                  })
                  var starInfo = {};
                  starInfo.startCity = adRes.addressComponent.city;
                  starInfo.startAddress = adRes.formatted_address;
                  starInfo.startLait = adRes.location.lat;
                  starInfo.startLont = adRes.location.lng;
                  wx.setStorageSync('startInfo',starInfo);
              }else{
                that.setData({
                  startCity:item.StatingLocation_Name,
                  latitude:item.StatingLocation_Latitude,
                  longitude:item.StatingLocation_Longitude
                })
              }  
            },
            fail: function () {
                wx.showToast({
                    title: '请检查位置服务是否开启',
                })
            },
          });
          // qqmapsdk.reverseGeocoder({
          //   location: {
          //     latitude: res.latitude,
          //     longitude: res.longitude,
          //   },
          //   success: function (res1) {
          //     let adRes = res1.result;
          //     if(adRes.address_component.city == item.StatingLocation_Name){
          //       that.setData({
          //         latitude: res.latitude,
          //         longitude: res.longitude,
          //         startCity:adRes.address_component.city,
          //         value:adRes.formatted_addresses.recommend
          //       })
          //       var starInfo = {};
          //       starInfo.startCity = adRes.address_component.city;
          //       starInfo.startAddress = adRes.formatted_addresses.recommend;
          //       starInfo.startLait = adRes.location.lat;
          //       starInfo.startLont = adRes.location.lng;
          //       wx.setStorageSync('startInfo',starInfo);
          //     }else{
          //       that.setData({
          //         startCity:item.StatingLocation_Name,
          //         latitude:item.StatingLocation_Latitude,
          //         longitude:item.StatingLocation_Longitude
          //       })
          //     }
          //   },
          // });
        } 
      });  
      // wx.getLocation({
      //   type: "wgs84",
      //   isHighAccuracy:true,
      //   success(res) {
          
      //   },
      //   fail(err) {
      //     console.log(err);
      //   }
      // })
    }else{
      that.getUserLocation();
    }
  },
    //定位当前位置
    getMyLocation() {
      var _self = this;
      var BMap = new bmap.BMapWX({
        ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      });
      BMap.regeocoding({  
        success:function(res){
          var data = res.wxMarkerData[0];
          console.log('起点当前位置',data)
          _self.setData({
            latitude: data.latitude,
            longitude: data.longitude
          })
        } 
      });  
      // wx.getLocation({
      //   type: "gcj02",
      //   success(res) {
      //     _self.setData({
      //       latitude: res.latitude,
      //       longitude: res.longitude
      //     })
      //   },
      //   fail(err) {
      //     console.log(err);
      //   }
      // })
    },
  getUserLocation(){
    var _self = this;
    var BMap = new bmap.BMapWX({
      ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
    });
    BMap.regeocoding({  
      success:function(res){
        var data = res.wxMarkerData[0];
        
        BMap.regeocoding({
          location: data.latitude + ',' + data.longitude,
          success: function (res1) {
            let adRes = res1.originalData.result;
            _self.setData({
              latitude: adRes.location.latitude,
              longitude: adRes.location.longitude,
              startCity:adRes.addressComponent.city
            })
          }
        }) 
      } 
    });  
    // wx.getLocation({
    //   type: "wgs84",
    //   success(res) {
           
    //     // qqmapsdk.reverseGeocoder({
    //     //   location: {
    //     //     latitude: res.latitude,
    //     //     longitude: res.longitude,
    //     //   },
    //     //   success: function (res1) {
    //     //     let adRes = res1.result;
    //     //     console.log(adRes);
    //     //     _self.setData({
    //     //       latitude: res.latitude,
    //     //       longitude: res.longitude,
    //     //       startCity:adRes.address_component.city
    //     //     })
    //     //   },
    //     // });
    //   },
    //   fail(err) {
    //     console.log(err);
    //   }
    // })
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
    var start = wx.getStorageSync('startInfo');
    starInfo.startCity = start.startCity;
    starInfo.startAddress = item.address;
    starInfo.startLait = item.location.lat;
    starInfo.startLont = item.location.lng;
    wx.setStorageSync('startInfo',starInfo);
    that.setData({
      address:[],
      value:item.name,
      latitude:item.location.lat,
      longitude:item.location.lng,
      scale:18
    })
  },
  // searchNearby() {
  //   let _this = this;
  //   var item = wx.getStorageSync('lineItem'); 
  //   qqmapsdk.reverseGeocoder({
  //     location: item.StatingLocation_Latitude + ',' + item.StatingLocation_Longitude,
  //     get_poi: 1,
  //     success(res) {
  //       let pois = res.result.pois;
  //       _this.setData({
  //         address: pois,
  //         pois
  //       })
  //     }
  //   })
  // },
 
  // 输入框防抖处理（延迟执行）
  searchInputend: debounce(function(e) {
    console.log('进来了',e)
    var _this = this;
    var value = e.detail.value;
    if (value) {
      // qqmapsdk.getSuggestion({
      //   keyword: value,
      //   region: _this.data.isyun==1?_this.data.startCity:'',
      //   region_fix:_this.data.isyun==1?1:0,
      //   success: function (res) {
      //     let data = res.data
      //     _this.setData({
      //       address: data,
      //       value
      //     })
      //   }
      // })
     
      var BMap = new bmap.BMapWX({
        ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
        // ak:'RlQQ4K0R29zc4SDtMUOtps9XfTrCzZ1X'
      });
      console.log(_this.data.endCity)
      BMap.suggestion({
        "query":value,
        region: _this.data.startCity,
        city_limit: false,
        location:true,
        ret_coordtype:'BD09ll',
        success:function(res){
          // console.log(res)
          // var zuobiao = geoconv(res.result[0].location.lat,res.result[0].location.lng)
          // console.log('zuobiao',zuobiao)
          let data = res.result
          console.log(data)
          _this.setData({
            address: data,
            value
          })
        }
      });
    } else {
      this.setData({
        address: this.data.pois,
        value: '',
      })
    }
  },500),
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
      // qqmapsdk.getSuggestion({
      //   keyword: area,
      //   region: _this.data.isyun==1?_this.data.startCity:'',
      //   region_fix:_this.data.isyun==1?1:0,
      //   policy:1,
      //   success: function (res) {
      //     let data = res.data
      //     _this.setData({
      //       address: data,
      //     })
      //   }
      // })
      var BMap = new bmap.BMapWX({
        ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      });
      BMap.suggestion({
        "query":area,
        region: _this.data.startCity,
        city_limit: true,
        location:true,
        page_size: 10,
        scope: 1, 
        success:function(res){
          let data = res.result
          _this.setData({
            address: data,
          })
        }
      });
    } else {
      this.setData({
        address:[],
        value: '',
      })
    }
  },
  bindregionchange: function (e) {
    var BMap = new bmap.BMapWX({
      ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
    });
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      let that = this;
      var startCity = that.data.startCity;
      that.mapCtx.getCenterLocation({
        success: function (res) {
          BMap.regeocoding({
            location: res.latitude + ',' + res.longitude,
            success: function (res1) {
              let adRes = res1.originalData.result;
              if(that.data.isyun==1){
                if(startCity!= adRes.addressComponent.city){
                  if(startCity!= adRes.addressComponent.district){
                    wx.showToast({
                      title: '该线路没开通',
                      icon:'none'
                    })
                  }else{
                    var starInfo = {};
                    starInfo.startCity = startCity;
                    starInfo.startAddress = adRes.formatted_address;
                    starInfo.startLait = adRes.location.lat;
                    starInfo.startLont = adRes.location.lng;
                    wx.setStorageSync('startInfo',starInfo);
                    that.setData({
                      value:adRes.formatted_address
                    })
                  }
                }else{
                  var starInfo = {};
                  starInfo.startCity = startCity;
                  starInfo.startAddress = adRes.fformatted_address;
                  starInfo.startLait = adRes.location.lat;
                  starInfo.startLont = adRes.location.lng;
                  wx.setStorageSync('startInfo',starInfo);
                  that.setData({
                    value:adRes.formatted_address
                  })
                }
              }else{
                var starInfo = {};
                starInfo.startCity = startCity;
                starInfo.startAddress = adRes.formatted_address;
                starInfo.startLait = adRes.location.lat;
                starInfo.startLont = adRes.location.lng;
                wx.setStorageSync('startInfo',starInfo);
                that.setData({
                  value:adRes.formatted_address
                })
              }
            },
            fail: function () {
                wx.showToast({
                    title: '请检查位置服务是否开启',
                })
            },
          });
          // qqmapsdk.reverseGeocoder({
          //   location: {
          //     latitude: res.latitude,
          //     longitude: res.longitude,
          //   },
          //   success: function (res) {
          //     let adRes = res.result;
          //     console.log(1111,adRes)
          //     if(that.data.isyun==1){
          //       if(startCity!= adRes.address_component.city){
          //         if(startCity!= adRes.address_component.district){
          //           wx.showToast({
          //             title: '该线路没开通',
          //             icon:'none'
          //           })
          //         }else{
          //           var starInfo = {};
          //           starInfo.startCity = startCity;
          //           starInfo.startAddress = adRes.formatted_addresses.recommend;
          //           starInfo.startLait = adRes.location.lat;
          //           starInfo.startLont = adRes.location.lng;
          //           wx.setStorageSync('startInfo',starInfo);
          //           that.setData({
          //             value:adRes.formatted_addresses.recommend
          //           })
          //         }
          //       }else{
          //         var starInfo = {};
          //         starInfo.startCity = startCity;
          //         starInfo.startAddress = adRes.formatted_addresses.recommend;
          //         starInfo.startLait = adRes.location.lat;
          //         starInfo.startLont = adRes.location.lng;
          //         wx.setStorageSync('startInfo',starInfo);
          //         that.setData({
          //           value:adRes.formatted_addresses.recommend
          //         })
          //       }
          //     }else{
          //       var starInfo = {};
          //       starInfo.startCity = startCity;
          //       starInfo.startAddress = adRes.formatted_addresses.recommend;
          //       starInfo.startLait = adRes.location.lat;
          //       starInfo.startLont = adRes.location.lng;
          //       wx.setStorageSync('startInfo',starInfo);
          //       that.setData({
          //         value:adRes.formatted_addresses.recommend
          //       })
          //     }
          //   },
          // });
        }
      })
    }
  },
  async checkOk(){
    var type = this.data.type;
    var startInfo = wx.getStorageSync('startInfo');
    if(startInfo.startAddress==""){
      wx.showToast({
        title: '请选择乘车地点',
        icon:'none'
      })
      return false;
    }
    let requests =startInfo.startLont + "," +  startInfo.startLait;
    console.log('转前的坐标',requests)
    wx.request({
      url:baseUrl + '/api/MapWebApi/GeoConv',
      data:{
        LatLngs:requests,
        Model:1,
      },
      method:"POST",
      success:(res)=>{
        console.log(res)
        let starInfo = {}
        starInfo.startAddress = startInfo.startAddress
        starInfo.startCity = startInfo.startCity
        starInfo.startLait = res.data.data[0].Item1
        starInfo.startLont = res.data.data[0].Item2
        console.log('转后的坐标',starInfo)
        wx.setStorageSync('startInfo',starInfo);
        if(type=='pc'){
      
          wx.reLaunch({
            url: '/pages/pingche/pingche',
          })
        }else{
          wx.reLaunch({
            url: '/pages/duxiang/duxiang',
          })
        }
      }
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