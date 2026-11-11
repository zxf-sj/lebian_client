/**
 * 当日历史订单查询（对齐旧版 pages/pingche 的下单前校验）
 *
 * 接口：GET /Api/DispatchMobile/IsUserHaveDayOrder?phone=<手机号>&timeDay=<yyyy-MM-dd>
 * 返回：{ code: 0, count: n, data: [{ PassengerLineId_Name, Code, ... }] }
 *
 * 下单前统一调用，命中当日订单时弹「下单记录」让用户选择继续下单或取消。
 */
const http = require('./http.js');

// 多乘车人手机号用 | 拼接，与下单接口 PersonalIds 的口径一致
function joinPhones(list) {
  return (list || []).filter(Boolean).join('|');
}

function formatList(list) {
  let str = '';
  (list || []).forEach((item) => {
    const line = item.PassengerLineId_Name || item.LineName || item.PassengerLineId || '';
    str += line + '，订单号为:' + (item.Code || '') + '\n';
  });
  return str;
}

/**
 * 查询当日订单
 * @returns Promise<{ ok: boolean, has: boolean, list: Array, text: string }>
 *          ok=false 表示请求失败（调用方决定是否阻止下单）
 */
function queryDayOrder(phone, date) {
  return new Promise((resolve) => {
    if (!phone) {
      resolve({ ok: true, has: false, list: [], text: '' });
      return;
    }
    const url = '/Api/DispatchMobile/IsUserHaveDayOrder?phone=' +
      encodeURIComponent(phone) + '&timeDay=' + encodeURIComponent(date || '');
    http.getRequest(url, '', '', (res) => {
      const list = (res && Array.isArray(res.data)) ? res.data : [];
      // 以 count 为准（后端按条数返回），count 缺失时退回看数组长度
      const count = Number(res && res.count) || list.length;
      const has = res && res.code == 0 && count > 0;
      resolve({
        ok: true,
        has,
        list: has ? list : [],
        text: has ? formatList(list) : '',
      });
    }, () => {
      resolve({ ok: false, has: false, list: [], text: '' });
    });
  });
}

// 已存在当日订单：让用户选择「继续下单 / 取消下单」
function confirmContinue(text) {
  return new Promise((resolve) => {
    wx.showModal({
      title: '下单记录',
      content: text || '您当天已有订单，是否继续下单？',
      cancelText: '取消下单',
      confirmText: '继续下单',
      success: (r) => resolve(!!r.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * 下单前守卫：无当日订单 → true；有 → 弹窗，用户选「继续下单」才返回 true
 * 请求失败返回 false 并提示，避免在不知道是否有重复订单的情况下直接下单
 */
async function guardDayOrder(phone, date) {
  const res = await queryDayOrder(phone, date);
  if (!res.ok) {
    wx.showToast({
      title: '数据请求失败，请稍后重试',
      icon: 'none',
      duration: 2000,
    });
    return false;
  }
  if (!res.has) return true;
  return confirmContinue(res.text);
}

module.exports = {
  joinPhones,
  queryDayOrder,
  confirmContinue,
  guardDayOrder,
};
