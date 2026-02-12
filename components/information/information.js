// components/slideCoupon/slideCoupon.js
import http from "../../utils/http.js";
const BASE_URL = require("../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL; //配置基础url
let clickTimer = null;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    typeon: {
      type: String,
      value: "pc",
    },
  },
  options: {
    // 其他选项：'shared'（共享样式）、'apply-shared'（父组件影响子组件） 'isolated' // 默认值，隔离样式
    styleIsolation: "apply-shared",
  },
  lifetimes: {
    attached: function () {
      let that = this;
      // 在组件实例进入页面节点树时执行
      let storageSync = wx.getStorageSync("storageSync");
      let starInfo2 = wx.getStorageSync("starInfo2");
      let endInfo2 = wx.getStorageSync("endInfo2");
      let oldLineId = wx.getStorageSync("lineId");
      let oldMemberId = wx.getStorageSync("userInfo");
      that.setData({
        startingCity: storageSync.startingCity,
        endingCity: storageSync.endingCity,
      });
      if (starInfo2) {
        if (that.data.typeon == "sh") {
          wx.request({
            url: baseUrl + "/api/CarPromotion/GetLastOrderAddress",
            data: {
              "LineId": oldLineId,
              "MemberId": oldMemberId.Id,
              "TypeId": 3
            },
            method: "POST",
            success: (res) => {
              if (res.data.code == 0) {
                let data = res.data.data
                let informationList = data.LinePriceList.filter(item => item.DeliveryTimeState == '')
                let newinformationList = informationList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined // 可选：显式删除（但下面用解构更干净）
                }));
                let remarkList = data.LinePriceList.filter(item => item.DeliveryTimeState != '')
                let newremarkList = remarkList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined
                }));
                newremarkList =  that.ensureAtLeastOneChecked(newremarkList)
                newinformationList =  that.ensureAtLeastOneChecked(newinformationList)
                let takeData = {
                  newremarkList,
                  newinformationList
                }
                this.triggerEvent('sendToParent2', takeData);
                this.setData({
                  informationList: newinformationList,
                })
              }
            },
          });
        }

        that.setData({
          startingAddress: starInfo2.startName,
          selectedCar: "",
          timeIndex: "",
        });
        wx.removeStorageSync('pcTypeId')
      }
      if (endInfo2) {
        if (that.data.typeon == "sh") {
          wx.request({
            url: baseUrl + "/api/CarPromotion/GetLastOrderAddress",
            data: {
              "LineId": oldLineId,
              "MemberId": oldMemberId.Id,
              "TypeId": 3
            },
            method: "POST",
            success: (res) => {
              if (res.data.code == 0) {
                let data = res.data.data
                let informationList = data.LinePriceList.filter(item => item.DeliveryTimeState == '')
                let newinformationList = informationList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined // 可选：显式删除（但下面用解构更干净）
                }));
                let remarkList = data.LinePriceList.filter(item => item.DeliveryTimeState != '')
                let newremarkList = remarkList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined
                }));
                newremarkList =  that.ensureAtLeastOneChecked(newremarkList)
                newinformationList =  that.ensureAtLeastOneChecked(newinformationList)
                let takeData = {
                  newremarkList,
                  newinformationList
                }
                that.triggerEvent('sendToParent2', takeData);
                that.setData({
                  informationList: newinformationList,
                })
              }
            },
          });
        }
        that.setData({
          endingAddress: endInfo2.endName,
          selectedCar: "",
          timeIndex: "",
        });
        wx.removeStorageSync('pcTypeId')
      }
      if (starInfo2 && endInfo2) {
        if (that.data.typeon == "sh") {
          wx.request({
            url: baseUrl + "/api/CarPromotion/GetLastOrderAddress",
            data: {
              "LineId": oldLineId,
              "MemberId": oldMemberId.Id,
              "TypeId": 3
            },
            method: "POST",
            success: (res) => {
              if (res.data.code == 0) {
                let data = res.data.data
                let informationList = data.LinePriceList.filter(item => item.DeliveryTimeState == '')
                let newinformationList = informationList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined // 可选：显式删除（但下面用解构更干净）
                }));
                let remarkList = data.LinePriceList.filter(item => item.DeliveryTimeState != '')
                let newremarkList = remarkList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined
                }));
                newremarkList =  that.ensureAtLeastOneChecked(newremarkList)
                newinformationList =  that.ensureAtLeastOneChecked(newinformationList)
                let takeData = {
                  newremarkList,
                  newinformationList
                }
                that.triggerEvent('sendToParent2', takeData);
                that.setData({
                  informationList: newinformationList,
                })
              }
            },
          });
        }
        //查询lineId
        wx.request({
          url: baseUrl + "/api/DispatchMobile/GetLineIdByCityName",
          data: {
            startCity: starInfo2.startCity,
            endCity: endInfo2.endCity,
          },
          method: "GET",
          success: (res) => {
            if (res.data.code == 0) {
              that.setData({
                lineId: res.data.data.Id,
              });
              let storedData = wx.getStorageSync("storageSync") || {};
              let updatedData = {
                ...storedData,
                lineId: res.data.data.Id
              };
              wx.setStorageSync("storageSync", updatedData);
              //拉出行时间列表
              that.getTimeListForDate();
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: "error",
              });
            }
            //查询是否在运营范围内
            that.getPriceListForLineId();
          },
        });
      }
      if (!starInfo2 && !endInfo2) {
        //去拿上一次地址
        let TypeId = ''
        if (that.data.typeon == "pc") {
          TypeId = 1
        } else if (that.data.typeon == "bc") {
          TypeId = 2
        } else if (that.data.typeon == "sh") {
          TypeId = 3
        }
        wx.request({
          url: baseUrl + "/api/CarPromotion/GetLastOrderAddress",
          data: {
            "LineId": oldLineId,
            "MemberId": oldMemberId.Id,
            "TypeId": TypeId
          },
          method: "POST",
          success: (res) => {
            if (res.data.code == 0) {
              let data = res.data.data
              if (that.data.typeon == "sh") {
                let informationList = data.LinePriceList.filter(item => item.DeliveryTimeState == '')
                let newinformationList = informationList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined // 可选：显式删除（但下面用解构更干净）
                }));
                let remarkList = data.LinePriceList.filter(item => item.DeliveryTimeState != '')
                let newremarkList = remarkList.map(item => ({
                  ...item,
                  checked: item.Selected,
                  Selected: undefined
                }));
                newremarkList =  that.ensureAtLeastOneChecked(newremarkList)
                newinformationList =  that.ensureAtLeastOneChecked(newinformationList)
                
                let takeData = {
                  newremarkList,
                  newinformationList,
                  DeliverGoodsTel: data.DeliverGoodsTel,
                  TakeOverGoodsTel: data.TakeOverGoodsTel,
                  PayAmount: data.PayAmount
                }
                that.triggerEvent('sendToParent', takeData);
                that.setData({
                  startingAddress: data.IntoLocation,
                  endingAddress: data.OffLocation
                });
                if (data.IntoLatitude != 0) {
                  let Into = {
                    startAddress: data.IntoLocation,
                    startLait: data.IntoLatitude,
                    startLont: data.IntoLongitude,
                    startName: data.IntoLocation,
                    startCity: storageSync.startingCity
                  }
                  wx.setStorageSync("starInfo2", Into)
                  let Off = {
                    endAddress: data.OffLocation,
                    endLait: data.OffLatitude,
                    endLont: data.OffLongitude,
                    endName: data.OffLocation,
                    endCity: storageSync.endingCity
                  }
                  wx.setStorageSync("endInfo2", Off)
                  //查询lineId
                  wx.request({
                    url: baseUrl + "/api/DispatchMobile/GetLineIdByCityName",
                    data: {
                      startCity: storageSync.startingCity,
                      endCity: storageSync.endingCity,
                    },
                    method: "GET",
                    success: (res) => {
                      if (res.data.code == 0) {
                        that.setData({
                          lineId: res.data.data.Id,
                        });
                        let storedData = wx.getStorageSync("storageSync") || {};
                        let updatedData = {
                          ...storedData,
                          lineId: res.data.data.Id
                        };
                        wx.setStorageSync("storageSync", updatedData);
                        //拉出行时间列表
                        that.getTimeListForDate();
                      } else {
                        wx.showToast({
                          title: res.data.msg,
                          icon: "error",
                        });
                      }
                    },
                  });
                }
                this.setData({
                  informationList: newinformationList,
                })
              } else if (that.data.typeon == "pc") {
                that.setData({
                  startingAddress: data.IntoLocation,
                  endingAddress: data.OffLocation
                });
                if (data.IntoLatitude != 0) {
                  let Into = {
                    startAddress: data.IntoLocation,
                    startLait: data.IntoLatitude,
                    startLont: data.IntoLongitude,
                    startName: data.IntoLocation,
                    startCity: storageSync.startingCity
                  }
                  wx.setStorageSync("starInfo2", Into)
                  let Off = {
                    endAddress: data.OffLocation,
                    endLait: data.OffLatitude,
                    endLont: data.OffLongitude,
                    endName: data.OffLocation,
                    endCity: storageSync.endingCity
                  }
                  wx.setStorageSync("endInfo2", Off)
                  that.setData({
                    lineId: data.LinePriceList[0].PassengerLineId,
                  });
                  let storedData = wx.getStorageSync("storageSync") || {};
                  let updatedData = {
                    ...storedData,
                    lineId: data.LinePriceList[0].PassengerLineId
                  };
                  wx.setStorageSync("storageSync", updatedData);
                  console.log('nav_change_date');
                  that.triggerEvent('nav_change_date');
                  that.triggerEvent('information_phone_number', data.PassengerList[0].Phone);
                }
              } else if (that.data.typeon == "bc") {
                that.setData({
                  startingAddress: data.IntoLocation,
                  endingAddress: data.OffLocation
                });
                if (data.IntoLatitude != 0) {
                  let Into = {
                    startAddress: data.IntoLocation,
                    startLait: data.IntoLatitude,
                    startLont: data.IntoLongitude,
                    startName: data.IntoLocation,
                    startCity: storageSync.startingCity
                  }
                  wx.setStorageSync("starInfo2", Into)
                  let Off = {
                    endAddress: data.OffLocation,
                    endLait: data.OffLatitude,
                    endLont: data.OffLongitude,
                    endName: data.OffLocation,
                    endCity: storageSync.endingCity
                  }
                  wx.setStorageSync("endInfo2", Off)
                  that.setData({
                    lineId: data.LinePriceList[0].PassengerLineId,
                  });
                  let storedData = wx.getStorageSync("storageSync") || {};
                  let updatedData = {
                    ...storedData,
                    lineId: data.LinePriceList[0].PassengerLineId
                  };
                  wx.setStorageSync("storageSync", updatedData);
                  that.triggerEvent('nav_change_date');
                  that.triggerEvent('information_phone_number', data.PassengerList[0].Phone);
                }
                that.getTimeListForDate()
              }
            }
          },
        });
      }
      if (that.data.typeon == "bc" || that.data.typeon == "sh") {
        // 设置起始日期为今天
        let date = new Date();
        let today = date.toISOString().split("T")[0]; // 获取今天的日期（格式：YYYY-MM-DD）
        let storedData = wx.getStorageSync("pcTimeSync") || {};
        let updatedData = {
          ...storedData,
          propsDay: today.substring(5, 7) + "/" + today.substring(8, 10),
          propsTxt: "今天",
        };
        wx.setStorageSync("pcTimeSync", updatedData);
        that.setData({
          startDate: today,
          date: today, // 初始选择也为今天
          startTime: today
        });
        let storedData2 = wx.getStorageSync("storageSync") || {};
        let updatedData2 = {
          ...storedData2,
          startDate: today
        };
        wx.setStorageSync("storageSync", updatedData2);
        // 设置结束日期为今天之后三天
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 3); // 增加三天
        let endDateString = endDate.toISOString().split("T")[0]; // 获取格式化后的日期字符串
        that.setData({
          endTime: endDateString,
        });
      }
      //拼车通过Nav标签调起的路线选择 更改路线  同步更新到 information 组件

      getApp().eventCenter.on('startingCity', (data) => {
        that.setData({
          startingCity: data,
          startingAddress: ''
        })
      })
      getApp().eventCenter.on('endingCity', (data) => {
        that.setData({
          endingCity: data,
          endingAddress: ''
        })
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    startDate: "", //出行日期
    endDate: "",
    takeDate: "", //取件时间
    startingCity: "",
    endingCity: "",
    startingAddress: "",
    endingAddress: "",
    modelComponent: false,
    lineId: "",
    timeIndex: "", //出行时间
    timeArr: [], //出行时间列表
    selectedCar: null,
    startTime: '',
    endTime: '',
    objectArray: [],
    specification: null,
    informationList: [],
  },
  methods: {
    onRadioChange(e) {
      let aasd = this.data.informationList.filter(item => item.Id == e.detail.value)
      this.triggerEvent("goods", aasd);
    },
    //选择规格
    specificationSelection(e) {
      let data = this.data.objectArray[e.detail.value]
      this.triggerEvent("shippingCost", data.Version + data.Price);
      wx.setStorageSync('pcTypeId', this.data.objectArray[e.detail.value].Id)
      this.setData({
        specification: this.data.objectArray[e.detail.value].GoodsType_Name
      })
    },
    //是否在运营范围内
    getPriceListForLineId() {
      console.log('是否在运营范围内')
      wx.showLoading({
        title: "",
      });
      let that = this;
      let starInfo2 = wx.getStorageSync("starInfo2");
      let endInfo2 = wx.getStorageSync("endInfo2");
      let IsExclusive = null;
      if (that.data.typeon == "pc" || that.data.typeon == "sh") {
        IsExclusive = "100004-0000010002";
      } else if (that.data.typeon == "bc") {
        IsExclusive = "100004-0000010001";
      }
      var data = {
        IsExclusive: IsExclusive,
        Id: that.data.lineId,
        StartLat: starInfo2.startLait,
        StartLng: starInfo2.startLont,
        EndLat: endInfo2.endLait,
        EndLng: endInfo2.endLont,

      };
      console.log('data',data)
      http.postRequest(
        "/Api/DispatchMobile/getPriceListForLineId",
        data,
        "",
        (res) => {
          if (res.code == "0") {
            if (res.msg == '有摆渡价') {
              getApp().eventCenter.emit('Version', res.data[0].Version)
              getApp().eventCenter.emit('rangfenceMapList', res.data[0].rangfenceMapList)
              const version = {
                value: res.data[0].Version
              }
              getApp().eventVersion.emit('dataChange', version)
              let pcTimeSync = wx.getStorageSync('pcTimeSync')
              let updatedData = {
                ...pcTimeSync,
                Version: res.data[0].Version
              }
              wx.setStorageSync('pcTimeSync', updatedData)
            } else if (res.msg == '没有摆渡价') {
              let pcTimeSync = wx.getStorageSync('pcTimeSync')
              let updatedData = {
                ...pcTimeSync,
                Version: 0
              }
              wx.setStorageSync('pcTimeSync', updatedData)
            }
            //去调用获取车型
            if (that.data.typeon == "pc") {
              this.triggerEvent('getCarList');
            }
            if (that.data.typeon == "sh") {
              this.triggerEvent('sendMsg', {
                message: 'Hello from A!'
              });
            }
          } else {
            if (res.msg != "请选择下车位置") {
              wx.showModal({
                title: "服务范围提示",
                content: "不在营运线路范围内,下单请联系客服，电话:0351-6078977，是否电话？",
                confirmText: "确定",
                cancelText: "关闭",
                success(res) {
                  that.setData({
                    isShowModal: false,
                  });
                  if (res.confirm) {
                    wx.makePhoneCall({
                      phoneNumber: "0351-6078977",
                    });
                  }
                },
              });
              wx.removeStorageSync('starInfo2')
              wx.removeStorageSync('endInfo2')
              that.setData({
                startingAddress: '',
                endingAddress: '',
              })
            }

          }
          wx.hideLoading();
        },
        (err) => {
          console.log(err);
          wx.hideLoading();
        }
      );
    },
    updatedPrice(e) {
      let that = this;
      that.triggerEvent("updatedData");
    },
    //选择车辆传值
    handleCarEvent(e) {
      let that = this;
      if (that.data.typeon == 'pc') {
        getApp().eventCenter.emit('changeLine4')

      } else if (that.data.typeon == 'bc') {
        if (e.detail.Version != "0") {
          if (wx.getStorageSync("personNum")) {
            let personNum = wx.getStorageSync("personNum");
            const price = personNum * (e.detail.Price + e.detail.Version);
            const newData = {
              value: price
            };
            getApp().eventCenter.emit("dataChange", newData);
          } else {
            const newData = {
              value: e.detail.Price + e.detail.Version
            };
            getApp().eventCenter.emit("dataChange", newData);
          }

        } else {
          if (wx.getStorageSync("personNum")) {
            let personNum = wx.getStorageSync("personNum");
            const price = personNum * e.detail.Price;
            const newData = {
              value: price
            };
            getApp().eventCenter.emit("dataChange", newData);
          } else {
            const newData = {
              value: e.detail.Price
            };
            getApp().eventCenter.emit("dataChange", newData);
          }

        }
      }


      this.setData({
        selectedCar: e.detail.Name,
      });
    },
    getDayDisplay(dateStr) {
      const now = new Date();
      const inputDate = new Date(dateStr);

      // 判断是否为今天
      if (now.toDateString() === inputDate.toDateString()) {
        return "今天";
      }

      // 返回星期几
      const weekDays = [
        "星期日",
        "星期一",
        "星期二",
        "星期三",
        "星期四",
        "星期五",
        "星期六",
      ];
      return weekDays[inputDate.getDay()];
    },
    //获取出行时间
    getTimeListForDate() {
      let that = this;
      var line_id = that.data.lineId;
      var startDate = that.data.startDate;
      // var seatnumber = that.data.SeatNumber;
      if (line_id && startDate) {
        http.getRequest(
          "/Api/DispatchMobile/getTimeListForDate?time=" +
          that.data.startDate +
          "&lineId=" +
          line_id,
          "",
          "",
          (res) => {
            if (res.code == "0") {
              that.setData({
                timeArr: res.data,
              });
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    },
    ensureAtLeastOneChecked(list, key = 'checked') {
      // 判断是否所有项的 checked 都是 false（或不存在）
      const allUnchecked = list.every(item => !item[key]);
    
      if (allUnchecked && list.length > 0) {
        // 默认选中第一个（你也可以改成其他逻辑，比如指定 id）
        list[0][key] = true;
      }
    
      return list; // 可选：返回修改后的数组（原地修改）
    },
    //点击选择时间
    handleTap() {
      console.log('进来了',this.data.timeArr)
      let that = this;
      if (that.data.timeArr == "" && that.data.lineId == "") {
        wx.showToast({
          title: "请先选择出行路线",
          icon: "none",
        });
      }
    },
    //出行时间点击确定
    bindTimeChange(e) {
      let that = this;
      var value = e.detail.value;
      let timePeriod = that.data.timeArr[value].RunTimeShow.split("-");
      that.setData({
        timeIndex: value,
      });
      let storedData = wx.getStorageSync("pcTimeSync") || {};
      let updatedData = {
        ...storedData,
        StartTime: timePeriod[0],
        EndTime: timePeriod[1],
      };
      wx.setStorageSync("pcTimeSync", updatedData);
      that.triggerEvent("updatedData", "Time");
    },
    //选择货物规格
    handleSpecifications(e) {
      let that = this;
      if (that.data.timeArr == "" && that.data.lineId == "") {
        wx.showToast({
          title: "请先选择出行路线",
          icon: "none",
        });
      }
    },
    handleModel() {
      let that = this;
      if (that.data.lineId == "") {
        wx.showToast({
          title: "请先选择出行路线",
          icon: "none",
        });
      } else {
        this.setData({
          modelComponent: true,
        });
      }
    },
    toStarting() {
      let that = this;
      wx.navigateTo({
        url: "/pages/starting2/starting2?type=" +
          that.data.typeon +
          "&direction=starting",
      });
    },
    toEnding() {
      let that = this;
      wx.navigateTo({
        url: "/pages/starting2/starting2?type=" +
          that.data.typeon +
          "&direction=ending",
      });
    },
    //选择寄件日期\出行日期
    bindDateChange: function (e) {
      let that = this;
      this.setData({
        startDate: e.detail.value,
        selectedCar: "",
        timeIndex: "",
      });
      that.getTimeListForDate();
      let handleDate = e.detail.value;
      let storedData = wx.getStorageSync("pcTimeSync") || {};
      let updatedData = {
        ...storedData,
        EndTime: "",
        StartTime: "",
        propsDay: handleDate.substring(5, 7) + "/" + handleDate.substring(8, 10),
        propsTxt: that.getDayDisplay(handleDate),
      };
      wx.setStorageSync("pcTimeSync", updatedData);
      let storageSync = wx.getStorageSync("storageSync") || {};
      let changeData = {
        ...storageSync,
        startDate: handleDate
      };
      wx.setStorageSync("storageSync", changeData);
      that.triggerEvent("updatedData", 'Day');
    },
    bindtakeDateDateChange: function (e) {
      this.setData({
        takeDate: e.detail.value,
      });
    },
    //物流回显
    logisticsecho() {

    }
  },
});