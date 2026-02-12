function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
      gapTime = 1500
  }
  let _lastTime = null
  // 返回新的函数
  return function () {
      let _nowTime = +new Date()
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
          fn.apply(this, arguments) //将this和参数传给原函数
          _lastTime = _nowTime
      }
  }
}
/* 防抖函数封装 */
function debounce(fn, interval) {
  let timer;
  let delay = interval || 1000; // 间隔的时间，如果interval不传，则默认1秒
  return function () {
      let that = this;
      let args = arguments; // 保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
      if (timer) {
          clearTimeout(timer);
      }
      timer = setTimeout(function () {
          fn.apply(that, args); // 用apply指向调用debounce的对象，相当于this.fn(args);
      }, delay);
  };
}
// 将写好的方法抛出
module.exports = {
  throttle,
  debounce
}