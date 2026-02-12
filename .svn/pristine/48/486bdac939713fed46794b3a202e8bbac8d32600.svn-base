var startPoint;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    play: false,
    buttonTop:0,
    buttonLeft:0,
    windowWidth:"",
    windowHeight:"",
  },
  onLoad(){
  
  },
  /**
   * 组件的方法列表
   */
  lifetimes: {
    // 在组件实例刚刚被创建时执行
    created: function () { },
    // 在组件实例进入页面节点树时执行
    attached: function () { 
       this.getInit();
    },
    // 在组件实例被从页面节点树移除时执行
    detached: function () { },
  },
  methods: {
    getInit(){
      let that = this;
      let res =wx.getWindowInfo();
      that.setData({
        windowHeight:res.windowHeight,
        windowWidth:res.windowWidth,
        buttonTop:res.windowHeight * 0.45,
        buttonLeft:res.windowWidth * 0.85
      })
    },
    changePlay(){
      let flag = !this.data.play;
      this.setData({
        play:flag
      });
      //start title
      let titleOpenAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '50% 50% 0'
      });
      titleOpenAn.opacity(0).step();
      this.setData({
        titleOpenAn:titleOpenAn.export()
      });
      let titleCloseAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '50% 50% 0'
      });
      titleCloseAn.opacity(1).step();
      this.setData({
        titleCloseAn:titleCloseAn.export()
      });
      //end title
      // start 第一条line
      let line1OpenAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '50% 50% 0'
      });
      line1OpenAn.translateY(12).rotate(45).scale(1.4, 1).step();
      this.setData({
        line1OpenAn:line1OpenAn.export()
      });
      let line1CloseAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '12rpx 50%'
      });
      line1CloseAn.translateY(0).rotate(0).scale(1, 1).step();
      this.setData({
        line1CloseAn:line1CloseAn.export()
      });
      //end 第一条line
  
      // start 第二条line
      let line2OpenAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '100% 0'
      });
      line2OpenAn.translateY(-6.5).translateX(-1).rotate(-45).scale(1.4, 1).step();
      this.setData({
        line2OpenAn:line2OpenAn.export()
      });
  
      let line2CloseAn = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '46rpx 50%'
      });
      line2CloseAn.translateY(0).rotate(0).scale(1, 1).step();
      this.setData({
        line2CloseAn:line2CloseAn.export()
      });
      //end 第二条line
  
      //start 第一个按钮
      let btn1Open = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '100% 0'
      });
      btn1Open.translateX(-60).opacity(1).step();
      this.setData({
        btn1Open:btn1Open.export()
      });
  
      let btn1Close = wx.createAnimation({
        duration: 300,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '46rpx 50%'
      });
      btn1Close.translateX(0).opacity(0).step();
      this.setData({
        btn1Close:btn1Close.export()
      });
      //end 第一个按钮
      //start 第二个按钮
      let btn2Open = wx.createAnimation({
        duration: 500,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '100% 0'
      });
      btn2Open.translateX(-120).opacity(1).step();
      this.setData({
        btn2Open:btn2Open.export()
      });
  
      let btn2Close = wx.createAnimation({
        duration: 500,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '46rpx 50%'
      });
      btn2Close.translateX(0).opacity(0).step();
      this.setData({
        btn2Close:btn2Close.export()
      });
      //end 第二个按钮
      //start 第三个按钮
      let btn3Open = wx.createAnimation({
        duration: 700,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '100% 0'
      });
      btn3Open.translateX(-180).opacity(1).step();
      this.setData({
        btn3Open:btn3Open.export()
      });
  
      let btn3Close = wx.createAnimation({
        duration: 700,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '46rpx 50%'
      });
      btn3Close.translateX(0).opacity(0).step();
      this.setData({
        btn3Close:btn3Close.export()
      });
      //end 第三个按钮
      //start 第四个按钮
      let btn4Open = wx.createAnimation({
        duration: 700,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '100% 0'
      });
      btn4Open.translateX(-240).opacity(1).step();
      this.setData({
        btn4Open:btn4Open.export()
      });
  
      let btn4Close = wx.createAnimation({
        duration: 700,
        timingFunction: 'forwards',
        delay: 0,
        transformOrigin: '46rpx 50%'
      });
      btn4Close.translateX(0).opacity(0).step();
      this.setData({
        btn4Close:btn4Close.export()
      });
      //end 第四个按钮
    },
    goIndex(){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    },
    goKeFu(){
      var tel = wx.getStorageSync("servicePhone");
      wx.showModal({
        title: '联系客服',
        content: '客服电话'+wx.getStorageSync("servicePhone"),
        success(res) {
           if (res.confirm) {
              wx.makePhoneCall({
                phoneNumber: wx.getStorageSync('servicePhone') // 你要拨打的电话号码
              })
           } else if (res.cancel) {
             wx.showToast({
               title: '取消拨打客服电话',
               icon:"error"
             })
           }
        }
      })
    },
    goNotice(){
      wx.navigateTo({
        url: '/pages/notice/notice',
      })
    },
    goMy(){
      wx.navigateTo({
        url: '/user_center/pages/personalCenter/personalCenter',
      })
    },
    buttonStart(e){
      startPoint = e.touches[0];
    },
    bottonMove(e){
      var endPoint = e.touches[e.touches.length-1];
      var translateX = endPoint.clientX-startPoint.clientX;
      var translateY = endPoint.clientY-startPoint.clientY;
      startPoint = endPoint;
      var buttonTop = this.data.buttonTop + translateY;
      var buttonLeft = this.data.buttonLeft + translateX;
      if( buttonLeft+50 >= this.data.windowWidth){
        buttonLeft = this.data.windowWidth-50;
      }
      if(buttonLeft<=0){
        buttonLeft =0;
      }
      if(buttonTop<=0){
        buttonTop = 0;
      }
      if(buttonTop+50 >= this.data.windowHeight){
        buttonTop =this.data.windowHeight-50
      }
      this.setData({
        buttonTop:buttonTop,
        buttonLeft:buttonLeft
      })
    },
    buttonEnd(e){
  
    }
  }
})