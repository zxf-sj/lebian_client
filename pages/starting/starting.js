//import qqmapsdk from '../../libs/qqMap';
// var bmap = require('../../libs/bmap-wx.min');
var bmap =  require("../../libs/bmap-wx");
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
 
  },
  onLoad(opt) {
    let that = this;
    //that.searchNearby();
    // that.getMyLocation()

    that.setData({
      type:opt.type,
      isyun:opt.isyun
    })
  },
  onShow() {
    
    var item = wx.getStorageSync('lineItme');

    let that = this;
    var BMap = new bmap.BMapWX({
      // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      key:'FD2Wvwuq8uRaFgheLXBn13U'
    });
    if(item){
      var BMap = new bmap.BMapWX({
        // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
        key:'FD2Wvwuq8uRaFgheLXBn13U'
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
        
        } 
      });  
    
    }else{
      that.getUserLocation();
    }
  },
    //定位当前位置
    getMyLocation() {
      var _self = this;
      var BMap = new bmap.BMapWX({
        // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
        key:'FD2Wvwuq8uRaFgheLXBn13U'
      });
      BMap.regeocoding({  
        success:function(res){
          var data = res.wxMarkerData[0];
 
          _self.setData({
            latitude: data.latitude,
            longitude: data.longitude
          })
        } 
      });  
    
    },
  getUserLocation(){
    var _self = this;
    var BMap = new bmap.BMapWX({
      // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      key:'FD2Wvwuq8uRaFgheLXBn13U'
    });
    BMap.regeocoding({  
      success:function(res){
        var data = res.wxMarkerData[0];
        console.log('逆地理编码3',data.latitude + ',' + data.longitude)
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
        // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
        key:'FD2Wvwuq8uRaFgheLXBn13U'

      });
   
      BMap.suggestion({
        "query":value,
        region: _this.data.startCity,
        city_limit: false,
        location:true,
        ret_coordtype:'BD09ll',
        success:function(res){
     
          let data = res.result
      
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
        // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
        key:'FD2Wvwuq8uRaFgheLXBn13U'
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
      // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      key:'FD2Wvwuq8uRaFgheLXBn13U'
    });
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      let that = this;
      var startCity = that.data.startCity;
      that.mapCtx.getCenterLocation({
        success: function (res) {
          console.log('逆地理编码4',res.latitude + ',' + res.longitude)
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

    wx.request({
      url:baseUrl + '/api/MapWebApi/GeoConv',
      data:{
        LatLngs:requests,
        Model:1,
      },
      method:"POST",
      success:(res)=>{
    
        let starInfo = {}
        starInfo.startAddress = startInfo.startAddress
        starInfo.startCity = startInfo.startCity
        starInfo.startLait = res.data.data[0].Item1
        starInfo.startLont = res.data.data[0].Item2
    
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
 
})