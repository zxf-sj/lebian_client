// driving_status/pages/peizhenPay/peizhenPay.js
import http from '../../../utils/http';
import time from '../../../utils/time';
Page({
  data: {
    hospital: '',
    consultType: '',
    phone: '',
    consultTypes: [], // 底部弹框的选项
    typeIndex: 0
  },
  onLoad(options) {
  },
  onShow() {
    this.getType()
  },
  getType() {
    let _this = this;
    http.postRequest("/api/DriverApp/GetPatientTypeList", '', wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        console.log(res)
        _this.setData({
          consultTypes:res.data
        })
      }
    }, err => {
      console.log(err)
    })
  },
  // 监听底部弹框选择事件
  onTypeChange(e) {
    const index = e.detail.value; // 获取选中的索引
    const selectedItem = this.data.consultTypes[index]; // 根据索引获取完整对象
    this.setData({
      typeIndex: index,
      consultType: selectedItem.Text, // 用于页面展示
      consultValue: selectedItem.Value // 用于业务逻辑或提交给后端
    });
  },

  // 表单提交
  handleSubmit(e) {
    const { hospital, consultValue, phone } = this.data;
    console.log(hospital, consultValue, phone)
    // 简单的表单验证
    if (!hospital || !consultValue || !phone) {
      wx.showToast({ title: '请完善表单信息', icon: 'none' });
      return;
    }
    
    if (phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    var userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    const currentTime = time.getCurrentTime();
    console.log(userInfo)
    let data = {   
      "ArrivalTime": currentTime,
      "CreateUserId": userInfo.Id,   
      "PersonalIds": phone,
      "OffLocation":hospital,
      "Note": "",
      "PatientType": consultValue
  }
    http.postRequest("/api/DriverApp/CreatePatientOrder", data, wx.getStorageSync('header'), res => {
      if (res.code == 0) {
        console.log(res)
        wx.showToast({ title: '提交成功', icon: 'success' });
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }, 300);
      }
    }, err => {
      console.log(err)
    })
    
    
    // TODO: 在这里调用 wx.request 将数据提交到后端接口
  }
})