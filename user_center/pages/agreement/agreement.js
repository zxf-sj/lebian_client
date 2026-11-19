const app = getApp(); // 获取 App实例
const BASE_URL = require("../../../utils/BASE_URL");
import http from '../../../utils/http';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    http.getRequest("/Api/DispatchMobile/NewGetXcx?ShortCode=Car", '', wx.getStorageSync('header'), res => {
    // WxParse.wxParse(bindName, type, data, target, imagePadding)
    // 1.bindName绑定的数据名(必填)
    // 2.type可以为html或者md(必填)
    // 3.data为传入的具体数据(必填)
    // 4.target为Page对象, 一般为this(必填)
    // 5.imagePadding为当图片自适应是左右的单一padding(默认为0, 可选)
    // 服务端富文本自带行内 style（Tahoma 字体、px 字号、灰色字等）会覆盖页面排版，
    // 去掉后统一由页面样式控制字体；同时清掉制表符与首尾空白，避免段落前出现莫名缩进
    var content = (res.data.AgreeOn || '')
      .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, '')
      .replace(/<\/?font[^>]*>/gi, '')
      .replace(/\t+/g, '')
      .trim();
    const WxParses = require('../../../components/wxParse/wxParse.js');
    WxParses.setImageDomain(BASE_URL);
    WxParses.wxParse('content', 'html', content, that, 5);
    }, err => {
        console.log(err)
    })
  },
})