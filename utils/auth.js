/**
 * 登录态工具
 *
 * 背景：项目里大量接口依赖 MemberId（由登录后的 userInfo.Id 提供），
 * 未登录时页面会直接取 wx.getStorageSync('userInfo').Id，得到 undefined，
 * 请求带着 MemberId=undefined 打到后端，表现为「接口报错 / 列表空白」，用户完全不知道要去登录。
 *
 * 这里统一判断登录态，并在请求层（utils/http.js、utils/httpLogin.js、app.js 的 wx.request 守卫）
 * 拦截一切「带 MemberId 但未登录」的请求，弹一次登录引导，不再把脏请求发出去。
 *
 * 登录态相关缓存：userInfo / header / openid / phoneNumber / systemInfo / token / appId / uuid
 * 这些在清理下单草稿时都不会动（见 utils/orderStorage.js）。
 */
const LOGIN_PAGE = '/user_center/pages/login/login';

// 登录成功后写入的会员信息（login.js 里 wx.setStorageSync('userInfo', res3.data.data)）
function getUserInfo() {
  const info = wx.getStorageSync('userInfo');
  return info && info.Id ? info : null;
}

function isLogin() {
  return !!getUserInfo();
}

// 统一从这里取 MemberId，未登录返回空串（页面可据此跳过请求 / 提示登录）
function getMemberId() {
  const info = getUserInfo();
  return info ? info.Id : '';
}

function getHeader() {
  return wx.getStorageSync('header') || {};
}

function gotoLogin() {
  wx.navigateTo({ url: LOGIN_PAGE });
}

let lastPromptAt = 0;

/**
 * 需要登录时弹出引导，返回 false；已登录返回 true。
 * options.silent = true 时只返回结果、不弹窗。
 * 1.5s 内重复调用只弹一次，避免并发请求弹出多个框。
 */
function requireLogin(options) {
  if (isLogin()) return true;
  if (options && options.silent) return false;

  const now = Date.now();
  if (now - lastPromptAt < 1500) return false;
  lastPromptAt = now;

  wx.showModal({
    title: '提示',
    content: (options && options.content) || '该功能需要登录后使用，是否现在去登录？',
    confirmText: '去登录',
    cancelText: '暂不',
    success(res) {
      if (res.confirm) gotoLogin();
    }
  });
  return false;
}

/**
 * 判断一次请求是否依赖 MemberId：
 * - url 里带 MemberId=（有的是拼接、有的是空值）
 * - 参数对象 / 字符串里带 MemberId
 */
function requestNeedsLogin(url, params) {
  if (url && /[?&]memberid=/i.test(String(url))) return true;
  if (params) {
    if (typeof params === 'string') {
      if (/(^|&)memberid=/i.test(params)) return true;
    } else if (typeof params === 'object' && ('MemberId' in params || 'memberId' in params)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  LOGIN_PAGE,
  getUserInfo,
  isLogin,
  getMemberId,
  getHeader,
  gotoLogin,
  requireLogin,
  requestNeedsLogin
};
