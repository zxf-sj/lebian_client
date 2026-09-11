// user_center/pages/invoice/invoice.js
// pages/form/form.js
import http from '../../../utils/http';
const debounce = require('../../../utils/debounce');
Page({
  data: {
    // 表单数据绑定
    Title: '',
    TaxID: '',
    Bank: '',
    BankAccount: '',
    Address: '',
    Telephone: '',
    personList: [{
      PassengerName: '',
      IDNumber: '',
    }],
    travelDate: '',
    departure: '',
    destination: '',
    orderAmount: '',
    Email: '',
    Note: '',
    orderNumber: '',
    pop_show: false,
    dataList: '',
    isShow: undefined,
    type: '',
    orderId: '',
    isSubmitting: false,
    items: [{
        value: 'PERPp',
        name: '个人普票'
      },
      {
        value: 'LtdPp',
        name: '企业普票',
        checked: true
      },
      {
        value: 'LtdZp',
        name: '企业专票'
      },
    ],
    invoiceFormat: [{
      value: 'PDF',
      name: 'PDF',
      checked: true
    },
    {
      value: 'OFD',
      name: 'OFD',
    },
    {
      value: 'XML',
      name: 'XML'
    },
  ],
    INVType: 'LtdPp',
    isMultiSelect: false, // 默认单张模式
    FileExt:1
  },
  onLoad: function (options) {
    this.setData({
      orderNumber: options.ids,
      orderAmount: options.totalAmount,
      type: options.type || '',
      orderId: options.orderId
    })
  },
  onShow() {
    this.getList()
    let HeaderType = '100004-0001350002';
    let InvoiceType = '100004-0001340001';
    let IsMultiple = '100004-0000010002'
    this.setdefaultData(HeaderType,InvoiceType,IsMultiple)
  },
  // 切换单张/多张模式
  toggleSelectMode(e) {
  
    const isChecked = e.detail.value; // 获取开关当前状态 (true/false)
    let HeaderType = '100004-0001350001';
    let IsMultiple = '';
    if(e.detail.value) {
      IsMultiple = '100004-0000010001';
    } else {
      IsMultiple = '100004-0000010002';
    }
    let InvoiceType = '100004-0001340001'
    this.setdefaultData(HeaderType,InvoiceType,IsMultiple)
    this.setData({
      isMultiSelect: isChecked
    });
  },
  handleAdd() {
    let _this = this;
    let newList = _this.data.personList
    newList.push({
      PassengerName: '',
      IDNumber: '',
    })
    _this.setData({
      personList: newList
    })
    console.log(_this.data.personList)
  },
  handleReduce() {
    let newList = this.data.personList
    newList.pop()
    this.setData({
      personList: newList
    })
  },
  InvoiceChange(res) {
    console.log(res.detail.value)
    let FileExt = 1
    if(res.detail.value == 'PDF') {
      FileExt = 1
    } else if(res.detail.value == 'OFD') {
      FileExt = 2
    }else if(res.detail.value == 'XML') {
      FileExt = 3
    }
    this.setData({
      FileExt:FileExt
    })
  },
  radioChange(res) {
    console.log(res.detail.value)
    if(res.detail.value == 'PERPp') {
      let HeaderType = '100004-0001350001';
      let InvoiceType = '100004-0001340001';
      let IsMultiple = '100004-0000010002'
      this.setdefaultData(HeaderType,InvoiceType,IsMultiple)
    } else if(res.detail.value == 'LtdPp') {
      let HeaderType = '100004-0001350002';
      let InvoiceType = '100004-0001340001';
      let IsMultiple = '100004-0000010002'
      this.setdefaultData(HeaderType,InvoiceType,IsMultiple)
    } else if(res.detail.value == 'LtdZp') {
      let HeaderType = '100004-0001350002';
      let InvoiceType = '100004-0001340002';
      let IsMultiple = '100004-0000010002'
      this.setdefaultData(HeaderType,InvoiceType,IsMultiple)
    }
    this.setData({
      MemberId: '',
      Title: '',
      TaxID: '',
      Bank: '',
      BankAccount: '',
      Address: '',
      Telephone: '',
      personList: [{
        PassengerName: '',
        IDNumber: '',
      }],
      travelDate: '',
      departure: '',
      destination: '',
      orderAmount: '',
      Email: '',
      Note: ''
    });
    this.setData({
      INVType: res.detail.value
    })
  },
  setdefaultData(HeaderType,InvoiceType,IsMultiple) {
    let _this = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        listData: false,
        noOrder: true
      })
    } else {
      wx.showLoading({
        title: '',
      })
      var usreinfo = wx.getStorageSync('userInfo');
      let Id = usreinfo.Id
      http.getRequest("/api/DispatchMobile/GetLastMemberCompanyInfo?MemberId=" + Id + '&HeaderType=' + HeaderType + '&InvoiceType=' + InvoiceType + "&IsMultiple=" + IsMultiple, '', '', res => {
        wx.hideLoading()
        if (res.code == 0) {
          let persons = []
          let PassengerNamelist = res.data.PassengerName.split(',')
          let TaxIDlist = res.data.IDNumber.split(',')
          PassengerNamelist.forEach((item,index) => {
            persons.push({
              PassengerName: PassengerNamelist[index],
              IDNumber: TaxIDlist[index],
            })
          })
          _this.setData({
            Title: res.data.Title,
            TaxID: res.data.TaxID,
            Bank: res.data.Bank,
            BankAccount: res.data.BankAccount,
            Address: res.data.Address,
            Telephone: res.data.Telephone,
            dataList: res.data.dataList,
            IDNumber: res.data.IDNumber,
            PassengerName: res.data.PassengerName,
            personList: persons,
            Email: res.data.Email
          })
        }

      })
    }
  },
  handleClick(e) {
    let _this = this;
    _this.setData({
      isShow: e.currentTarget.dataset.index
    })
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        listData: false,
        noOrder: true
      })
    } else {
      wx.showLoading({
        title: '',
      })
      let Id = e.currentTarget.dataset.id
      http.getRequest("/api/DispatchMobile/GetMemberCompanyInfo?Id=" + Id, '', '', res => {
        wx.hideLoading()
        _this.setData({
          Title: res.data.Name,
          TaxID: res.data.TaxID,
          Bank: res.data.Bank,
          BankAccount: res.data.BankAccount,
          Address: res.data.Address,
          Telephone: res.data.Telephone,
          dataList: res.data.dataList
        })
      }, err => {
        wx.hideLoading()
        return false;
      })
    }
  },
  // 日期选择器事件
  onDateChange(e) {
    this.setData({
      travelDate: e.detail.value
    });
  },
  handeleAdd() {
    wx.navigateTo({
      url: '/user_center/pages/invoiceTemplate/invoiceTemplate',
    })
  },
  getList() {

    let _this = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        listData: false,
        noOrder: true
      })
    } else {
      wx.showLoading({
        title: '',
      })
      var usreinfo = wx.getStorageSync('userInfo');
      // MemberId
      http.getRequest("/api/DispatchMobile/GetMemberCompanyList?MemberId=" + usreinfo.Id, '', '', res => {
        wx.hideLoading()
        _this.setData({
          dataList: res.data
        })
      }, err => {
        wx.hideLoading()
        return false;
      })
    }
  },
  // 提交表单
  onSubmit: debounce(function (e) {
    let _this = this;
    _this.setData({
      isSubmitting: true
    })
    console.log('进来了',e)
 
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        listData: false,
        noOrder: true
      })
    } else {
      const formData = e.detail.value;
      var usreinfo = wx.getStorageSync('userInfo');
      // 必填字段校验
      if (_this.data.INVType == 'LtdPp') {
        if (!formData.Title.trim()) {
          wx.showToast({
            title: '请填写发票抬头',
            icon: 'none'
          });
          return;
        }
        if (!formData.TaxID.trim()) {
          wx.showToast({
            title: '请填写单位税号',
            icon: 'none'
          });
          return;
        }
        if (_this.data.INVType == 'LtdZp') {
          if (!formData.Bank.trim()) {
            wx.showToast({
              title: '请填写开户银行',
              icon: 'none'
            });
            return;
          }
          if (!formData.BankAccount.trim()) {
            wx.showToast({
              title: '请填写银行账号',
              icon: 'none'
            });
            return;
          }
          if (!formData.Address.trim()) {
            wx.showToast({
              title: '请填写单位地址',
              icon: 'none'
            });
            return;
          }
          if (!formData.Telephone.trim()) {
            wx.showToast({
              title: '请填写单位电话',
              icon: 'none'
            });
            return;
          }
        }

      }
      const {
        personList
      } = _this.data;
      // 遍历 personList，检查是否每一项都填写了信息
      for (let i = 0; i < personList.length; i++) {
        const item = personList[i];

        // 1. 校验姓名
        if (!item.PassengerName || !item.PassengerName.trim()) {
          wx.showToast({
            title: `请输入第 ${i + 1} 位出行人的姓名`,
            icon: 'none'
          });
          return; // 只要有一个没填，直接中断提交
        }

        // 2. 校验身份证
        if (!item.IDNumber || !item.IDNumber.trim()) {
          wx.showToast({
            title: `请输入第 ${i + 1} 位出行人的身份证`,
            icon: 'none'
          });
          return;
        }

        // 3. (可选) 身份证格式正则校验
        const idReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (!idReg.test(item.IDNumber)) {
          wx.showToast({
            title: `第 ${i + 1} 位出行人的身份证格式不正确`,
            icon: 'none'
          });
          return;
        }
      }
      if (formData.Email && !this.isValidEmail(formData.Email)) {
        wx.showToast({
          title: '邮箱格式不正确',
          icon: 'none'
        });
        return;
      }
      // 提取所有的 PassengerName 并拼接
      const nameStr = _this.data.personList.map(item => item.PassengerName).join(',');

      // 提取所有的 IDNumber 并拼接
      const idStr = _this.data.personList.map(item => item.IDNumber).join(',');
      console.log(idStr)
      let IsMultiple = ''
      if (_this.data.isMultiSelect) {
        IsMultiple = '100004-0000010001'
      } else {
        IsMultiple = '100004-0000010002'
      }
      let params = {
        MemberId: usreinfo.Id,
        orderNumber: _this.data.orderNumber,
        Title: formData.Title,
        TaxID: formData.TaxID,
        Bank: formData.Bank,
        BankAccount: formData.BankAccount,
        Address: formData.Address,
        Telephone: formData.Telephone,
        PassengerName: nameStr,
        IDNumber: idStr,
        Email: formData.Email,
        Note: formData.Note,
        IsMultiple: IsMultiple,
        FileExt:_this.data.FileExt
      }
      // 所有校验通过，可以提交数据
      wx.showLoading({
        title: '',
      })
      if (_this.data.INVType == "PERPp") {
        params['InvoiceType'] = '100004-0001340001';
        params['InvoiceHeaderType'] = '100004-0001350001'
        params['Title'] = nameStr;
        params['TaxID'] = idStr
      } else if (_this.data.INVType == "LtdPp") {
        params['InvoiceType'] = '100004-0001340001'
        params['InvoiceHeaderType'] = '100004-0001350002'
      } else if (_this.data.INVType == "LtdZp") {
        params['InvoiceType'] = '100004-0001340002'
        params['InvoiceHeaderType'] = '100004-0001350002'
      }
      if (_this.data.type == "重新开票") {
        params['Id'] = _this.data.orderId
        http.postRequest("/api/DispatchMobile/UpdataMemberInvoice", params, wx.getStorageSync('header'), res => {
          wx.hideLoading()
          if (res.code == 0) {
            wx.showToast({
              title: '提交成功',
              icon: 'success'
            });
            setTimeout(function () {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 1000);
          } else if (res.code == 400) {
            wx.reLaunch({
              title: res.msg,
              icon: 'success'
            });
          }
        }, err => {
          wx.hideLoading()
          return false;
        })
      } else {
        console.log(params)
        
        http.postRequest("/api/DispatchMobile/SaveMemberInvoice", params, wx.getStorageSync('header'), res => {
          wx.hideLoading()
          _this.setData({
            isSubmitting: false
          })
          if (res.code == 0) {
            wx.showToast({
              title: '提交成功',
              icon: 'success'
            });
            setTimeout(function () {
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }, 1000);

          } else if (res.code == 400) {
            wx.showToast({
              title: res.msg,
            });
          }
        }, err => {
          wx.hideLoading()
          _this.setData({
            isSubmitting: false
          })
          return false;
        })
      }
    }
  }, 500),
  handleModel() {
    this.setData({
      pop_show: true,
    })
  },
  pop_close() {
    this.setData({
      pop_show: false,
    })
  },
  // 监听姓名输入
  onNameInput(e) {
    console.log(e)
    const index = e.currentTarget.dataset.index; // 获取当前项的下标
    const value = e.detail.value; // 获取输入的值
    // 使用路径语法精准更新对应项的姓名
    this.setData({
      [`personList[${index}].PassengerName`]: value
    });
  },

  // 监听身份证输入
  onIdInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    this.setData({
      [`personList[${index}].IDNumber`]: value
    });
  },
  // 重置表单
  onReset() {
    this.setData({
      MemberId: '',
      Title: '',
      TaxID: '',
      Bank: '',
      BankAccount: '',
      Address: '',
      Telephone: '',
      personList: [{
        PassengerName: '',
        IDNumber: '',
      }],
      travelDate: '',
      departure: '',
      destination: '',
      orderAmount: '',
      Email: '',
      Note: ''
    });
    wx.showToast({
      title: '已重置',
      icon: 'none'
    });
  },

  // 验证邮箱
  isValidEmail(Email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Email);
  }
});