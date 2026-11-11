// pages/stationDetail/stationDetail.js  站点详情：上 6 图片列表 / 下 4 地图导航
const http = require("../../utils/http.js");

// 站点图片列表接口：返回 data 为数组（元素可为图片地址字符串，或含 Img/Image/Url/PicUrl 的对象）
// 若后端接口名/参数不同，只改这两行即可
const SITE_IMG_API = '/api/BusMobile/GetSiteImgList';

// 导航方式：appId 有值时直接拉起对应地图小程序；留空时用系统地图（wx.openLocation，
// 由系统/微信内置地图选择已安装的高德、百度、腾讯地图进行导航）
const NAV_LIST = [
  { key: 'amap', name: '高德地图', appId: '' },
  { key: 'baidu', name: '百度地图', appId: '' },
  { key: 'qq', name: '腾讯地图', appId: '' },
];

function dec(v) {
  try {
    return decodeURIComponent(v || '');
  } catch (e) {
    return v || '';
  }
}

Page({
  data: {
    name: '',
    address: '',
    locationId: '',

    // 站点坐标（无坐标时不能导航）
    lat: 0,
    lng: 0,
    hasStationPos: false,

    // 图片列表：[{ url }]
    imgs: [],

    // 地图
    latitude: 39.908823,
    longitude: 116.397470,
    scale: 15,
    markers: [],

    // 导航方式选择弹层
    navShow: false,
    navList: NAV_LIST,
  },

  onLoad(options) {
    options = options || {};
    const lat = Number(options.lat) || 0;
    const lng = Number(options.lng) || 0;
    const passedImgs = dec(options.imgs).split(',').filter(Boolean);

    this.setData({
      name: dec(options.name),
      address: dec(options.address),
      locationId: dec(options.locationId),
      lat,
      lng,
      hasStationPos: !!(lat && lng),
      imgs: passedImgs.map((url) => ({ url })),
      latitude: lat || this.data.latitude,
      longitude: lng || this.data.longitude,
    });
    wx.setNavigationBarTitle({ title: dec(options.name) || '站点详情' });

    this._loadImgs();
    this._initMap();
  },

  onReady() {
    this.mapCtx = wx.createMapContext('staMap', this);
    this._fitPoints();
  },

  // 站点图片列表：有 LocationId 时以接口数据为准，接口无数据则保留上级页面带来的图片
  _loadImgs() {
    const locationId = this.data.locationId;
    if (!locationId) return;
    http.getRequest(
      SITE_IMG_API + '?LocationId=' + encodeURIComponent(locationId),
      '',
      wx.getStorageSync('header'),
      (res) => {
        const list = this._normalizeImgs(res && res.data);
        if (list.length) this.setData({ imgs: list });
      },
      () => {}
    );
  },

  // 兼容多种返回结构：数组 / { List|ImgList|SiteImgList|rows|Images: [] }，元素为字符串或对象
  _normalizeImgs(data) {
    let arr = data;
    if (arr && !Array.isArray(arr)) {
      arr = arr.List || arr.ImgList || arr.SiteImgList || arr.Images || arr.rows || [];
    }
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it) => {
        if (typeof it === 'string') return { url: it };
        return {
          url: (it && (it.Img || it.Image || it.Url || it.PicUrl || it.SiteImg || it.Path)) || '',
        };
      })
      .filter((x) => x.url);
  },

  // 图片点击：全屏放大，可左右滑动查看全部
  onImgTap(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const urls = this.data.imgs.map((it) => it.url).filter(Boolean);
    if (!urls.length) return;
    wx.previewImage({
      current: urls[idx] || urls[0],
      urls,
    });
  },

  // 定位：乘客当前位置 + 站点位置同时上图
  _initMap() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this._applyMarkers(res.latitude, res.longitude, false);
      },
      fail: () => {
        // 拒绝授权或定位失败：只显示站点
        if (this.data.hasStationPos) this._applyMarkers(0, 0, true);
      },
    });
  },

  _applyMarkers(myLat, myLng, noLoc) {
    const { lat, lng, name, hasStationPos } = this.data;
    const markers = [];

    if (!noLoc && myLat && myLng) {
      markers.push({
        id: 1,
        latitude: myLat,
        longitude: myLng,
        width: 30,
        height: 30,
        iconPath: '/assets/images/nav-me.png',
        callout: {
          content: '我的位置',
          color: '#2f7cf6',
          fontSize: 12,
          borderRadius: 6,
          padding: 6,
          bgColor: '#ffffff',
          display: 'ALWAYS',
        },
      });
    }
    if (hasStationPos) {
      markers.push({
        id: 2,
        latitude: lat,
        longitude: lng,
        width: 30,
        height: 30,
        iconPath: '/assets/images/map_mark.png',
        callout: {
          content: name || '站点位置',
          color: '#e64340',
          fontSize: 12,
          borderRadius: 6,
          padding: 6,
          bgColor: '#ffffff',
          display: 'ALWAYS',
        },
      });
    }

    const patch = { markers };
    if (hasStationPos) {
      patch.latitude = lat;
      patch.longitude = lng;
    } else if (myLat && myLng) {
      patch.latitude = myLat;
      patch.longitude = myLng;
    }
    this.setData(patch, () => this._fitPoints());
  },

  // 让两个点都在可视范围内
  _fitPoints() {
    const markers = this.data.markers || [];
    if (!this.mapCtx || markers.length < 2) return;
    this.mapCtx.includePoints({
      points: markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude })),
      padding: [60, 60, 60, 60],
    });
  },

  // 导航前往：先选地图 App，再跳转导航
  onNavTap() {
    if (!this.data.hasStationPos) {
      wx.showToast({ title: '暂无站点坐标，无法导航', icon: 'none' });
      return;
    }
    this.setData({ navShow: true });
  },

  closeNav() {
    this.setData({ navShow: false });
  },

  onNavChoose(e) {
    const key = e.currentTarget.dataset.key;
    const app = NAV_LIST.find((a) => a.key === key) || {};
    this.setData({ navShow: false });
    if (app.appId) {
      wx.navigateToMiniProgram({
        appId: app.appId,
        fail: () => this._openSystemMap(),
      });
      return;
    }
    this._openSystemMap();
  },

  // 系统地图导航：微信内置地图会列出已安装的高德/百度/腾讯地图供选择
  _openSystemMap() {
    const { lat, lng, name, address } = this.data;
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      name: name || '站点位置',
      address: address || '',
      scale: 18,
      fail: () => {
        wx.showToast({ title: '打开地图失败，请确认已安装地图 App', icon: 'none' });
      },
    });
  },

  noop() {},
});
