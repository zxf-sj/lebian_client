const BASE_URL = require("./BASE_URL")
var baseUrl = BASE_URL.BASE_URL //配置基础url
/**
 * 供外部post请求调用  
 */
function post(url, params, onSuccess, onFailed) {
  request(url, params, "POST", onSuccess, onFailed);

}

/**
 * 供外部get请求调用
 */
function get(url, params, onSuccess, onFailed) {
  request(url, params, "GET", onSuccess, onFailed);
}

/**
 * function: 封装网络请求
 * @url URL地址
 * @params 请求参数
 * @method 请求方式：GET/POST
 * @onSuccess 成功回调
 * @onFailed  失败回调
 */

function request(url, params, method, onSuccess, onFailed) {
  console.log("请求头：", wx.getStorageSync('header'))
  wx.request({
    url: baseUrl + url,
    data: dealParams(params),
    method: method,
    header: wx.getStorageSync('header'),
    success: function (res) {
      console.log('请求数据：  ', params)
      console.log('响应数据：  ', res)
      if (res.data) {
        if (res.statusCode == 200) {
          onSuccess(res.data); //request success
        } else {
          onFailed(res.data.message); //request failed
        }
      }
      // if(res.data.code === '100'){
      //   wx.showToast({
      //     title: res.data.message,
      //   })
      //   wx.navigateTo({
      //     url: '/user_center/pages/login/login',
      //   })
      // }else if(res.data.code === '101'){
      //   wx.showToast({
      //     title: res.data.message,
      //   })
      // }else if(res.data.code === '102'){
      //   wx.showToast({
      //     title: res.data.message,
      //   })
      // }
    },
    fail: function (error) {
      onFailed(""); //failure for other reasons
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