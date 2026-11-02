/**
 * 下单草稿缓存清理
 *
 * 下单流程会在 Storage 里留下大量中间态（起终点、时间段、车型、人数、备注等），
 * 用户下完单、或者中途返回不下了，这些数据不该留到下一次下单，否则会出现
 * 「上次的地址/时间/人数还留着」串单的问题。
 *
 * 这里只清理下单相关 key，登录态相关（userInfo / header / openid / phoneNumber /
 * systemInfo / token / appId / uuid / servicePhone）以及城市偏好（start_city / chengjiCity）
 * 一律保留。
 *
 * 使用：
 *   orderStorage.touchOrderDraft()       // 进入下单流程时打时间戳
 *   orderStorage.clearOrderDraft()       // 下单成功 / 支付结束 / 退出下单页
 *   orderStorage.clearExpiredOrderDraft()// 冷启动清理超时草稿（默认 2 小时）
 */
const DRAFT_TIME_KEY = 'orderDraftAt';

// 下单流程专用缓存键（不含任何登录态字段）
const ORDER_DRAFT_KEYS = [
  // 起终点 / 选址链路
  'starInfo2',
  'endInfo2',
  'startInfo',
  'endInfo',
  'from_starting',
  'from_ending',
  'to_starting',
  'to_ending',
  // 日期、时间段、车型
  'storageSync',
  'pcTimeSync',
  'pcTypeId',
  'startDate',
  'startTime',
  'timeArr',
  'timeIndex',
  'cartype',
  'cartypelist',
  // 人数 / 乘车人 / 联系人 / 备注
  'personNum',
  'totalNum',
  'personStr',
  'phoneStr',
  'note',
  'textareaValue',
  'SeatNumber',
  'addArr',
  'propeData',
  // 线路 / 班次 / 订单
  'lineId',
  'lineIndex',
  'lineItme',
  'lineOrderNo',
  'orderNo',
  'goType',
  'IsBalance',
  // 草稿时间戳
  DRAFT_TIME_KEY
];

function clearOrderDraft() {
  ORDER_DRAFT_KEYS.forEach(function (key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      /* 忽略单键异常，保证其余键继续清理 */
    }
  });
}

// 进入下单流程时打点，供冷启动判断草稿是否过期
function touchOrderDraft() {
  try {
    wx.setStorageSync(DRAFT_TIME_KEY, Date.now());
  } catch (e) {
    /* 忽略 */
  }
}

// 冷启动清理：草稿超过 maxAgeMs（默认 2 小时）说明上次流程已中断
function clearExpiredOrderDraft(maxAgeMs) {
  let at = 0;
  try {
    at = Number(wx.getStorageSync(DRAFT_TIME_KEY) || 0);
  } catch (e) {
    at = 0;
  }
  const age = maxAgeMs || 2 * 60 * 60 * 1000;
  if (at && Date.now() - at > age) clearOrderDraft();
}

module.exports = {
  ORDER_DRAFT_KEYS,
  clearOrderDraft,
  touchOrderDraft,
  clearExpiredOrderDraft
};
