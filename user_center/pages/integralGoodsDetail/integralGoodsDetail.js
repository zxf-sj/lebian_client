// user_center/pages/integralGoodsDetail/integralGoodsDetail.js
import http from '../../../utils/http';
Page({
  data: {
    item:null,
    btnText:''
  },
  onLoad: function (opt) {
    if(opt.item){
      let item = JSON.parse(opt.item);
      console.log(item)
      let btnText = item.isExchange == 0 ? '积分不足' : `${item.integralNumber}积分立即兑换`;
      this.setData({
        item,
        btnText
      })
    }
  },

  exchange(){
    if(this.data.item && this.data.item.isExchange != 0){
      let url = "/v2/passenger/integral/exchangeCoupon?couponId="+this.data.item.couponId;
      http.postRequest(url,'',wx.getStorageSync('header'),res=>{
        if(res.code === '1'){
          wx.showToast({
            title: '兑换成功',
            icon:'none',
            duration:2000,
            success(){
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1,
                })
              }, 2000);
            }
          })
        }
      },err=>{
        console.log(err)
      })
    }
  },
})