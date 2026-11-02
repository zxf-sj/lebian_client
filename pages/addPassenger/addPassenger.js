// pages/addPassenger/addPassenger.js  新增乘车人
const http = require('../../utils/http.js');

// 儿童字典值（与旧版 addUser2 / userList 保持一致）
const CHILD = '100004-0000010001';
const ADULT = '100004-0000010002';

Page({
  data: {
    /* 行程信息：由下单页带入，仅文字展示，非输入项；从乘车人管理进入时为空、不显示 */
    tripLines: [],

    type: 'adult', // adult | child
    name: '',
    idcard: '',
    phone: '',
    isDefault: true,
    agree: false,

    Ids: '', // 编辑时的记录 Id，新增为空
  },

  onLoad(options) {
    options = options || {};

    // 行程信息：线路 + 已选上下车点 + 发车时间，逐行纯文字展示
    const from = decodeURIComponent(options.upCity || '');
    const to = decodeURIComponent(options.downCity || '');
    const up = decodeURIComponent(options.upStation || '');
    const down = decodeURIComponent(options.downStation || '');
    const time = decodeURIComponent(options.DepartureTime || '');
    const line = options.lineText ? decodeURIComponent(options.lineText) : (from && to ? from + ' → ' + to : '');
    const tripLines = [line, (up || down) ? up + ' 上车 · ' + down + ' 下车' : '', time].filter(s => s);
    if (tripLines.length) this.setData({ tripLines });

    // 编辑已有乘车人（与旧版 addUser2 的 options.item 用法一致）
    if (options.item) {
      try {
        const it = JSON.parse(decodeURIComponent(options.item));
        this.setData({
          Ids: it.Id,
          name: it.RealName || '',
          phone: it.Phone || '',
          idcard: it.IdCard || '',
          type: it.isChildren == CHILD ? 'child' : 'adult',
        });
      } catch (e) {
        console.error('乘车人数据解析失败', e);
      }
    }
  },

  onType(e) {
    this.setData({ type: e.currentTarget.dataset.t });
  },

  onName(e) {
    this.setData({ name: e.detail.value });
  },

  onIdcard(e) {
    this.setData({ idcard: e.detail.value });
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  onDefault(e) {
    this.setData({ isDefault: e.detail.value });
  },

  onAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onSave() {
    const { name, idcard, phone, agree, type, isDefault, Ids } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' });
      return;
    }
    if (!idcard.trim()) {
      wx.showToast({ title: '请输入证件号码', icon: 'none' });
      return;
    }
    if (!/^1[3456789]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!agree) {
      wx.showToast({ title: '请先阅读并同意隐私政策', icon: 'none' });
      return;
    }
    const userinfo = wx.getStorageSync('userInfo');
    if (!userinfo || !userinfo.Id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    // 对接旧版同款接口：GET /Api/Mobile/AddressEdit（中文需转码，避免参数被截断）
    let url = '/Api/Mobile/AddressEdit?MemberId=' + userinfo.Id
      + '&RealName=' + encodeURIComponent(name.trim())
      + '&Phone=' + phone
      + '&IdCard=' + idcard.trim()
      + '&isChildren=' + (type === 'child' ? CHILD : ADULT)
      + '&Id=' + Ids;

    // 预留：接口暂无「是否设为默认乘车人」字段，后端补上后放开下面这行即可
    // url += '&IsDefault=' + (isDefault ? 1 : 0);

    wx.showLoading({ title: '', mask: true });
    http.getRequest(url, '', wx.getStorageSync('header'), res => {
      wx.hideLoading();
      if (res.code == 0) {
        wx.showToast({ title: Ids ? '修改成功' : '添加成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 800);
      } else {
        wx.showToast({ title: res.msg || '保存失败', icon: 'none' });
      }
    }, err => {
      wx.hideLoading();
      console.error('网络异常:', err);
      wx.showToast({ title: '网络出现问题', icon: 'none' });
    });
  },
});
