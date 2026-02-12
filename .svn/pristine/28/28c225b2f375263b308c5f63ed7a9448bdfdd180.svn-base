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
        PassengerName: '',
        IDNumber: '',
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
        type:'',
        orderId:'',
        isSubmitting:false,
        items: [
            {value: 'PERPp', name: '个人普票'},
            {value: 'LtdPp', name: '企业普票', checked: true},
            {value: 'LtdZp', name: '企业专票'},
          ],
        INVType:'LtdPp'
    },
    onLoad: function (options) {
        this.setData({
            orderNumber: options.ids,
            orderAmount: options.totalAmount,
            type:options.type || '',
            orderId:options.orderId
        })
    },
    onShow() {
        this.getList()
        this.setdefaultData()
    },
    radioChange(res) {
        console.log(res.detail.value)
        this.setData({
            INVType:res.detail.value
        })
    },
    setdefaultData() {
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
            http.getRequest("/api/DispatchMobile/GetLastMemberCompanyInfo?MemberId=" + Id, '', '', res => {
                wx.hideLoading()
                if(res.code == 0 ) {
                    _this.setData({
                        Title: res.data.Title,
                        TaxID: res.data.TaxID,
                        Bank: res.data.Bank,
                        BankAccount: res.data.BankAccount,
                        Address: res.data.Address,
                        Telephone: res.data.Telephone,
                        dataList: res.data.dataList,
                        IDNumber:res.data.IDNumber,
                        PassengerName:res.data.PassengerName,
                        Email:res.data.Email
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
    onSubmit:debounce(function (e) {
        let _this = this;
        _this.setData({
            isSubmitting:true
        })
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
                if(_this.data.INVType == 'LtdPp') {
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
                    if(_this.data.INVType == 'LtdZp') {
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
                
                
            if (!formData.PassengerName.trim()) {
                wx.showToast({
                    title: '请填写出行人姓名',
                    icon: 'none'
                });
                return;
            }
            if (!formData.IDNumber.trim() || !this.isValidIdCard(formData.IDNumber)) {
                wx.showToast({
                    title: '请填写正确的身份证号码',
                    icon: 'none'
                });
                return;
            }
            if (formData.Email && !this.isValidEmail(formData.Email)) {
                wx.showToast({
                    title: '邮箱格式不正确',
                    icon: 'none'
                });
                return;
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
                PassengerName: formData.PassengerName,
                IDNumber: formData.IDNumber,
                Email: formData.Email,
                Note: formData.Note,
            }
            // 所有校验通过，可以提交数据
            wx.showLoading({
                title: '',
            })
            if( _this.data.INVType == "PERPp") {
                params['InvoiceType'] = '100004-0001340001';
                params['InvoiceHeaderType'] = '100004-0001350001'
                params['Title'] = params.PassengerName;
                params['TaxID'] =  params.IDNumber
            } else if(_this.data.INVType == "LtdPp") {
                params['InvoiceType'] = '100004-0001340001'
                params['InvoiceHeaderType'] = '100004-0001350002'
            }else if(_this.data.INVType == "LtdZp") {
                params['InvoiceType'] = '100004-0001340002'
                params['InvoiceHeaderType'] = '100004-0001350002'
            }
            if(_this.data.type == "重新开票") {
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
                http.postRequest("/api/DispatchMobile/SaveMemberInvoice", params, wx.getStorageSync('header'), res => {
                    wx.hideLoading()
                    _this.setData({
                        isSubmitting:false
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
                            icon: 'success'
                        });
                    }
                }, err => {
                    wx.hideLoading()
                    _this.setData({
                        isSubmitting:false
                    })
                    return false;
                })
            }
        }
    },500),
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
            PassengerName: '',
            IDNumber: '',
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

    // 验证手机号
    // isValidPhone(orderAmount) {
    //   return /^1[3-9]\d{9}$/.test(orderAmount);
    // },

    // 验证身份证
    isValidIdCard(IDNumber) {
        return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(IDNumber);
    },

    // 验证邮箱
    isValidEmail(Email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(Email);
    }
});