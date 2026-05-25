import qqmapsdk from '../../../libs/qqMap';
import http from '../../../utils/http';
const app = getApp();
Page({
  data: {
    endCity: '',
    endDistrict:"",
    value: '',
    latitude:'',
    longitude:'',
    address:[],
    scale:18,
    orderId:"",
    destination:"",//下车点
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext("indexMap"); // 地图组件的id
  },
  onLoad(opt) {
    var orderId = opt.orderId;
    this.setData({
      orderId:orderId
    })
    this.getOrderInfo(orderId);
  },
  getOrderInfo(orderId){
    http.getRequest('/Api/DispatchMobile/GetInfo?detailClass=300216&JoinCode=RideTicketId&id='+orderId, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        let that = this;
        var mks = {};
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.data.OffLatitude,
            longitude: res.data.OffLongitude,
          },
          success: function (res1) {
            that.setData({
              endCity:res1.result.address_component.city,
              latitude:res.data.OffLatitude,
              longitude:res.data.OffLongitude,
              endDistrict:res1.result.address_component.district,
            })
          }
        })  
      }
    }, err => {
      console.log(err)
    })
  },
  onShow() {
  },
  searchNearby() {
    let _this = this;
    _this.setData({
      latitude: wx.getStorageSync('endlati'),
      longitude:wx.getStorageSync('endlong'),
      endCity:wx.getStorageSync('endCity'),
      scale:18,
    })
  },
  bindregionchange: function (e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      let _this = this;
      this.mapCtx.getCenterLocation({
        success: function (res) {
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude,
            },
            success: function (res) {
              let adRes = res.result;
              console.log(adRes.address_component.city, adRes.address_component.district);
              var endcity = _this.data.endCity;
              var endDistrict = _this.data.endDistrict
              if(endcity!= adRes.address_component.city){
                if(endDistrict!= adRes.address_component.district){
                  wx.showToast({
                    title: '该线路没开通',
                    icon:'none'
                  })
                }else{
                  _this.setData({
                    latitude: adRes.location.lat,
                    longitude: adRes.location.lng,
                    destination:adRes.formatted_addresses.recommend,
                    value:adRes.formatted_addresses.recommend,
                  })
                }
              }else{
                _this.setData({
                  latitude: adRes.location.lat,
                  longitude: adRes.location.lng,
                  destination:adRes.formatted_addresses.recommend,
                  value:adRes.formatted_addresses.recommend,
                })
              }
            },
          });
        }
      })
    }
  },
  searchInputend(e) {
    var _this = this;
    var value = e.detail.value
    if (value) {
      qqmapsdk.getSuggestion({
        keyword: value,
        region: _this.data.endCity,
        region_fix:1,
        policy:1,
        success: function (res) {
          let data = res.data
          console.log(res);
          _this.setData({
            address: data,
            value
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
        region: _this.data.endCity,
        region_fix:1,
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
  searchCancel(){
    this.setData({
      value:'',
      address:[]
    })
  },
  clickAddress(e) {
    let that = this;
    let data = e.currentTarget.dataset.item
    console.log(data);
    that.setData({
      latitude:data.location.lat,
      longitude:data.location.lng,
      address:[],
      scale:18,
      destination:data.title,
      value:data.title
    })
  },
  checkOk() {
    let that = this;
    that.setSubscribeMessage();
  },
  setSubscribeMessage:function(){
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['AT2i9ujhwrXi7YEwn3ap67AgShLhvtADRyiHgtT0FQI',"UaTNW8OXfZWCQiH0Da6Z2lE7J9nY6B-XD2_GvXoUnh8"],
      success(res) {
        if (res['AT2i9ujhwrXi7YEwn3ap67AgShLhvtADRyiHgtT0FQI'] === 'accept') {
          if(that.data.destination==""){
            wx.showToast({
              title: '请选择下车的地点',
              icon:'none'
            })
          }
          http.getRequest('/Api/DispatchMobile/RideTicketOrderChangeLocation?orderId='+that.data.orderId+"&NewOffLongitude="+that.data.longitude+"&NewOffLatitude="+that.data.latitude+"&NewOffLocation="+that.data.destination,'', wx.getStorageSync('header'), res => {
            if(res.code==0){
              wx.showToast({
                title: '提交成功工,等待管理员审核',
                icon:'none',
                destination:2000,
                success:function(){
                  setTimeout(function(){
                    wx.navigateBack({
                      delta: 1
                    })
                  },5000)
                }
              })
            }
          }, err => {
            console.log(err)
          })
        } else {
          wx.showModal({
            title: '订阅消息',
            content: '您当前拒绝接受消息通知，是否去开启',
            confirmText: '开启授权',
            confirmColor: '#345391',
            cancelText: '仍然拒绝',
            cancelColor: '#999999',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting);
                  },
                  fail(err) {
                    //失败
                    console.log(err);
                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        }
      },
      fail(err) {
        console.log('请求订阅消息权限失败：', err);
      }
    });
  },
})