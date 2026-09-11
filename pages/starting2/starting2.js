// pages/starting2/starting2.js
// var bmap = require('../../libs/bmap-wx.min');
var bmap =  require("../../libs/bmap-wx");
const debounce = require('../../utils/debounce');
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    startingLati: '',
    endingLati: '',
    scale: 15,
    value: "", //搜索框value
    address: [],
    scrollStyle: '',
    direction: 'starting',
    type: '',
    city: "",
    endInfo2: '',
    starInfo2: '',
    keyboard: false,
    polygons: [], // 多边形覆盖物
    circles: [], //圆形覆盖物
    fencePoints: [], // 存储围栏顶点,
    xianzhi: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
 
    this.setData({
      xianzhi: options.xianzhi
    })
    let storageSync = wx.getStorageSync('storageSync');
    if (options) {
      if (options.direction == "starting") {
        wx.setNavigationBarTitle({
          title: '上车地点'
        });
        this.setData({
          city: storageSync.startingCity,
          startingLati: storageSync.StatingLocation_Latitude + ',' + storageSync.StatingLocation_Longitude
        })
      } else if (options.direction == "ending") {
        wx.setNavigationBarTitle({
          title: '下车地点'
        });
        this.setData({
          city: storageSync.endingCity,
          endingLati: storageSync.EndLocation_Latitude + ',' + storageSync.EndLocation_Longitude
        })
      }
      this.setData({
        direction: options.direction,
        type: options.type
      })
    }
    this.calculateScrollViewHeight()
    //绘制电子围栏
    this.initFence();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.mapCtx = wx.createMapContext("indexMap", this); // 地图组件的id
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;
    var BMap = new bmap.BMapWX({
      // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
      key:'FD2Wvwuq8uRaFgheLXBn13U'
    });
    BMap.regeocoding({
      success: function (res) {
        let adRes = res.originalData.result;
        var data = res.wxMarkerData[0];
  
        if (adRes.addressComponent.city == that.data.city && that.data.type != 'ly') {
          that.setData({
            longitude: data.longitude,
            latitude: data.latitude,
          })
          console.log('逆地理编码5',data.latitude + ',' + data.longitude)
          BMap.regeocoding({
            location: data.latitude + ',' + data.longitude,
            success: function (res1) {
              let adRes = res1.originalData.result.pois;
              let arrar = adRes.map(item => ({
                ...item,
                'address': item.addr,
                "location": {
                  "lat": item.point.y,
                  "lng": item.point.x
                }
              }))
        
              that.setData({
                address: arrar,
              })
            },
            fail: function () {

              wx.showToast({
                title: '1请检查位置服务是否开启',
              })
            },
          });
          // ----------------------
          if (that.data.direction == 'starting') {
            var starInfo2 = {};
            starInfo2.startCity = that.data.city;
            starInfo2.startAddress = data.address;
            starInfo2.startName = data.address;
            starInfo2.startLait = data.latitude;
            starInfo2.startLont = data.longitude;
            that.setData({
              starInfo2: starInfo2
            })
          } else if (that.data.direction == 'ending') {
            var endInfo2 = {};
            endInfo2.endCity = that.data.city;
            endInfo2.endAddress = data.address;
            endInfo2.endName = data.address;
            endInfo2.endLait = data.latitude;
            endInfo2.endLont = data.longitude;
            that.setData({
              endInfo2: endInfo2
            })
          }
        } else if (adRes.addressComponent.city != that.data.city && that.data.type != 'ly' && that.data.type != 'xykh' && that.data.type != 'hcyj' && that.data.type != 'hot') {
          let item = wx.getStorageSync('storageSync')
       
          if (that.data.direction == 'starting') {
            that.setData({
              longitude: item.StatingLocation_Longitude,
              latitude: item.StatingLocation_Latitude,
            })
          } else if (that.data.direction == 'ending') {
            that.setData({
              longitude: item.EndLocation_Longitude,
              latitude: item.EndLocation_Latitude,
            })
          }

          console.log('逆地理编码6',that.data.latitude + ',' + that.data.longitude)
          BMap.regeocoding({
            location: that.data.latitude + ',' + that.data.longitude,
            success: function (res1) {
              let adRes = res1.originalData.result.pois;
              let arrar = adRes.map(item => ({
                ...item,
                'address': item.addr,
                "location": {
                  "lat": item.point.y,
                  "lng": item.point.x
                }
              }))
              that.setData({
                address: arrar,
              })
            },
            fail: function () {
              wx.showToast({
                title: '2请检查位置服务是否开启',
              })
            },
          });
        } else if (that.data.type == 'ly' || that.data.type == 'hcyj' || that.data.type == 'xykh' || that.data.type == 'hot') {
          wx.getLocation({
            type: "gcj02",
            success(res) {
              console.log(res)
              console.log('逆地理编码7',res.latitude + ',' + res.longitude)
              BMap.regeocoding({
                location: res.latitude + ',' + res.longitude,
                success: function (res1) {
           
                  let city = res1.originalData.result.addressComponent.city
                  let adRes = res1.originalData.result.pois;
                  let arrar = adRes.map(item => ({
                    ...item,
                    'address': item.addr,
                    "location": {
                      "lat": item.point.y,
                      "lng": item.point.x
                    }
                  }))
              
                  that.setData({
                    address: arrar,
                    city: city
                  })
                },
                fail: function () {
                  wx.showToast({
                    title: '2请检查位置服务是否开启',
                  })
                },
              });
              that.setData({
                latitude: res.latitude,
                longitude: res.longitude
              })
            },
            fail(err) {
              console.log(err);
            }
          })
        }
      },
      fail: function (res) {

        wx.showToast({
          title: '3请检查位置服务是否开启',
        })
      },
    });

  },
  //键盘弹起
  onInputFocus(e) {

    this.setData({
      keyboard: true
    })
  },
  // 此时键盘正在收起或已收起
  onInputBlur(e) {

    this.setData({
      keyboard: false
    })

  },
  // 输入框防抖处理（延迟执行）
  searchInputend: debounce(function (e) {

    var _this = this;
    var value = e.detail.value;
    if (value) {
      let parameter = {
        "query": value,
        "region": _this.data.city,
        "model": 5,
      }
      wx.request({
        url: baseUrl + '/api/MapWebApi/GetBaiduPlaceSearch',
        data: parameter,
        method: "POST",
        success: (res) => {
          if (res.data.code == 0) {
            let data = res.data.data;
            const updatedUsers = data.map(user => {
              return {
                ...user,
                ['chectout']: false
              };
            });
       
            _this.setData({
              address: updatedUsers,
            })
            wx.hideLoading()
          }
        },
        fail(err) {
          console.log(err)
          wx.hideLoading()
        }
      })
    } else {
      this.setData({
        address: this.data.pois,
        value: '',
      })
      wx.hideLoading()
    }
  }, 500),
  //鼠标在地图上移动
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
          console.log('逆地理编码8',res.latitude + ',' + res.longitude)
          BMap.regeocoding({
            location: res.latitude + ',' + res.longitude,
            success: function (res1) {
              let adRes = res1.originalData.result;
              if (that.data.isyun == 1) {
                if (startCity != adRes.addressComponent.city) {
                  if (startCity != adRes.addressComponent.district) {
                    wx.showToast({
                      title: '该线路没开通',
                      icon: 'none'
                    })
                  } else {
                    that.searchInputend({
                      detail: {
                        // value: adRes.formatted_address
                        value: adRes.sematic_description + adRes.formatted_address_poi
                      }
                    })
                  }
                } else {
                  that.searchInputend({
                    detail: {
                      // value: adRes.formatted_address
                      value: adRes.sematic_description + adRes.formatted_address_poi
                    }
                  })
                }
              } else {
                if (that.data.direction == "starting") {
                  var starInfo2 = {};
                  starInfo2.startCity = that.data.city;
                  starInfo2.startAddress = adRes.formatted_address;
                  starInfo2.startName = adRes.formatted_address;
                  starInfo2.startLait = adRes.location.lat;
                  starInfo2.startLont = adRes.location.lng;
     
      
                  that.setData({
                    starInfo2: starInfo2
                  })
                } else if (that.data.direction == "ending") {
                  var endInfo2 = {};
                  endInfo2.endCity = that.data.city;
                  endInfo2.endAddress = adRes.formatted_address;
                  endInfo2.endName = adRes.formatted_address;
                  endInfo2.endLait = adRes.location.lat;
                  endInfo2.endLont = adRes.location.lng;
                  // wx.setStorageSync('endInfo2',endInfo2);
                  that.setData({
                    endInfo2: endInfo2
                  })
                }
                let arrList = adRes.pois;
                const updatedUsers1 = arrList.map(user => {
                  return {
                    ...user,
                    ['chectout']: false
                  };
                });
                const updatedUsers2 = updatedUsers1.map(obj => ({
                  ...obj, // 复制旧对象的所有属性
                  address: obj.addr, // 添加或修改键
                  location: {
                    lng: obj.point.x,
                    lat: obj.point.y
                  },
                  addr: undefined, // 可选，删除原键（如果不需要保留）
                  point: undefined
                }));
                that.setData({
                  address: updatedUsers2
                })
                // that.searchInputend({detail:{value:adRes.formatted_address}})
              }
            },
            fail: function () {
              wx.showToast({
                title: '4请检查位置服务是否开启',
              })
            },
          });
        }
      })
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
      success: function (res) {
        var data = res.wxMarkerData[0];
        _self.setData({
          latitude: data.latitude,
          longitude: data.longitude
        })
      }
    });
  },
  //点击地址列表
  clickAddress(e) {
    let that = this;
    let item = e.currentTarget.dataset.item

    let index = e.currentTarget.dataset.index
    let newAddress = []
    for (let i = 0; i < that.data.address.length; i++) {
      if (i == index) {
        that.data.address[i].chectout = true
      } else {
        that.data.address[i].chectout = false
      }
      newAddress.push(that.data.address[i])
    }
    that.setData({
      address: newAddress
    })
    if (that.data.direction == "starting") {
      var starInfo2 = {};
      starInfo2.startCity = that.data.city;
      starInfo2.startAddress = item.address;
      starInfo2.startName = item.name + item.address;
      starInfo2.startLait = item.location.lat;
      starInfo2.startLont = item.location.lng;
      that.setData({
        starInfo2: starInfo2
      })
    } else if (that.data.direction == "ending") {
      var endInfo2 = {};
      endInfo2.endCity = that.data.city;
      endInfo2.endAddress = item.address;
      endInfo2.endName = item.name + item.address;
      endInfo2.endLait = item.location.lat;
      endInfo2.endLont = item.location.lng;
      that.setData({
        endInfo2: endInfo2
      })
    }
    that.setData({
      latitude: item.location.lat,
      longitude: item.location.lng,
      scale: 18,
      value: item.name
    })
    let params = {
      detail: {
        value: item.name
      }
    }
    that.searchInputend(params)
  },
  //点击确定
  submit() {
    let that = this;
    let starInfo = null
    let requests = null

    if (that.data.direction == "starting") {
      if (that.data.starInfo2 == '') {
        wx.showToast({
          title: '请选择乘车地点',
          icon: 'none'
        })
        return false
      }
      starInfo = that.data.starInfo2
      requests = starInfo.startLont + "," + starInfo.startLait;
    } else if (that.data.direction == "ending") {
      if (that.data.endInfo2 == '') {
        wx.showToast({
          title: '请选择到达地点',
          icon: 'none'
        })
        return false
      }
      starInfo = that.data.endInfo2
      requests = starInfo.endLont + "," + starInfo.endLait;
    }
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: baseUrl + '/api/MapWebApi/GeoConv',
      data: {
        LatLngs: requests,
        Model: 1,
      },
      method: "POST",
      success: (res) => {
    
        let newStarInfo = {}
        if (that.data.direction == "starting") {
          newStarInfo.startAddress = starInfo.startAddress
          newStarInfo.startCity = starInfo.startCity
          newStarInfo.startName = starInfo.startName
          newStarInfo.startLait = res.data.data[0].Item1
          newStarInfo.startLont = res.data.data[0].Item2
          wx.setStorageSync('starInfo2', newStarInfo);
        } else if (that.data.direction == "ending") {
          newStarInfo.endAddress = starInfo.endAddress
          newStarInfo.endCity = starInfo.endCity
          newStarInfo.endName = starInfo.endName
          newStarInfo.endLait = res.data.data[0].Item1
          newStarInfo.endLont = res.data.data[0].Item2
          wx.setStorageSync('endInfo2', newStarInfo);
        }
        wx.hideLoading()
        // wx.setStorageSync('mapBack','mapBack');
        if (that.data.type == 'pc') {
          wx.reLaunch({
            url: '/pages/pingche2/pingche2',
          })
        } else if (that.data.type == 'bc') {
          wx.reLaunch({
            url: '/user_center/pages/baoche/baoche',
          })
        } else if (that.data.type == 'sh') {
          wx.reLaunch({
            url: '/user_center/pages/shaohuo/shaohuo',
          })
        } else if (that.data.type == 'ly' ) {
          if (that.data.direction == 'starting') {
            var BMap = new bmap.BMapWX({
              // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
              key:'FD2Wvwuq8uRaFgheLXBn13U'
            });
            console.log('逆地理编码9',newStarInfo.startLait + ',' + newStarInfo.startLont)
            BMap.regeocoding({
              location: newStarInfo.startLait + ',' + newStarInfo.startLont,
              success: function (res_e) {
                console.log(res_e)
                let start_city = res_e.originalData.result.addressComponent.city
                let district = res_e.originalData.result.addressComponent.district
                if (start_city == "太原市" || start_city == "孝义市" || district == "孝义市") {
                  wx.setStorageSync('start_city', start_city)
                  wx.reLaunch({
                    url: '/driving_status/pages/lvyouList/lvyouList',
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请选择出发地为太原、孝义',
                    complete: (res) => {
                      wx.removeStorageSync('starInfo2')
                      wx.removeStorageSync('start_city')
                    }
                  })
                }
              },
              fail: function () {

                wx.showToast({
                  title: '1请检查位置服务是否开启',
                })
              },
            });
          } else {
            wx.reLaunch({
              url: '/driving_status/pages/lvyouList/lvyouList',
            })
          }
        } else if (that.data.type == 'hcyj') {
          wx.reLaunch({
            url: '/driving_status/pages/lvyouList/lvyouList?type=hcyj',
          })
        }else if (that.data.type == 'xykh') {
        
          if (that.data.direction == 'starting') {
            var BMap = new bmap.BMapWX({
              // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
              key:'FD2Wvwuq8uRaFgheLXBn13U'
            });
            console.log('逆地理编码10',newStarInfo.startLait + ',' + newStarInfo.startLont)
            BMap.regeocoding({
              location: newStarInfo.startLait + ',' + newStarInfo.startLont,
              success: function (res_e) {
     
                let start_city = res_e.originalData.result.addressComponent.city
                let district = res_e.originalData.result.addressComponent.district
                if (start_city == "太原市" || start_city == "孝义市" || district == "孝义市") {
                  wx.setStorageSync('start_city', start_city)
                  wx.reLaunch({
                    url: '/driving_status/pages/lvyouList/lvyouList?type=xykh',
                  })
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请选择出发地为太原、孝义',
                    complete: (res) => {
                      wx.removeStorageSync('starInfo2')
                      wx.removeStorageSync('start_city')
                    }
                  })
                }
              },
              fail: function () {

                wx.showToast({
                  title: '1请检查位置服务是否开启',
                })
              },
            });
          } else {
            wx.reLaunch({
              url: '/driving_status/pages/lvyouList/lvyouList?type=xykh',
            })
          }
        } else if (that.data.type == 'hot') {
          if (that.data.direction == 'starting') {
            var BMap = new bmap.BMapWX({
              // ak: 'MnTm62X4dihvBjjN0FBtlgFkG0kTHpAx'
              key:'FD2Wvwuq8uRaFgheLXBn13U'
            });
            console.log('逆地理编码11',newStarInfo.startLait + ',' + newStarInfo.startLont)
            BMap.regeocoding({
              location: newStarInfo.startLait + ',' + newStarInfo.startLont,
              success: function (res_e) {
          
                let start_city = res_e.originalData.result.addressComponent.city
                wx.setStorageSync('start_city', start_city)
                wx.reLaunch({
                  url: '/driving_status/pages/hotLine/hotLine',
                })
              },
              fail: function () {
                wx.showToast({
                  title: '1请检查位置服务是否开启',
                })
              },
            });
          } else {
            wx.reLaunch({
              url: '/driving_status/pages/lvyouList/lvyouList',
            })
          }
        }
      },
      fail(err) {
        console.log(err)
        wx.hideLoading()
      }
    })
  },
  calculateScrollViewHeight: function () {
    const systemInfo = wx.getWindowInfo(); // 获取系统信息
    const screenHeight = systemInfo.windowHeight; // 获取屏幕高度
    const desiredHeight = screenHeight * 0.8 - 70; // 计算高度（80%的屏幕高度减去20rpx）
    // 由于直接使用rpx在某些情况下可能不完全准确，我们可以转换为px再进行计算
    const rpxToPx = (rpx) => {
      return (rpx / 750) * systemInfo.windowWidth; // 根据设计稿宽度750来计算px值
    };
    const finalHeight = desiredHeight - rpxToPx(70); // 减去20rpx转换为px后的值
    this.setData({
      scrollStyle: `height: ${finalHeight}rpx;` // 设置样式
    });
  },
  // 初始化一个多边形电子围栏
  initFence() {
    let lineId = wx.getStorageSync('lineId') || '';
    if(lineId) {
      wx.request({
        url: baseUrl + '/api/DispatchMobile/LineIdFenceMapAll',
        data:{
          LineId:lineId
        },
        method: "GET",
        success: (res) => {
          if (res.data.code == 0) {
            let polygonResult = res.data.data[0].FenceList
            let polygonArrs = []
            let polygonArr = res.data.data[0]
            for (let i = 0; i < polygonResult.length; i++) {
              polygonArrs.push({
                points: polygonResult[i].latlngs,
                strokeWidth: 2,
                strokeColor: polygonArr.FenceList[i].Name.includes("超范围") ? '#e979fd38' : '#79a2fd82', // 蓝色边框
                fillColor: polygonArr.FenceList[i].Name.includes("超范围") ? '#e979fd38' : '#79a2fd82', // 蓝色 + 30% 不透明度
                zIndex: polygonArr.FenceList[i].Name.includes("超范围") ? '11' : '10' // 层级优先显示
              })
            }
            let circleArrs = []
            if(res.data.data[1]) {
              let circleArr = res.data.data[1]
    
            let circleResult = res.data.data[1].FenceList
            
            for (let i = 0; i < circleResult.length; i++) {
              circleArrs.push({
                latitude: circleResult[i].latlngs[0].latitude, // 圆心纬度
                longitude: circleResult[i].latlngs[0].longitude, // 圆心经度
                color: "#e979fd38", // 边框颜色
                fillColor: "#e979fd38", // 填充色（末尾2A为透明度）
                radius: circleArr.FenceList[i].radius, // 半径（米）
                strokeWidth: 2 // 边框宽度
              })
            }
            }
            
        
            this.setData({
              circles: circleArrs,
              polygons: polygonArrs,
              fencePoints: polygonResult[0],
            });
          }
        },
        fail(err) {
          console.log(err)
          wx.hideLoading()
        }
      })
    }
   

  },

  // 判断点是否在多边形内部（射线法）
  isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude,
        yi = polygon[i].latitude;
      const xj = polygon[j].longitude,
        yj = polygon[j].latitude;
      const intersect = ((yi > point.latitude) !== (yj > point.latitude)) &&
        (point.longitude < (xj - xi) * (point.latitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },

  // 检查当前位置是否在电子围栏内
  checkInFence() {
    const userPoint = {
      longitude: this.data.starInfo2.startLont,
      latitude: this.data.starInfo2.startLait
    };

    const isIn = this.isPointInPolygon(userPoint, this.data.fencePoints);

    if (isIn) {
      wx.showToast({
        title: '✅ 在围栏内',
        icon: 'success',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '❌ 在围栏外',
        icon: 'none',
        duration: 1500
      });
    }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '定位失败，请检查权限',
    //       icon: 'error'
    //     });
    //   }
    // });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})