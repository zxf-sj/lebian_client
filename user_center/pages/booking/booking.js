// user_center/pages/booking/booking.js
Page({
  data: {
    // 模拟上车点数据
    pickupList: [
      { id: 'p1', time: '16:30', name: '田美上庄公交站', desc: '花都广场地铁B出口往前80米' },
      { id: 'p2', time: '17:00', name: '广州T2航站楼', desc: '东客运站' },
      { id: 'p3', time: '17:15', name: '广州T3航站楼', desc: '东客运站' }
    ],
    // 模拟下车点数据
    dropoffList: [
      { id: 'd1', name: '博罗天虹商场', desc: '兰庭汇' },
      { id: 'd2', name: '江北丽日', desc: '百合家园小区文昌二路公交站' },
      { id: 'd3', name: '京东电器门口', desc: '国商大厦即旧人人乐' },
      { id: 'd4', name: '惠州学院', desc: '出门左手边树底下' },
    ],
    selectedPickupId: '', // 当前选中的上车点ID
    selectedDropoffId: '' // 当前选中的下车点ID
  },

  onLoad() {
    // 可以在这里请求接口获取真实数据
  },

  // 监听上车点选择
  onPickupChange(e) {
    this.setData({
      selectedPickupId: e.detail.value
    });
  },

  // 监听下车点选择
  onDropoffChange(e) {
    this.setData({
      selectedDropoffId: e.detail.value
    });
  },

  // 点击下一步
  goNext() {
    const { selectedPickupId, selectedDropoffId } = this.data;

    if (!selectedPickupId) {
      wx.showToast({ title: '请选择上车点', icon: 'none' });
      return;
    }
    if (!selectedDropoffId) {
      wx.showToast({ title: '请选择下车点', icon: 'none' });
      return;
    }

    console.log('提交数据:', {
      pickup: selectedPickupId,
      dropoff: selectedDropoffId
    });

    // 跳转到下一页或提交订单
    wx.showToast({ title: '选择成功', icon: 'success' });
  }
})