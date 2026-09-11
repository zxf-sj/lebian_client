// user_center/pages/busOrder/busOrder.js
// pages/order-confirm/order-confirm.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({
  data: {
    // 模拟行程数据
    tripInfo: {
      startStation: '太平园地铁站F口',
      endStation: '什邡市烟厂调拨站宿舍(通站西路北)',
      date: '7月19日 (后天)',
      time: '07:40',
      remainTickets: 6,
      cancelRule: '07月19日 06:40前免费取消'
    },

    // 模拟已选乘客数据
    passengers: [],
    // 联系人数据
    contactName: '李慧娟',
    contactPhone: '13833665341',

    // 价格计算
    ticketPrice: 50, // 假设单价
    totalPrice: 50,
    startingStation: '',
    terminal: '',
    buslineId: '',
    busDay: '',
    time: '',
    id: '',
    showPopup: false,
    name: '',
    phone: '',
    nameError: '',
    phoneError: '',
    remark:''
  },

  onLoad(options) {
    // 可以在这里接收上一页传参，动态修改 tripInfo
    console.log(options)
    let startingStation = JSON.parse(options.startingStation)
    let terminal = JSON.parse(options.terminal)
    let buslineId = options.buslineId
    let busDay = options.busDay
    let time = options.time.split("-")[0]
    let id = options.id
    this.setData({
      startingStation,
      terminal,
      buslineId,
      busDay,
      time,
      id
    })
  },

  // 添加乘车人逻辑
  addPassenger() {
    let _this = this;

    // let passengers = _this.data.passengers;
    // passengers.push({
    //   id: '',
    //   name: '',
    //   idCard: ''
    // })
    // _this.setData({
    //   passengers
    // })
  },

  // 删除乘客
  removePassenger(e) {
    const index = e.currentTarget.dataset.index;
    const passengers = this.data.passengers;

    wx.showModal({
      title: '提示',
      content: '确定删除该乘车人吗？',
      success: (res) => {
        if (res.confirm) {
          passengers.splice(index, 1);
          this.setData({
            passengers,
            totalPrice: passengers.length * this.data.ticketPrice
          });
        }
      }
    });
  },

  // 选择联系人
  chooseContact() {
    // 实际开发中通常是调用微信地址簿或从常用联系人选
    console.log('选择联系人');
  },

  // 提交订单
  submitOrder() {
    let _this = this;

    if (this.data.passengers.length === 0) {
      wx.showToast({
        title: '请添加乘车人',
        icon: 'none'
      });
      return;
    }
    if (!this.data.contactPhone) {
      wx.showToast({
        title: '请填写联系人',
        icon: 'none'
      });
      return;
    }

    console.log('提交订单', this.data);
    // 发起网络请求...
    var userinfo = wx.getStorageSync('userInfo');
    if(!userinfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return
    }
    let passengers = _this.data.passengers
    let PersonalIds = ''
    for(let i=0;i<passengers.length;i++) {
      PersonalIds += passengers[i].name + '|' + passengers[i].phone
    }
    wx.request({
      url: baseUrl + "/api/BusMobile/Create",
      data: {
        MemberId:userinfo.Id,
        LineId:_this.data.buslineId,
        ArrivalTime:_this.data.busDay + ' ' + _this.data.time,
        ScheduleId:Number(_this.data.id),
        PassengerPhone:"17601636466",
        PersonalIds:PersonalIds,
        Remark:_this.data.remark,
        Statinglocation:_this.data.startingStation.Id,
        EndLocation:_this.data.terminal.Id,
      },
      method: "POST",
      success: (res) => {
        console.log(res)
      },
    });

  },
  handleStart() {
    wx.navigateTo({
      url: '/user_center/pages/booking/booking',
    })
  },
  handleEnd() {
    wx.navigateTo({
      url: '/user_center/pages/booking/booking',
    })
  },
  // 打开弹框
  openPopup() {
    this.setData({
      showPopup: true
    });
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      name: e.detail.value,
      nameError: ''
    });
  },

  // 电话输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value,
      phoneError: ''
    });
  },

  // 验证
  validate() {
    const {
      name,
      phone
    } = this.data;
    let valid = true;

    if (!name.trim()) {
      this.setData({
        nameError: '请输入姓名'
      });
      valid = false;
    } else if (name.trim().length < 2) {
      this.setData({
        nameError: '姓名至少2个字符'
      });
      valid = false;
    }

    if (!phone) {
      this.setData({
        phoneError: '请输入手机号'
      });
      valid = false;
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({
        phoneError: '手机号格式不正确'
      });
      valid = false;
    }

    return valid;
  },

  // 确定
  onConfirm() {
    if (!this.validate()) return;
    let _this = this;
    let passengers = _this.data.passengers;
    passengers.push({
      name:this.data.name,
      phone:this.data.phone
    })
    _this.setData({
      passengers,
      name:'',
      phone:''
    })

    // 这里做提交逻辑
   
    this.onCancel();
  },

  // 取消 / 关闭
  onCancel() {
    this.setData({
      showPopup: false,
      name: '',
      phone: '',
      nameError: '',
      phoneError: ''
    });
  },
  onInput(e) {
    this.setData({
      remark: e.detail.value  // e.detail.value 就是当前输入框的值
    });
  },
});