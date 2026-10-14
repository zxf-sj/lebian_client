// pages/stationOrder/stationOrder.js  站点上车下单页
function toCols(name, time, mark, city) {
  const [h, m] = time.split(':');
  return {
    name,
    city: city || '',          // 所属城市（文水县 / 太原市），用于按城市过滤上下车点
    chars: name.split(''),
    timeH: h,
    timeM: m,
    mark: mark || '',          // up=上车点 down=下车点 ''=未选
  };
}

Page({
  data: {
    // 顶部站点纵览：左半属上车站城市（文水县），右半属下车站城市（太原市）
    // mark: up=上车点 down=下车点；green=灰色站点（途经/不可选）
    stations: [
      toCols('文水汽车站',   '06:00', '',    '文水县'),
      toCols('南徐村',       '06:00', 'up',  '文水县'),
      toCols('龙泉村',       '06:00', '',    '文水县'),
      toCols('桑村营村',     '06:00', '',    '文水县'),
      toCols('开栅高速口',   '06:00', '',    '文水县'),
      toCols('罗城高速口',   '06:00', 'down','太原市'),
      toCols('武宿机场',     '06:00', '',    '太原市'),
      toCols('太原火车南站', '06:00', '',    '太原市'),
      toCols('太原火车站',   '06:00', '',    '太原市'),
      toCols('建南汽车站',   '06:00', '',    '太原市'),
    ],

    // 上/下城市：由上级页面 onLoad 传入，未传时给默认占位
    upCity: '文水县',
    downCity: '太原市',

    // 上/下选中的具体站点名（与顶部圆圈 mark 双向绑定）
    upStation: '',
    downStation: '',

    platformPrice: 10,
    psgCount: 1,
    total: 10,

    // 乘车人
    passengers: [
      { name: '张一', type: '成人', idCard: '140***********1234', isChild: false },
      { name: '王二', type: '成人', idCard: '140***********5678', isChild: false },
    ],
    paxIdx: 0,

    agree: false,
    detailOpen: false,
  },

  onLoad(options) {
    options = options || {};
    // 上级页面传入：城市、站点列表、价格
    if (options.upCity)   this.setData({ upCity: options.upCity });
    if (options.downCity) this.setData({ downCity: options.downCity });
    if (options.price) {
      const price = Number(options.price) || this.data.platformPrice;
      this.setData({ platformPrice: price, total: price * this.data.psgCount });
    }
    // 如果上级传了站点列表（JSON 字符串），则覆盖默认 stations
    if (options.stations) {
      try {
        const list = JSON.parse(decodeURIComponent(options.stations));
        if (Array.isArray(list) && list.length) {
          this.setData({ stations: list });
        }
      } catch (e) {}
    }
    // 根据初始 mark 反推 upStation / downStation
    this._syncStationLabels();
  },

  // 根据 stations 里的 mark 同步 upStation / downStation
  _syncStationLabels() {
    let up = '', down = '';
    this.data.stations.forEach((s) => {
      if (s.mark === 'up')   up   = s.name;
      if (s.mark === 'down') down = s.name;
    });
    this.setData({ upStation: up, downStation: down });
  },

  // 点击圆圈：左半区（上车站城市）只在 空↔上 切换；右半区（下车站城市）只在 空↔下 切换
  onStaTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (isNaN(idx)) return;
    const cur = this.data.stations[idx].mark || '';
    const city = this.data.stations[idx].city;

    let next = '';
    if (city === this.data.upCity) {
      // 上车站城市：空→上，上→空
      next = cur === 'up' ? '' : 'up';
    } else if (city === this.data.downCity) {
      // 下车站城市：空→下，下→空
      next = cur === 'down' ? '' : 'down';
    } else {
      // 不属于任一侧城市：默认空→上，上→空
      next = cur === 'up' ? '' : 'up';
    }

    const stations = JSON.parse(JSON.stringify(this.data.stations));
    stations[idx].mark = next;

    // 全局最多 1 个上车、1 个下车，新标记覆盖旧的
    if (next) {
      for (let i = 0; i < stations.length; i++) {
        if (i !== idx && stations[i].mark === next) stations[i].mark = '';
      }
    }
    this.setData({ stations });
    this._syncStationLabels();
  },

  // 点中间"选择上车点"：弹出当前上城市下所有站点，选完反向点亮顶部圆圈
  onPickUp() {
    const list = this.data.stations
      .map((s, i) => ({ name: s.name, idx: i }))
      .filter((s) => this.data.upCity && this.data.stations[s.idx].city === this.data.upCity);
    if (!list.length) {
      wx.showToast({ title: '当前城市暂无可选上车点', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: list.map((s) => s.name),
      success: (res) => {
        const pickIdx = list[res.tapIndex].idx;
        const stations = JSON.parse(JSON.stringify(this.data.stations));
        stations.forEach((s, i) => { if (s.mark === 'up') s.mark = ''; });
        stations[pickIdx].mark = 'up';
        this.setData({ stations });
        this._syncStationLabels();
      },
    });
  },

  // 点中间"选择下车点"：弹出当前下城市下所有站点
  onPickDown() {
    const list = this.data.stations
      .map((s, i) => ({ name: s.name, idx: i }))
      .filter((s) => this.data.downCity && this.data.stations[s.idx].city === this.data.downCity);
    if (!list.length) {
      wx.showToast({ title: '当前城市暂无可选下车点', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: list.map((s) => s.name),
      success: (res) => {
        const pickIdx = list[res.tapIndex].idx;
        const stations = JSON.parse(JSON.stringify(this.data.stations));
        stations.forEach((s, i) => { if (s.mark === 'down') s.mark = ''; });
        stations[pickIdx].mark = 'down';
        this.setData({ stations });
        this._syncStationLabels();
      },
    });
  },

  // 切换乘车人
  onPaxTab(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    this.setData({ paxIdx: idx });
  },

  onAddUser() {
    wx.navigateTo({ url: '/pages/addPassenger/addPassenger' });
  },

  onCoupon() {
    wx.showToast({ title: '优惠方式（待接入）', icon: 'none' });
  },

  onAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onDetail() {
    this.setData({ detailOpen: !this.data.detailOpen });
  },

  noop() {},

  onPay() {
    if (!this.data.agree) {
      wx.showToast({ title: '请先接受服务合同', icon: 'none' });
      return;
    }
    if (!this.data.upStation || !this.data.downStation) {
      wx.showToast({ title: '请先选择上/下车点', icon: 'none' });
      return;
    }
    // TODO 接入下单支付接口
    wx.showToast({ title: '下单成功', icon: 'success' });
  },
});
