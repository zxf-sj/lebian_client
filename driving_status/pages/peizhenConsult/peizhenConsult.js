import http from '../../../utils/http.js';

Page({
  data: {
    hospital: '',
    phone: '',
    typeOptions: ['就医陪诊', '辅助就医', '诊前咨询', '代办问诊', '代办买药', '送/取服务', '检查预约', '院内服务', '会员套餐'],
    typeIndex: -1
  },

  onLoad(options) {
    // 从上一页带过来的服务类型，自动选中
    if (options && options.type) {
      const type = decodeURIComponent(options.type);
      const idx = this.data.typeOptions.indexOf(type);
      if (idx >= 0) {
        this.setData({ typeIndex: idx });
      }
    }
  },

  onHospitalInput(e) {
    this.setData({ hospital: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onTypeChange(e) {
    this.setData({ typeIndex: Number(e.detail.value) });
  },

  onSubmit() {
    const { hospital, phone, typeIndex, typeOptions } = this.data;

    if (!hospital.trim()) {
      wx.showToast({ title: '请输入咨询医院', icon: 'none' });
      return;
    }
    if (typeIndex < 0) {
      wx.showToast({ title: '请选择咨询类型', icon: 'none' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号码', icon: 'none' });
      return;
    }

    const typeName = typeOptions[typeIndex];
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({ url: '/user_center/pages/login/login' });
      return;
    }

    const data = {
      mainClass: 'CD_PeiZhen',
      mainList: [
        { key: 'ExtProp1', value: hospital },
        { key: 'ExtProp2', value: phone },
        { key: 'ExtProp3', value: typeName },
        { key: 'Name', value: typeName },
        { key: 'Location', value: '' }
      ]
    };

    http.postRequest('/Api/DispatchMobile/createThirdBuinessInfo', data, '', res => {
      if (res.code == 0) {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      } else {
        wx.showToast({ title: res.msg || '提交失败，请稍后重试', icon: 'none' });
      }
    }, err => {
      console.error(err);
      wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onGoOrders() {
    wx.navigateTo({
      url: '/user_center/pages/orderList/orderList'
    });
  }
});
