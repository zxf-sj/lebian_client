// components/kefu-float/kefu-float.js 悬浮客服按钮：拖拽 + 吸边 + 拨号
const POS_KEY = 'kefuFl…os';
const SIZE = 48;   // 按钮边长约等于 96rpx 在小屏下的近似 px 值，运行时按窗口换算
const MARGIN = 10; // 吸边后距屏幕左右边缘的间距

Component({
  data: {
    x: 0,
    y: 0,
    dragging: false,
  },

  lifetimes: {
    attached() {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this._w = info.windowWidth;
      this._h = info.windowHeight;
      this._size = Math.max(36, Math.round(this._w * 96 / 1450) + 12); // 96rpx 换算成 px

      // 默认：右缘、约 62% 高度；有记录则恢复上次位置（上次可能拖在左侧）
      let x = this._w - this._size - MARGIN;
      let y = Math.round(this._h * 0.62);
      const saved = wx.getStorageSync(POS_KEY);
      if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
        x = this._clampX(saved.x);
        y = this._clampY(saved.y);
      }
      this.setData({ x, y });
    },
  },

  methods: {
    _clampX(v) {
      return Math.min(Math.max(v, MARGIN), this._w - this._size - MARGIN);
    },
    _clampY(v) {
      return Math.min(Math.max(v, MARGIN), this._h - this._size - MARGIN);
    },

    onStart(e) {
      const t = e.touches[0];
      this._sx = t.clientX;
      this._sy = t.clientY;
      this._ox = this.data.x;
      this._oy = this.data.y;
      this._moved = false;
      this.setData({ dragging: true });
    },

    onMove(e) {
      const t = e.touches[0];
      const dx = t.clientX - this._sx;
      const dy = t.clientY - this._sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) this._moved = true;
      this.setData({
        x: this._clampX(this._ox + dx),
        y: this._clampY(this._oy + dy),
      });
    },

    // 松手：按中心点判断靠哪侧边，吸过去并保存位置
    onEnd() {
      const cx = this.data.x + this._size / 2;
      const x = cx <= this._w / 2 ? MARGIN : this._w - this._size - MARGIN;
      this.setData({ x, dragging: false });
      wx.setStorageSync(POS_KEY, { x, y: this.data.y });
    },

    onTap() {
      // 拖拽结束也会触发 tap，位移过的不当作点击
      if (this._moved) {
        this._moved = false;
        return;
      }
      wx.makePhoneCall({ phoneNumber: '0351-6078977' });
    },
  },
});
