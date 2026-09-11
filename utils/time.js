/**
 * 获取当前时间，格式化为 YYYY-MM-DDTHH:mm:ss
 */
const getCurrentTime = () => {
  const now = new Date();
  
  // 获取各项时间数据，不足两位的自动补零
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

module.exports = {
  getCurrentTime
};