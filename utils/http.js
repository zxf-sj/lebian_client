const BASE_URL = require("./BASE_URL")
var baseUrl = BASE_URL.BASE_URL //配置基础url
let timer = null;


/**
 * 供外部post请求调用  
 */
function post(url, params, header, onSuccess, onFailed) {
  request(url, params, "POST", header, onSuccess, onFailed);

}

/**
 * 供外部get请求调用
 */
function get(url, params, header, onSuccess, onFailed) {
  request(url, params, "GET", header, onSuccess, onFailed);
}

/**
 * function: 封装网络请求
 * @url URL地址
 * @params 请求参数
 * @method 请求方式：GET/POST
 * @onSuccess 成功回调
 * @onFailed  失败回调
 */


function request(url, params, method, header, onSuccess, onFailed) {
  let hasToast = false;
  // wx.showLoading({
  //   title: '加载中...'
  // })
  wx.request({
    url: baseUrl + url,
    data: dealParams(params),
    method: method,
    header,
    success(res) {
      if (res.data.code == '0') {
        if (res.data.code == '0') {
          wx.removeStorageSync('needLogin')
          onSuccess(res.data); //request success
        } else {
          onFailed(res.data.message); //request failed
        }
        //wx.hideLoading();
      } else{
        // wx.hideLoading();
        onSuccess(res.data);
      }
    },
    fail(error) {
      wx.showToast({
        title: error,
        duration:3000,
        icon: 'none',
        success() {
          hasToast = true;
          setTimeout(function () {
            console.log(err)
            onFailed(error);
          }, 500)
        }
      })
    },
    complete() {
      setTimeout(() => {
        let timer = hasToast ? 3000 : 500;
        setTimeout(() => {
          //wx.hideLoading()
        }, timer);
      }, 500);
    }
  })
}

/**
 * function: 根据需求处理请求参数：添加固定参数配置等
 * @params 请求参数
 */
function dealParams(params) {
  // console.log("请求参数:", params)
  return params;
}


// 1.通过module.exports方式提供给外部调用
module.exports = {
  postRequest: post,
  getRequest: get,
}