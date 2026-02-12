// user_center/pages/invoiceTemplate/invoiceTemplate.js
// user_center/pages/invoice/invoice.js
// pages/form/form.js
import http from '../../../utils/http';
Page({
    data: {
      // 表单数据绑定
      Title: '',
      TaxID: '',
      Bank: '',
      BankAccount: '',
      Address: '',
      Telephone: '',
      btn:'保存',
      Id:''
    },
    onLoad: function (options) {
        let _this = this;
        if(options.Id) {
            _this.setData({
                btn:"修改",
                Id:options.Id
            })
            _this.getData(options.Id)
        } else {
            _this.setData({
                btn:"保存"
            })
        }
      },
    // 日期选择器事件
    onDateChange(e) {
      this.setData({
        travelDate: e.detail.value
      });
    },
    getData(Id) {
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
            http.getRequest("/api/DispatchMobile/GetMemberCompanyInfo?Id=" + Id, '', '', res => {
                wx.hideLoading()
                _this.setData({
                    Title: res.data.Name,
                    TaxID: res.data.TaxID,
                    Bank: res.data.Bank,
                    BankAccount: res.data.BankAccount,
                    Address: res.data.Address,
                    Telephone: res.data.Telephone,
                    dataList:res.data.dataList
                })
            }, err => {
                wx.hideLoading()
                return false;
            })
        }
    },
    // 提交表单
    onSubmit(e) {
    let _this = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      that.setData({
        listData:false,
        noOrder:true
      })
    }else {
        const formData = e.detail.value;
        var usreinfo = wx.getStorageSync('userInfo');
        // 必填字段校验
        if (!formData.Title.trim()) {
          wx.showToast({ title: '请填写发票抬头', icon: 'none' });
          return;
        }
        if (!formData.TaxID.trim()) {
          wx.showToast({ title: '请填写单位税号', icon: 'none' });
          return;
        }
        let params = {
            MemberId:usreinfo.Id,
            orderNumber:_this.data.orderNumber,
            Title:formData.Title,//
            TaxID:formData.TaxID,//
            Bank:formData.Bank,
            BankAccount:formData.BankAccount,
            Address:formData.Address,
            Telephone:formData.Telephone,
        }
        // 所有校验通过，可以提交数据
        wx.showLoading({
            title: '',
          })
          if(_this.data.btn == "保存") {
            http.postRequest("/api/DispatchMobile/SaveMemberCompany", params, wx.getStorageSync('header'), res => {
                wx.hideLoading()
                if(res.code == 0) {
                  wx.showToast({
                      title: '提交成功',
                      icon: 'success'
                  });
                  setTimeout(function() {
                      // 返回上一页
                      wx.navigateBack({
                          delta: 1
                      })
                  }, 1000);
                 
                } else if(res.code == 400) {
                  wx.showToast({
                      title: res.msg,
                      icon: 'success'
                  });
                }
              }, err => {
                wx.hideLoading()
                return false;
              })
          } else if(_this.data.btn == "修改") {
            params["Id"] = _this.data.Id
            http.postRequest("/api/DispatchMobile/UpdateMemberCompany", params, wx.getStorageSync('header'), res => {
                wx.hideLoading()
                if(res.code == 0) {
                  wx.showToast({
                      title: '修改成功',
                      icon: 'success'
                  });
                  setTimeout(function() {
                      // 返回上一页
                      wx.navigateBack({
                          delta: 1
                      })
                  }, 1000);
                } else if(res.code == 400) {
                  wx.showToast({
                      title: res.msg,
                      icon: 'success'
                  });
                }
              }, err => {
                wx.hideLoading()
                return false;
              })
          }
       
       
    
        // 这里可以调用后端 API 提交数据
        // wx.request({...})
    }
     
    },
    handleModel() {
        console.log('修改')
        this.setData({
            pop_show:true,
        })
    },
    pop_close() {
        this.setData({
            pop_show:false,
        })
    },
    // 重置表单
    onReset() {
      this.setData({
        MemberId:'',
        Title: '',
        TaxID: '',
        Bank: '',
        BankAccount: '',
        Address: '',
        Telephone: '',
      });
      wx.showToast({ title: '已重置', icon: 'none' });
    },
  
  });
  