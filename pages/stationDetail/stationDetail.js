// pages/stationDetail/stationDetail.js  站点详情：上 6 图片列表 / 下 4 地图导航
const http = require("../../utils/http.js");
const BASE_URL = require("../../utils/BASE_URL");

var baseUrl = BASE_URL.BASE_URL;

// 站点详情接口：GET /api/BusMobile/GetLocationInfo?Id=
const DETAIL_API = '/api/BusMobile/GetLocationInfo';

// 图片地址补全：后端返回相对路径（/wxImg/xxx.jpg），小程序 image 需完整地址
function fullImg(p) {
  if (!p) return '';
  if (/^(https?:)?\/\//i.test(p) || /^data:/i.test(p)) return p;
  return baseUrl + (p.charAt(0) === '/' ? p : '/' + p);
}

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
      imgs: passedImgs.map((url) => ({ url: fullImg(url) })),
      latitude: lat || this.data.latitude,
      longitude: lng || this.data.longitude,
    });
    wx.setNavigationBarTitle({ title: dec(options.name) || '站点详情' });

    this._loadDetail();
    this._initMap();
  },

  onReady() {
    this.mapCtx = wx.createMapContext('staMap', this);
    this._fitPoints();
  },

  // 站点详情：GET /api/BusMobile/GetLocationInfo?Id=
  _loadDetail() {
    const id = this.data.locationId;
    if (!id) return;
    http.getRequest(
      DETAIL_API + '?Id=' + encodeURIComponent(id),
      '',
      wx.getStorageSync('header'),
      (res) => {
        const d = (res && res.data) || null;
        if (!d) return;

        const lat = Number(d.Latitude) || 0;
        const lng = Number(d.Longitude) || 0;
        const imgs = (d.ImgList || [])
          .map((it) => ({ url: fullImg(it.ImgPath) }))
          .filter((x) => x.url);

        const patch = {
          name: d.LocationName || '',
          address: d.DetailAddress || '',
          lat,
          lng,
          hasStationPos: !!(lat && lng),
          imgs,
        };
        if (lat && lng) {
          patch.latitude = lat;
          patch.longitude = lng;
        }

        this.setData(patch, () => {
          wx.setNavigationBarTitle({ title: d.LocationName || '站点详情' });
          // 坐标变化后刷新地图标注
          const myLat = this._myLat || 0;
          const myLng = this._myLng || 0;
          this._applyMarkers(myLat, myLng, !(myLat && myLng));
        });
      },
      () => {}
    );
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
        this._myLat = res.latitude;
        this._myLng = res.longitude;
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
