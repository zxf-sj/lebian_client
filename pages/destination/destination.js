import qqmapsdk from '../../libs/qqMap';
import http from '../../utils/http';
const app = getApp();
Page({
  data: {
    destinationCity: '', //目的地城市
    value: '',
    usedLocation: null,
    historyLocation: false,
    home: null,
    company: null,
    clickToIndex: false,
    pois: null,
    allAddress: null,
    fixedLine: false,
    address: [],
    iskai:1,
    loading:false,
    noMore:false,
    page:1,
  },
  onLoad(opt) {
    let that = this;
    that.setData({
      loading:true,
      noMore:false
    })
    that.getXianluList();
  },
  onShow() {
    this.setData({
      destinationCity: app.globalData.destinationCity || app.globalData.originCity
    })
  },
  clickAddress(e) {
    let data = e.currentTarget.dataset.item;
    qqmapsdk.reverseGeocoder({
      location: data.EndLocation_Latitude + ',' + data.EndLocation_Longitude,
      success(res) {
        var area = res.result.address_component.district;
        if(area.search("县") != -1 || area.search("市") != -1){
          wx.setStorageSync('endCity',res.result.address_component.district);
        }else{
          wx.setStorageSync('endCity',res.result.address_component.city);
        }
        wx.setStorageSync('line_id', data.Id);
        wx.setStorageSync('TicketPrice', data.TicketPrice);
        wx.setStorageSync('endlong', data.EndLocation_Longitude);
        wx.setStorageSync('endlati', data.EndLocation_Latitude);
        wx.setStorageSync('ReservationDelay', data.ReservationDelay);
        wx.navigateTo({
          url: '/pages/ending/ending',
        })
      }
    })
  },
  //切换城市
  chooseCity() {
    wx.navigateTo({
      url: "/pages/searchCity/searchCity?urlFrom=2",
    })
  },
  getXianluList(){
      let that =  this;
      var page = that.data.page;
      var locationCity = wx.getStorageSync('locationCity');
      http.getRequest('/Api/DispatchMobile/getPassengerLine?page='+page+'&limit=8&city='+locationCity,'', wx.getStorageSync('header'), res => {
        if(res.code==0){
          if(res.data.length){
            if(page == 1){
              that.setData({
                address:res.data,
                loading:false,
                noMore:false
              });
            }else{
              that.setData({
                address: this.data.address.concat(res.data),
                loading:false,
                noMore:false
              })
            }
          }else{
            wx.showToast({
              title: '暂无数据',
              icon:"error"
            })
            that.setData({
              loading:false,
              noMore:true
            })
          }
        }else{
          wx.showToast({
            title: '数据请求失败，请稍后重试',
            icon:"error"
          })
        }
      }, err => {
        console.log(1111,err)
      })
  },
  loadMore: function() {
    let that = this;
    if(!that.data.noMore){
      wx.showLoading({
        title: '正在加载中...',
      });
      that.setData({
        page:this.data.page + 1
      })
      that.getXianluList();
    }
  },
  searchInputend(e){
    var keword =e.detail.value;
    let that = this;
    var page = 1;
      var locationCity = wx.getStorageSync('locationCity');
      http.getRequest('/Api/DispatchMobile/getPassengerLine?page='+page+'&limit=8&city='+locationCity+'&searchname='+keword,'', wx.getStorageSync('header'), res => {
        if(res.code==0){
          if(page == 1){
            if(res.data.length>0){
              that.setData({
                address:res.data,
                loading:false,
                noMore:false
              });
            }else{
              wx.showToast({
                title: '暂无数据',
                icon:"error"
              })
              that.setData({
                address:res.data,
                loading:false,
                noMore:tre
              });
            }
          }else{
            that.setData({
              address: this.data.address.concat(res.data),
              loading:false,
              noMore:false
            })
          }
        }else{
          wx.showToast({
            title: '数据请求失败，请稍后重试',
            icon:"error"
          })
        }
      }, err => {
        console.log(1111,err)
      })
  },
  searchInputend1(area){
    let that = this;
    var page = 1;
      var locationCity = wx.getStorageSync('locationCity');
      http.getRequest('/Api/DispatchMobile/getPassengerLine?page='+page+'&limit=8&city='+locationCity+'&searchname='+area,'', wx.getStorageSync('header'), res => {
        if(res.code==0){
          if(page == 1){
            if(res.data.length>0){
              that.setData({
                address:res.data,
                loading:false,
                noMore:false
              });
            }else{
              wx.showToast({
                title: '暂无数据',
                icon:"error"
              })
              that.setData({
                address:res.data,
                loading:false,
                noMore:true
              });
            }
          }else{
            that.setData({
              address: this.data.address.concat(res.data),
              loading:false,
              noMore:false
            })
          }
        }else{
          wx.showToast({
            title: '数据请求失败，请稍后重试',
            icon:"error"
          })
        }
      }, err => {
        console.log(1111,err)
      })
  },
  searchCancel(){
    this.setData({
      value:''
    })
    this.getXianluList();
  },
  bindArea(e){
    var area = e.currentTarget.dataset.area;
    let that = this;
    that.setData({
      value:area
    })
    that.searchInputend1(area);
  },
})