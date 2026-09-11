const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * 获取今天的日期字符串
 * @param {string} separator - 分隔符，默认 '-'
 * @returns {string} 例如 '2026-09-09'
 */
function getToday(separator = '-') {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${separator}${m}${separator}${d}`;
}

/**
 * 获取今天的详细信息（年月日、星期几）
 * @returns {object}
 */
function getTodayDetail() {
  const now = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  return {
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
    weekDay: weekDays[now.getDay()],
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  };
}
module.exports = {
  formatTime,
  getToday,
  getTodayDetail
}
