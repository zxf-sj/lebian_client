
const app = getApp();
import http from '../../utils/http';
Page({
  data: {
    remark:[],
    label1:false,
    label2:false,
    label3:false,
    remark1:false,
    remark2:false,
    remark3:false,
    remark4:false,
    remark5:false,
    goods:[],
    userIdsArr:[],
    remarkInput:"",
    pnums:0,
    phoneArr:[]
  },
  onLoad(opt){
    wx.removeStorageSync('totalNum');
    wx.removeStorageSync('personStr');
    var nums = opt.pnums;
    this.setData({
      pnums:nums
    })
    this.getUserList();
  },

  label: function (e) {
    var type = e.currentTarget.dataset.index;
    var that = this;
    var data = that.data;
    if(type == 'label1'){
      if(data[type]==false){
        that.setData({
          label1:true,
          label2:false,
          label3:false,
        })
      }else{
        that.setData({
          label1:false,
          label2:false,
          label3:false,
        })
      }
    }else if(type=='label2'){
      console.log(2222)
      if(data[type]==false){
        that.setData({
          label1:false,
          label2:true,
          label3:false,
        })
      }else{
        that.setData({
          label1:false,
          label2:false,
          label3:false,
        })
      }
    }else if((type=='label3')){
      console.log(3333)
      if(data[type]==false){
        that.setData({
          label1:false,
          label2:false,
          label3:true,
        })
      }else{
        that.setData({
          label1:false,
          label2:false,
          label3:false,
        })
      }
    }
  },
  chooseRemark1(e){
      var that = this;
      var remark = that.data.remark;
      var remarkstatus = e.currentTarget.dataset.index;
      if(remarkstatus){ //删除
        var index = remark.indexOf(e.currentTarget.dataset.remark);
        if(index != -1){
          remark.splice(index, 1);
        }
      }else{//添加
        remark.push(e.currentTarget.dataset.remark)
        that.setData({
          remark:remark
        })
      }
      console.log(that.data.remark);
      that.setData({
        remark1: !e.currentTarget.dataset.index
      })
  },
  chooseRemark2(e){
    var that = this;
    var remark = that.data.remark;
    var remarkstatus = e.currentTarget.dataset.index;
    if(remarkstatus){ //删除
      var index = remark.indexOf(e.currentTarget.dataset.remark);
      if(index != -1){
        remark.splice(index, 1);
      }
    }else{//添加
      remark.push(e.currentTarget.dataset.remark)
      that.setData({
        remark:remark
      })
    }
    console.log(that.data.remark);
    that.setData({
      remark2: !e.currentTarget.dataset.index
    })
  },
  chooseRemark3(e){
    var that = this;
    var remark = that.data.remark;
    var remarkstatus = e.currentTarget.dataset.index;
    if(remarkstatus){ //删除
      var index = remark.indexOf(e.currentTarget.dataset.remark);
      if(index != -1){
        remark.splice(index, 1);
      }
    }else{//添加
      remark.push(e.currentTarget.dataset.remark)
      that.setData({
        remark:remark
      })
    }
    console.log(that.data.remark);
    that.setData({
      remark3: !e.currentTarget.dataset.index
    })
  },
  chooseRemark4(e){
    var that = this;
    var remark = that.data.remark;
    var remarkstatus = e.currentTarget.dataset.index;
    if(remarkstatus){ //删除
      var index = remark.indexOf(e.currentTarget.dataset.remark);
      if(index != -1){
        remark.splice(index, 1);
      }
    }else{//添加
      remark.push(e.currentTarget.dataset.remark)
      that.setData({
        remark:remark
      })
    }
    console.log(that.data.remark);
    that.setData({
      remark4: !e.currentTarget.dataset.index
    })
  },
  chooseRemark5(e){
    var that = this;
    var remark = that.data.remark;
    var remarkstatus = e.currentTarget.dataset.index;
    if(remarkstatus){ //删除
      var index = remark.indexOf(e.currentTarget.dataset.remark);
      if(index != -1){
        remark.splice(index, 1);
      }
    }else{//添加
      remark.push(e.currentTarget.dataset.remark)
      that.setData({
        remark:remark
      })
    }
    that.setData({
      remark5: !e.currentTarget.dataset.index
    })
  },
  bindInput(e){
    var value = e.detail.value;
    this.setData({
      remarkInput:value
    })
  },
  handleBtn(){
    let that = this;
    var arr = that.data.userIdsArr;
    var totalnum = arr.length;
    var personStr = "";
    personStr = arr.join(",");
    var remarkArr = that.data.remark;
    var note =  remarkArr.join(",");
    var inputvalue = that.data.remarkInput;
    var brr = that.data.phoneArr;
    var phoneStr = "";
    phoneStr = brr.join(",");
    if(inputvalue){
      note = note+","+inputvalue;
    }
    console.log(totalnum)
    console.log('乘车人数不能超过'+that.data.pnums+'人')
    if(totalnum > that.data.pnums){
      if(that.data.pnums == 0) {
        wx.showToast({
          title: '请先选择乘坐车辆',
          icon:'none',
        })
      } else {
        wx.showToast({
          title: '乘车人数不能超过'+that.data.pnums+'人',
          icon:'none',
        })
      }
      
    }else if(totalnum ==0){
      wx.showToast({
        title: '请选择乘车人',
        icon:'none',
      })
    }else{
      wx.setStorageSync('phoneStr',phoneStr);
      wx.setStorageSync('totalNum', totalnum);
      wx.setStorageSync('personStr',personStr);
      wx.setStorageSync('note',note);
      wx.navigateBack({
        delta:1
      })
    }
  },
  onShow(){
    this.setData({
      userIdsArr:[]
    })
    this.getUserList();
  },
  change: function (e) {
    var that = this;
    const index = e.currentTarget.dataset.index; // 获取data- 传进来的index
    var goods = that.data.goods; // 获取购物车列表
    const selected = goods[index].selected; // 获取当前商品的选中状态
    let arr = that.data.userIdsArr;
    let brr = that.data.phoneArr;
    if(selected){
      var key = goods[index]['Phone']+"|"+goods[index]['RealName'];
      let index1 = arr.indexOf(key);
      if (index1 > -1) {
        arr.splice(index1, 1);
      }
      var key1 = goods[index]['Phone'];
      let index2 = brr.indexOf(key1);
      if (index2 > -1) {
        brr.splice(index2, 1);
      }
    }else{
      arr.push(goods[index].Phone+"|"+goods[index].RealName);
      brr.push(goods[index].Phone);
    }
    console.log(arr);
    console.log(brr);
    goods[index].selected = !selected; // 改变状态
    goods[index]['selected'] = !selected;
    that.setData({
      goods: goods,
      userIdsArr:arr,
      phoneArr:brr
    });
  },
  addUser(){
    wx.navigateTo({
      url: '/pages/addUser/addUser',
    })
  },
  getUserList() {
    let that = this;
    var usreinfo = wx.getStorageSync('userInfo');
    http.getRequest("/Api/Mobile/AddressList?MemberId="+usreinfo.Id, '', wx.getStorageSync('header'), res => {
      that.setData({
        loading: false
      })
      if (res.code == 0) {
        var listDdata = res.data;
        var personstr = wx.getStorageSync('personStr');
        if(personstr){
          var personArr = personstr.split(",");
          personArr.forEach(function(item) {
            for(var i=0;i<listDdata.length;i++){
              if(listDdata[i].Id==item){
                listDdata[i].selected =true
              }
            }
          });
          that.setData({
            userIdsArr:personArr
          })
        }
        that.setData({
          goods:listDdata
        })
      }else{
        that.setData({
          listData:[],
          noMore:true
        })
      }
    }, err => {
      this.setData({
        loadingFailed: true
      })
      return false;
    })
  },
})