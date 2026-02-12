import http from '../../../utils/http';
import dateTimePicker from '../../../utils/datepicker.js';
const throttle = require('../../../utils/throttle.js').throttle;
const app = getApp();
let d30 = new Date().getTime() + 1800000;
let date = new Date(d30);
let weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
let currentHours = date.getHours();
let currentMinute = date.getMinutes();
let toUserTimer = null;
Page({
  data: {
    loadingFailed: false,
    loading: false,
    noMore: false,
    pageNo: 1,
    listData: null,
    FormTypeId: "",
    showEdit: false,
    estimate_in_time: '',
    dateTime: null,
    dateTimeArray: null,
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 10,
    orderid: '',
    dateReqInfo: {},
    startDate: "点击选择预约时间",
    multiArray: [
      ['今天', '明天', '后天'],
      ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
      ['00', '15', '30', '45']
    ],
    multiIndex: [0, 0, 0],
    startDate1: "",
    menuTapCurrent: 0,
    inputValue: '', //弹框数据
    modalShow: false, //弹框数据
    modalValue: '', //弹框数据
    prompt: '',
    isLoging: false
  },
  onLoad: function (options) {
    if (options.menuTapCurrent == 1) {
      this.setData({
        menuTapCurrent: options.menuTapCurrent
      })
    }
  },
  onShow() {
    this.getFormTypeId();
  },
  onUnload() {
    // app.globalData.client = null;
  },

  //到达底部
  scrollToLower: function (e) {
    if (!this.data.loading && !this.data.noMore) {
      this.setData({
        loading: true,
        pageNo: this.data.pageNo + 1
      });
      this.getOrderList(true, this.data.FormTypeId);
    }
  },
  getFormTypeId() {
    http.getRequest("/Api/DispatchMobile/CompanyConfig?Code=" + app.globalData.companyCode, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        this.setData({
          FormTypeId: res.data[0].ConfigContent
        })
        wx.setStorageSync('FormTypeId', res.data[0].ConfigContent);
        this.getOrderList(false, res.data[0].ConfigContent);
      }
    }, err => {
      console.log(err)
    })
  },
  goLoging() {
    wx.navigateTo({
      url: '/user_center/pages/login/login'
    })
  },
  // 查询订单
  getOrderList(isPage, FormTypeId) {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        isLoging: false,
      })
      wx.hideLoading()
    } else {
      that.setData({
        isLoging: true,
      })
      var usreinfo = wx.getStorageSync('userInfo');
      let reqData = {
        limit: 10,
        page: that.data.pageNo,
        Personal: usreinfo.Id,
        FormTypeId: FormTypeId,
        Where: that.data.menuTapCurrent == 0 ? "IsPickGoods = '100004-0000010002'" : "IsPickGoods = '100004-0000010001'"
      }
      http.postRequest("/Api/DispatchMobile/GetRideTicket", reqData, wx.getStorageSync('header'), res => {
        wx.hideLoading()
        that.setData({
          loading: false
        })

        if (isPage) {
          if (res.code == 0) {
            if (isPage) {
              var listData = res.data
              console.log(listData)
              listData.forEach(function (item, index) {
                if (item.IsReservation == '100004-0000010001') {
                  var arrtime = new Date(item.ArrivalTime.replace(/-/g, '/')).getTime();
                  var nowtime = new Date().getTime();
                  var stime = arrtime - nowtime;
                  if (stime > 3600 * 1000) {
                    item['is_gai'] = 1;
                  } else {
                    item['is_gai'] = 0;
                  }
                } else {
                  item['is_gai'] = 0;
                }
                listData[index].ArrivalTime = that.getNewtime(item.ArrivalTime)
              });
              that.setData({
                listData: this.data.listData.concat(listData)
              })
              console.log(listData)
            } else {
              var listDdata = res.data;
              console.log(listData)
              listData.forEach(function (item, index) {
                if (item.IsReservation == '100004-0000010001') {
                  var arrtime = new Date(item.ArrivalTime.replace(/-/g, '/')).getTime();
                  var nowtime = new Date().getTime();
                  var stime = arrtime - nowtime;
                  if (stime > 3600 * 1000) {
                    item['is_gai'] = 1;
                  } else {
                    item['is_gai'] = 0;
                  }
                } else {
                  item['is_gai'] = 0;
                }
                listData[index].ArrivalTime = that.getNewtime(item.ArrivalTime)
              });
              console.log(listData)
              that.setData({
                listData: listDdata
              })
            }
          }
        } else {
          if (res.code == 0) {
            if (isPage) {
              var listData = res.data
              console.log(listData)
              listData.forEach(function (item, index) {
                if (item.IsReservation == '100004-0000010001') {

                  var arrtime = new Date(item.ArrivalTime.replace(/-/g, '/')).getTime();
                  var nowtime = new Date().getTime();
                  var stime = arrtime - nowtime;
                  if (stime > 3600 * 1000) {
                    item['is_gai'] = 1;
                  } else {
                    item['is_gai'] = 0;
                  }
                } else {
                  item['is_gai'] = 0;
                }
                listData[index].ArrivalTime = that.getNewtime(item.ArrivalTime)
              });
              console.log(listData)
              that.setData({
                listData: this.data.listData.concat(listData)
              })
            } else {
              var listData = res.data
              console.log(listData)
              listData.forEach(function (item, index) {
                if (item.IsReservation == '100004-0000010001') {
                  var arrtime = new Date(item.ArrivalTime.replace(/-/g, '/')).getTime();
                  var nowtime = new Date().getTime();
                  var stime = arrtime - nowtime;
                  if (stime > 3600 * 1000) {
                    item['is_gai'] = 1;
                  } else {
                    item['is_gai'] = 0;
                  }
                } else {
                  item['is_gai'] = 0;
                }
                listData[index].ArrivalTime = that.getNewtime(item.ArrivalTime)
              });
              that.setData({
                listData: listData
              })
            }
          } else {
            that.setData({
              noOrder: true
            })
          }
        }
      }, err => {
        wx.hideLoading()
        this.setData({
          loadingFailed: true
        })
        return false;
      })
    }
  },
  getNewtime(originalDateTime) {
    var dateString = originalDateTime.replace(/-/g, '/');
    var date = new Date(dateString);
    // 获取年月日
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    // 获取小时并向下取整
    var hour = String(date.getHours()).padStart(2, '0');
    var nextHour = String(date.getHours() + 1).padStart(2, '0');

    // 组合成时间区间格式
    return `${year}-${month}-${day} ${hour}:00-${nextHour}:00`;
  },
  //查看订单详情
  orderDetail(e) {
    var formStatus = e.currentTarget.dataset.status;
    var pathStatus = e.currentTarget.dataset.dispatchlistid;
    if (formStatus == '100004-0001020002' && pathStatus != null) {
      wx.navigateTo({
        url: '/driving_status/pages/taxiDriving/taxiDriving?orderId=' + e.currentTarget.dataset.item.Id,
      })
    } else {
      wx.navigateTo({
        url: '/user_center/pages/payDetail/payDetail?from=orderList&orderId=' + e.currentTarget.dataset.item.Id,
      })
    }
  },
  cancel(e) {
    let that = this;
    var orderId = e.currentTarget.dataset.ids;
    wx.showModal({
      title: '提示',
      content: '确定取消订单吗',
      success: function (res) {
        if (res.confirm) { //这里是点击了确定以后
          wx.navigateTo({
            url: '/user_center/pages/orderCancel/orderCancel?orderId=' + orderId,
          })
        } else { //这里是点击了取消以后
        }
      }
    })
  },
  //付款
  gotopay: throttle(function(e) {
    let that = this;
    var orderId = e.currentTarget.dataset.ids;
    var user = wx.getStorageSync('userInfo');
    // wx.navigateTo({
    //   url: '/driving_status/pages/gotopay/gotopay?orderId='+orderId,
    // })
    http.getRequest('/Api/DispatchMobile/GoPayOrderRide?LayerOrder=1&Id=' + orderId + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (LayerOrderRes) => {
      console.log('请求成功', LayerOrderRes)
      if (LayerOrderRes.code == 0) {
        console.log('获取支付所需信息成功')
        var data = JSON.parse(LayerOrderRes.data);
        console.log('拉起支+付')
        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: 'MD5',
          paySign: data.paySign,
          success(paymentRes) {
            console.log('支付成功')

            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000,
              success: function () {
                console.log('1111')
                that.setSubscribeMessage();
                console.log('2222')
                setTimeout(function () {
                  console.log('3333')
                  wx.reLaunch({
                    url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + "&from=orderList"
                  })
                }, 100)
              }
            })
          },
          fail(paymentErr) {

            console.log('拉起支付失败', paymentErr)
            setTimeout(function () {
              wx.reLaunch({
                url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + "&from=orderList"
              })
            }, 1000)
          }
        })
      } else if (LayerOrderRes.code == 400 && LayerOrderRes.msg == "已付款") {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000,
          success: function () {
            that.setSubscribeMessage();
            setTimeout(function () {
              wx.reLaunch({
                url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + "&from=orderList"
              })
            }, 1000)
          }
        })
      } else {
        console.log('获取支付所需信息失败')
        wx.showToast({
          title: LayerOrderRes.msg,
          icon: 'success',
          duration: 2000,
        })
      }
    }, (LayerOrderRrr) => {
      console.log('请求失败', LayerOrderRrr)
    })
  },3000),
  setSubscribeMessage:function(){
    wx.requestSubscribeMessage({
      tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'],
      success(res) {
        if (res['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'] === 'accept') {
          console.log('用户同意接收订阅消息');
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
  isWithinOneHour(targetTimeString) {
    const now = new Date(); // 当前时间
    const targetTime = new Date(targetTimeString.replace(' ', 'T')); // 转换为 ISO 8601 格式

    // 如果目标时间无效，返回 false
    if (isNaN(targetTime.getTime())) {
      return false;
    }

    const diffMs = Math.abs(targetTime - now); // 时间差（毫秒）
    const oneHourMs = 60 * 60 * 1000; // 1 小时对应的毫秒数

    return diffMs <= oneHourMs;
  },
  onCancel() {
    console.log('点击取消')
    this.setData({
      modalShow: false
    });
  },
  onConfirm(e) {
    let that = this;

    var userinfo = wx.getStorageSync('userInfo');
    const value = e.detail.value;
    this.setData({
      inputValue: value,
      modalShow: false
    });
    console.log('用户输入：', value);
    const request = {
      "MemberId": userinfo.Id,
      "Id": that.data.orderId,
      "Mark": value
    }
    http.postRequest("/Api/DispatchMobile/RefundOrder", request, '', (res) => {
      console.log('申请退款', res)
      if (res.code == 0) {
        wx.showToast({
          title: res.msg,
          icon: 'loading',
          duration: 3000
        });
        setTimeout(function () {
          wx.redirectTo({
            url: '/user_center/pages/travelList/travelList',
          })
        }, 3000)
      } else if(res.code == 430) {
        wx.showModal({
          title: '提示',
          content: res.msg,
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showToast({
          title: '取消失败',
          icon: 'error'
        })
      }
    }, err => {
      console.log(err)
    })
  },
  tuikuan(e) {
    let that = this;
    // var orderId = that.data.orderid
    console.log(e.currentTarget.dataset.ids)

    that.setData({
      modalShow: true,
      modalValue: that.data.inputValue, // 可选：回显已有值
      orderId: e.currentTarget.dataset.ids
    });
    let data1 = e.currentTarget.dataset.time.split(' ')
    let data2 = data1[1].split('-')[0]
    let isNo = that.isWithinOneHour(data1[0] + ' ' + data2);
    if (isNo) {
      that.setData({
        prompt: "出发前一小时内取消订单将收取30%违约金，是否确认退款？"
      })
    }
    // wx.showModal({
    //   title: '提示',
    //   content: isNo?'出发前一小时内取消订单将收取30%违约金，是否确认退款？':'确定退款吗',
    //   success: function (res) {
    //     if (res.confirm) {//这里是点击了确定以后
    //       wx.navigateTo({
    //         url: '/user_center/pages/refund/refund?orderId=' + orderId,
    //       })


    //     } else {//这里是点击了取消以后
    //     }
    //   }
    // })
  },
  //开票
  toInvoice() {
    wx.navigateTo({
      url: '/user_center/pages/invoiceList/invoiceList',
    })
  },
  //多选
  onItemSelect(res) {
    let _this = this;
    _this.data.listData.forEach((item) => {
      item.checked = true;
    })
  },
  checkboxAll() {

  },
  checkboxPageAll() {

  },
  goinvoice() {
    wx.navigateTo({
      url: '/user_center/pages/invoice/invoice',
    })
  },
  //评价
  toComment(e) {
    var orderId = e.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '/driving_status/pages/comment/comment?orderId=' + orderId,
    })
  },
  // changeDateTime(e) {
  //   this.setData({
  //     dateTime: e.detail.value
  //   });
  //   var arr = this.data.dateTime,
  //   dateArr = this.data.dateTimeArray;
  //   // arr[e.detail.column] = e.detail.value;
  //   dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
  //   var estimate_in_time = `${dateArr[0][arr[0]]}-${dateArr[1][arr[1]]}-${dateArr[2][arr[2]]} ${dateArr[3][arr[3]]}:${dateArr[4][arr[4]]}`;
  //   var nowtime = new Date();
  //   var timestp = nowtime.getTime();
  //   var checktime = new Date(estimate_in_time.replace(/-/g, '/')).getTime();
  //   console.log(checktime);
  //   if(checktime>timestp){
  //     this.setData({
  //       dateTimeArray: dateArr,
  //       dateTime: arr,
  //       estimate_in_time,
  //     });
  //   }else{
  //     wx.showToast({
  //       title: '您选择的出发时间不正确，请重新选择',
  //       icon:'none',
  //       duration:2000
  //     })
  //   }
  // },
  toEditTime(e) {
    var item = e.currentTarget.dataset.item;
    let that = this;
    if (item.IsReservation == '100004-0000010002' || !item.IsReservation) {
      wx.showModal({
        title: '确认',
        content: '该订单修改出发时间后会变成预约单，是否确认',
        success(res) {
          if (res.confirm) {
            that.setData({
              showEdit: true,
              orderid: item.Id,
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      that.setData({
        showEdit: true,
        orderid: item.Id,
      })
    }
  },
  closePopup() {
    this.setData({
      showEdit: false
    })
  },
  bindConfirm() {
    let that = this;
    var orderId = that.data.orderid;
    var times = that.data.startDate1;
    if (!times) {
      wx.showToast({
        title: '请选择出发时间',
        icon: 'none',
        duration: 2000
      })
    }
    http.getRequest("/Api/DispatchMobile/changeRideTicketTime?orderId=" + orderId + "&startTime=" + times, '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000,
          success: function () {
            that.setData({
              showEdit: false,
              estimate_in_time: ''
            })
            that.getFormTypeId();
          }
        })
      }
    }, err => {
      console.log(err)
    })
  },
  // 时间限制请求
  dateReq() {
    let data = {
      "appointmentTime": 1,
      "appointmentDay": 3,
      "ridingTimeStart": "00:00:00",
      "ridingTimeEnd": "23:59:59"
    }
    this.setData({
      dateReqInfo: data
    })
  },
  // 预约日期
  pickerTap: function () {
    this.dateReq();
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    let day1 = (date.getMonth() + 1) + "月" + date.getDate() + "日" + ' ' + '今天';
    let day2 = (new Date(date.getTime() + 24 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 24 * 3600000).getDate() + "日" + ' ' + '明天';
    let day3 = (new Date(date.getTime() + 48 * 3600000).getMonth() + 1) + "月" + new Date(date.getTime() + 48 * 3600000).getDate() + "日" + ' ' + '后天';
    var monthDay = [day1, day2, day3];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    // 月-日
    let maxDate = this.data.dateReqInfo.appointmentDay;
    if (maxDate >= 4) {
      for (var i = 3; i <= maxDate - 1; i++) {
        var date1 = new Date(date);
        date1.setDate(date.getDate() + i);
        var md = (date1.getMonth() + 1) + "月" + date1.getDate() + "日" + " " + weekday[date1.getDay()];
        monthDay.push(md);
      }
    } else if (maxDate == 2) {
      monthDay = ['今天', '明天'];
    } else if (maxDate == 1) {
      monthDay = ['今天'];
    }

    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };

    if (data.multiIndex[0] === 0) {
      if (data.multiIndex[1] === 0) {
        this.loadData(hours, minute);
      } else {
        this.loadMinute(hours, minute);
      }
    } else {
      this.loadHoursMinute(hours, minute);
    }
    hours = hours.map(val => {
      return val + '点'
    })

    minute = minute.map(val => {
      return val + '分'
    })
    data.multiArray[0] = monthDay;
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },
  bindMultiPickerColumnChange: function (e) {
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    var that = this;
    var monthDay = ['今天', '明天', '后天'];
    var hours = [];
    var minute = [];
    currentHours = date.getHours();
    currentMinute = date.getMinutes();
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    // 把选择的对应值赋值给 multiIndex
    data.multiIndex[e.detail.column] = e.detail.value;
    // 然后再判断当前改变的是哪一列,如果是第1列改变
    if (e.detail.column === 0) {
      // 如果第一列滚动到第一行
      if (e.detail.value === 0) {

        that.loadData(hours, minute);

      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[1] = 0;
      data.multiIndex[2] = 0;
      // 如果是第2列改变
    } else if (e.detail.column === 1) {
      // 如果第一列为今天
      if (data.multiIndex[0] === 0) {
        if (e.detail.value === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
        // 第一列不为今天
      } else {
        that.loadHoursMinute(hours, minute);
      }
      data.multiIndex[2] = 0;
      // 如果是第3列改变
    } else {
      // 如果第一列为'今天'
      if (data.multiIndex[0] === 0) {
        // 如果第一列为 '今天'并且第二列为当前时间
        if (data.multiIndex[1] === 0) {
          that.loadData(hours, minute);
        } else {
          that.loadMinute(hours, minute);
        }
      } else {
        that.loadHoursMinute(hours, minute);
      }
    }
    hours = hours.map(val => {
      return val + ' 点'
    })
    minute = minute.map(val => {
      return val + ' 分'
    })
    data.multiArray[1] = hours;
    data.multiArray[2] = minute;
    this.setData(data);
  },

  loadData: function (hours, minute) {
    var minuteIndex;
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = 0; i < 60; i += 10) {
        minute.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i < 24; i++) {
        hours.push(i);
      }
      // 分
      for (var i = minuteIndex; i < 60; i += 10) {
        minute.push(i);
      }
    }
  },

  loadHoursMinute: function (hours, minute) {
    let start = this.data.dateReqInfo.ridingTimeStart.split(':');
    let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
    // 时
    for (var i = parseInt(start[0]); i <= parseInt(end[0]); i++) {
      hours.push(i);
    }
    // 分
    for (var i = parseInt(start[1]); i <= parseInt(end[1]); i += 10) {
      minute.push(i);
    }
  },

  loadMinute: function (hours, minute) {
    var minuteIndex;
    let end = this.data.dateReqInfo.ridingTimeEnd.split(':');
    if (currentMinute > 0 && currentMinute <= 10) {
      minuteIndex = 10;
    } else if (currentMinute > 10 && currentMinute <= 20) {
      minuteIndex = 20;
    } else if (currentMinute > 20 && currentMinute <= 30) {
      minuteIndex = 30;
    } else if (currentMinute > 30 && currentMinute <= 40) {
      minuteIndex = 40;
    } else if (currentMinute > 40 && currentMinute <= 50) {
      minuteIndex = 50;
    } else {
      minuteIndex = 60;
    }

    if (minuteIndex == 60) {
      // 时
      for (var i = currentHours + 1; i <= parseInt(end[0]); i++) {
        hours.push(i);
      }
    } else {
      // 时
      for (var i = currentHours; i <= parseInt(end[0]); i++) {
        hours.push(i);
      }
    }
    // 分
    for (var i = 0; i <= parseInt(end[1]); i += 10) {
      minute.push(i);
    }
  },

  bindStartMultiPickerChange: function (e) {
    var that = this;
    let d = new Date().getTime() + (this.data.dateReqInfo.appointmentTime * 60000);
    date = new Date(d);
    var monthDay = that.data.multiArray[0][e.detail.value[0]];
    var hours = that.data.multiArray[1][e.detail.value[1]];
    var minute = that.data.multiArray[2][e.detail.value[2]];
    var globalMonthDay;

    if (monthDay.split(' ')[1] === "今天") {
      var month = date.getMonth() + 1;
      var day = date.getDate();
      monthDay = month + "月" + day + "日";
      globalMonthDay = date.getFullYear() + '-' + month + "-" + day
    } else if (monthDay.split(' ')[1] === "明天") {
      var date1 = new Date(date);
      date1.setDate(date.getDate() + 1);
      monthDay = (date1.getMonth() + 1) + "月" + date1.getDate() + "日";
      globalMonthDay = date.getFullYear() + '-' + (date1.getMonth() + 1) + "-" + date1.getDate()

    } else if (monthDay.split(' ')[1] === "后天") {
      var date2 = new Date(date);
      date2.setDate(date.getDate() + 2);
      monthDay = (date2.getMonth() + 1) + "月" + date2.getDate() + "日";
      globalMonthDay = date.getFullYear() + '-' + (date2.getMonth() + 1) + "-" + date2.getDate()

    } else {
      var month = monthDay.split("月")[0]; // 返回月
      var day = monthDay.split("月")[1].split("日")[0]; // 返回日
      globalMonthDay = date.getFullYear() + '-' + month + "-" + day
    }
    let resHours = parseInt(hours) < 10 ? '0' + parseInt(hours) : parseInt(hours);
    let resMinute = parseInt(minute) < 10 ? '0' + parseInt(minute) : parseInt(minute);
    var startDate = monthDay + " " + resHours + ":" + resMinute;
    var startDate1 = globalMonthDay + " " + resHours + ":" + resMinute;
    that.setData({
      startDate: startDate,
      startDate1: startDate1
    })
  },
  menuTap: function (e) {
    var current = e.currentTarget.dataset.current; //获取到绑定的数据
    this.setData({
      menuTapCurrent: current,
      listData: [],
      pageNo: 1
    });
    this.getOrderList(true, this.data.FormTypeId);
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading();
    this.setData({
      loading: true,
      listData: [],
      pageNo: 1
    });
    this.getOrderList(true, this.data.FormTypeId);
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
})