// components/slideCoupon/slideCoupon.js
import http from '../../utils/http.js';
let clickTimer = null;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    params: {
      type: Object,
      value: {
        money: 0
      }
    },
    showCoupon: {
      type: Boolean,
      value: true,
      observer(newVal, oldVal, changedPath) {
        this.reqChooseListData();
      }
    },
    fromIcon: {
      type: Boolean,
      value: true
    },
    person_number:{
      type: Number,
      value: 1
    },
    hasChooseId: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    listData: null,
    curItemId: null,
    pageNo: 1,
    loadingFailed: false,
    loading: false,
    noMore: false,
    hasCoupon: false,
    couponType: '',
    juan: [],
    ka: [],
    types: '次卡'
  },

  lifetimes: {
    attached() {
      this.reqChooseListData();
      if (this.data.hasChooseId) {
        this.setData({
          curItemId: this.data.hasChooseId
        })
      }
    },
  },
  methods: {
    //到达底部
    scrollToLower: function (e) {
      // if (!this.data.loading && !this.data.noMore) {
      //   this.setData({
      //     loading: true,
      //     pageNo: this.data.pageNo + 1
      //   });
      //   this.reqExchangeListData(true);
      // }
    },

    tapUseBtn(e) {
      let item = e.currentTarget.dataset.item;
      if (item.couponId !== this.data.curItemId) {
        this.setData({
          curItemId: item.couponId
        })
      } else {
        this.setData({
          curItemId: null
        })
      }
    },
    close() {
      this.setData({
        showCoupon: false
      })
      this.triggerEvent("CouponState", false);
      if (this.data.fromIcon) {

      } else {
        this.chooseCoupon();
      }
    },
    reqChooseListData() {
      var pcTypeId = wx.getStorageSync('pcTypeId');
      var userinfo = wx.getStorageSync('userInfo');
      let lineId = wx.getStorageSync('lineId') || {};
      var pcTimeSync = wx.getStorageSync('pcTimeSync');
      let data1 = pcTimeSync.propsDay.split('/');
      let data2 = data1[0] + '-' + data1[1]
      let data = {
        MemberId: userinfo.Id,
        Money: 2,
        LinkId: lineId,
        SelectCarType:pcTypeId,
        ToDay:data2
      }
      // /Api/DispatchMobile/UseCanCoupon
      http.postRequest("/api/CarPromotion/UseCanCoupon", data, wx.getStorageSync('header'), res => {
        if (res.code == 0) {
          let juan = []
          let ka = []
          for (let i = 0; i < res.data.length; i++) {
            // if (res.data[i].CouponType == '100004-0001030028') {
              ka.push(res.data[i])
            // } else {
            //   juan.push(res.data[i])
            // }
          }
          ka.forEach(function (obj) {
            obj.selected = false; // 添加新的键值对
          });
          let pcTimeSync = wx.getStorageSync('pcTimeSync') || {}
          if(pcTimeSync.hasChooseId) {
            let hasChooseIdList = pcTimeSync.hasChooseId.split(',');
            ka.forEach(item => {
              if (hasChooseIdList.includes(item.Id)) {
                item.selected = true;
              }
            });
          }

          console.log(ka)
          this.setData({
            juan,
            ka,
            hasCoupon: true
          })
        } else {
          this.setData({
            hasCoupon: false
          })
        }
      }, err => {
        console.log(err)
      })
    },
    handleSubmit() {
      let that = this;
      if (that.data.types == "次卡") {
        let rollArr = that.data.ka.filter(item => item.selected)
        console.log(rollArr)
        if (rollArr.length > that.data.person_number) {
          wx.showToast({
            title: '次卡不可超过乘车人数',
            icon: 'none',
          })
          return
        }
        this.triggerEvent("ExchangeItem", rollArr);
      } else if (that.data.types == "优惠券") {
        let item = that.data.juan.filter(item => item.selected)
        this.triggerEvent("ExchangeItem", item);
      }
      that.setData({
        showCoupon: false
      })
    },
    handleRadio(e) {
      var that = this;
      if(that.data.types == "次卡") {
        const index = e.currentTarget.dataset.item;
        var goods = that.data.ka; 
        const selected = goods[index].selected;
        goods[index].selected = !selected;
        console.log(goods)
        let pcTimeSync = wx.getStorageSync('pcTimeSync');
        const result  = goods
        .filter(item => item.selected === true) // 1. 筛选出 selected 为 true 的对象
        .map(item => item.id)                   // 2. 提取这些对象的 id
        .join(',');
        let updatedData = {
          ...pcTimeSync,
          hasChooseId: result
        };
        wx.setStorageSync('pcTimeSync', updatedData);
        that.setData({
          ka: goods,
        });
      } else if(that.data.types == "优惠券") {
        const index = e.currentTarget.dataset.item; 
        var goods = that.data.juan; 
        let newList = goods.map((item, i) => ({
          ...item,
          selected: i === index
        }));
        that.setData({
          juan: newList,
        });
      }
      
    },
    chooseCoupon() {
      let params = this.data.params;
      let id = this.data.curItemId || 0;
      let data = {
        couponId: id,
        businessType: params.businessType || 0,
        lineId: params.lineId || 0,
        lineType: params.lineType || 0,
        rideNumber: params.rideNumber || 0,
      }
      http.postRequest("/v2/passenger/integral/selectCoupon", data, wx.getStorageSync('header'), res => {
        if (this.data.curItemId) {
          this.triggerEvent("HasChooseCouponData", {
            data: res.content,
            isChoose: true
          });
        } else {
          this.triggerEvent("HasChooseCouponData", {
            data: res.content,
            isChoose: false
          });
        }
      }, err => {
        console.log(err)
      })
    },

    // exchange(e) {
    //   let item = e.currentTarget.dataset.item;
    //   if (clickTimer) clearTimeout(clickTimer);
    //   clickTimer = setTimeout(() => {
    //     this.exchangeReq(item);
    //   }, 500);
    // },

    // exchangeReq(item) {
    //   this.triggerEvent("ExchangeItem", item);
    //   this.setData({
    //     showCoupon: false
    //   })
    // },
    clickyouhui() {
      this.setData({
        types: '优惠券'
      })
    },
    clickcika() {
      this.setData({
        types: '次卡'
      })
    },
    handleBox() {
      this.setData({
        showCoupon: false
      })
    }
  }
})