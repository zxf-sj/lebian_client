/**
 * 云闪付（云微小程序）支付结果监听
 *
 * 背景：wx.navigateToMiniProgram 跳转云闪付后，支付动作发生在外部小程序，
 * 本端拿不到支付结果回调。唯一可靠信号是用户返回本小程序时 App 切到前台
 * 的 wx.onAppShow 事件（场景值 1038 = 从另一个小程序返回），
 * 此时用后台订单查询接口判断支付状态，并给出对应交互。
 *
 * 用法：
 *   跳转前：unionPay.mark(orderId, 'dispatch' | 'bus');  // 同时自动注册监听
 *   支付结果以后端订单状态为权威来源，前端仅负责回来后的查询与提示。
 */
const http = require('./http.js');

const PENDING_KEY = 'pendingUnionPayOrder'; // 待确认支付订单
const RETURN_SCENE = 1038; // 场景值：从另一个小程序返回
const PAID_STATE = '100004-0000010001'; // 字典值：已付款
const PENDING_TTL = 30 * 60 * 1000; // 超过 30 分钟的待确认标记不再查询
const MAX_RETRY = 2; // 支付回调落库有延迟，最多重试 2 次
const RETRY_GAP = 2000;

let started = false; // onAppShow 只注册一次
let querying = false; // 防止并发重复查询

/**
 * 记录一笔等待支付结果的云闪付订单
 * @param {string} orderId 订单 Id
 * @param {string} orderType 'dispatch'（包车/拼车/取送货/网约）或 'bus'（大巴班线单）
 */
function mark(orderId, orderType) {
  if (!orderId) return;
  wx.setStorageSync(PENDING_KEY, {
    orderId: orderId,
    orderType: orderType || 'dispatch',
    ts: Date.now()
  });
  start();
}

function clear() {
  wx.removeStorageSync(PENDING_KEY);
}

function getPending() {
  const pending = wx.getStorageSync(PENDING_KEY);
  if (!pending || !pending.orderId) return null;
  if (Date.now() - (pending.ts || 0) > PENDING_TTL) {
    clear();
    return null;
  }
  return pending;
}

/** 注册全局前台监听（幂等） */
function start() {
  
  if (started) return;
  started = true;
  wx.onAppShow((res) => {
    console.log('[unionPayWatcher] onAppShow scene =', res && res.scene);
    if (!res || res.scene !== RETURN_SCENE) return;
    if (!getPending() || querying) return;
    console.log('[unionPayWatcher] 从云闪付返回，开始查询订单支付状态');
    wx.navigateTo({
      url: '/user_center/pages/travelList/travelList',
    })
    // checkAndQuery(0);
  });
}

/** 查询一次订单支付状态，返回 'paid' | 'unpaid' | 'unknown' */
function queryOnce(orderId, orderType) {
  return new Promise((resolve) => {
    const isBus = orderType === 'bus';
    const userinfo = wx.getStorageSync('userInfo') || {};
    const url = isBus ? '/api/BusMobile/GetOrderInfo' : '/Api/DispatchMobile/GetOrderInfo';
    const data = isBus ? {
      Personal: userinfo.Id,
      Id: orderId
    } : {
      MemberId: userinfo.Id,
      Id: orderId
    };
    http.postRequest(url, data, wx.getStorageSync('header') || '', (res) => {
      if (res && res.code == 0 && res.data) {
        resolve(isPaid(res.data.IsPayment) ? 'paid' : 'unpaid');
      } else {
        resolve('unknown');
      }
    }, (err) => {
      console.log('[unionPayWatcher] 订单状态查询失败', err);
      resolve('unknown');
    });
  });
}

/** 支付状态兼容：字典值 / 数字 1 / 字符串 '1' 均视为已支付 */
function isPaid(val) {
  return val === PAID_STATE || val === 1 || val === '1' || val === true;
}

/** 先按记录的类型查；接口不适用（unknown）时用另一类订单接口复查 */
function queryWithFallback(pending) {
  const other = pending.orderType === 'bus' ? 'dispatch' : 'bus';
  return queryOnce(pending.orderId, pending.orderType || 'dispatch').then((state) => {
    if (state !== 'unknown') return state;
    return queryOnce(pending.orderId, other);
  });
}

function checkAndQuery(retryCount) {
  const pending = getPending();
  if (!pending) {
    querying = false;
    return;
  }
  querying = true;
  queryWithFallback(pending).then((state) => {
    if (state === 'paid') {
      querying = false;
      clear();
      onSuccess(pending);
    } else if (retryCount < MAX_RETRY) {
      // 云闪付异步回调可能还没落库，稍后重试
      setTimeout(() => checkAndQuery(retryCount + 1), RETRY_GAP);
    } else {
      querying = false;
      onUnknown(pending);
    }
  });
}

function goDetail(orderId) {
  wx.reLaunch({
    url: '/user_center/pages/payDetail/payDetail?orderId=' + orderId + '&from=orderList'
  });
}

/** 已支付：轻提示后进入订单详情 */
function onSuccess(pending) {
  wx.showToast({
    title: '支付成功',
    icon: 'success',
    duration: 2000
  });
  setTimeout(() => goDetail(pending.orderId), 1200);
}

/** 未支付/查询不到：不能武断判失败，让用户自行确认去向 */
function onUnknown(pending) {
  clear();
  wx.showModal({
    title: '支付确认',
    content: '暂未查询到支付结果。若您已在云闪付完成支付，订单状态稍后会自动更新；若尚未完成支付，可前往订单页继续支付。',
    confirmText: '前往订单',
    cancelText: '稍后再说',
    success(r) {
      if (r.confirm) goDetail(pending.orderId);
    }
  });
}

module.exports = {
  mark,
  clear,
  getPending,
  start
};
