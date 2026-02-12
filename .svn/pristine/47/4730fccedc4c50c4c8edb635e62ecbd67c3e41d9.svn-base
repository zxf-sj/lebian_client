
/**
 * 微信小程序防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {number} delay 延迟时间(ms)，默认500ms
 * @param {boolean} immediate 是否立即执行，默认false
 * @returns {Function} 防抖处理后的函数
 */
function debounce(fn, delay = 500, immediate = false) {
  let timer = null;
  return function(...args) {
    const context = this;
    
    if (timer) clearTimeout(timer);
    
    if (immediate && !timer) {
      fn.apply(context, args);
    }
    
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args);
      }
      timer = null;
    }, delay);
  };
}

module.exports = debounce;
