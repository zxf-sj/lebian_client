const app = getApp();
import http from '../../utils/http.js';
Page({
  data: {
    current: 0,
    personNum:0,
    typeList: [
      {
        'id':'0',
        "name":"五座",
        "nums":5,
        "pinpai":"长安"
      },
      {
        'id':'1',
        "name":"7座",
        "nums":7,
        "pinpai":"长安"
      },
      {
        'id':'2',
        "name":"五座",
        "nums":5,
        "pinpai":"传祺"
      },
      {
        'id':'3',
        "name":"七座",
        "nums":7,
        "pinpai":"传祺"
      },
    ],
    checkedIndex:null,
    siteNum:5,
    siteList:[],
    imgHoverIndex:[],
    cartype:"",
    isAlone:null,
    cartypeId:"",
  },
  onLoad: function (options) {
    var num = options.personNum
    var isAlone = options.isAlone; //0拼车 1独享
    this.getList();
    this.setData({
      personNum:num,
      isAlone:isAlone
    })
  },
  getList(){
    http.getRequest('/Api/DispatchMobile/getOnLineCarType','', wx.getStorageSync('header'), (res) => {
      if (res.code == '0') {
        var cartypeid = wx.getStorageSync('cartypeId');
        if(cartypeid){
          this.setList(res.data);
        }
        this.setData({
          typeList:res.data
        })
      }
    }, (err) => {
      console.log(err)
    })
  },
  handleBtn(){
    let that = this;
    var str ="";
    if(that.data.siteNum==5){
      str = "A,B,C,D";
    }else{
      str = "A,B,C,D,E,F";
    }
    wx.setStorageSync('siteStr', str);
    str =  that.data.cartype+' '+str;
    wx.setStorageSync('siteInfoStr', str);
    wx.setStorageSync('cartypeId',that.data.cartypeId);
    wx.setStorageSync('renNum', that.data.siteNum-1);
    wx.navigateBack({
      delta:1
    })
    
  },
  setList(list){
    var index = 0;
    var typeId= wx.getStorageSync('cartypeId');
    var sitStr = wx.getStorageSync('siteStr');
    var arr = sitStr.split(",");
    for(var i = 0;i<list.length;i++){
      if(list[i].Id == typeId){
        index = i;
      }
    }
    var sitenum  =  list[index].SeatNum;
    var price = list[index].PriceRule;
    var priceArr = price.split(",");
    var siteList=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0
      },
    ];
    var siteList1=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0
      },
      {
        'id':"05",
        "name":"E",
        'isuser':1,
        'addprice':0
      },
      {
        'id':"06",
        "name":"F",
        'isuser':1,
        'addprice':0
      },
    ];
    if(sitenum==4){
      for (var i=0;i<sitenum;i++)
      { 
        siteList[i].addprice = priceArr[i]
      }
      var aa = [];
      aa = siteList
    }else{
      for (var i=0;i<sitenum;i++)
      { 
        siteList1[i].addprice = priceArr[i]
      }
      var aa = [];
      aa = siteList1
    }
    this.setData({
      checkedIndex:index,
      siteNum:sitenum+1,
      siteList:aa,
      imgHoverIndex:arr,
      cartype:list[index].Name,
      cartypeId:list[index].Id
    })
  },
  bindChooseState(e){
    var list = this.data.typeList;
    var index = e.currentTarget.dataset.index;
    var sitenum  = e.currentTarget.dataset.sitenum;
    var price = e.currentTarget.dataset.price;
    var priceArr = price.split(",");
    var siteList=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0
      },
    ];
    var siteList1=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0
      },
      {
        'id':"05",
        "name":"E",
        'isuser':1,
        'addprice':0
      },
      {
        'id':"06",
        "name":"F",
        'isuser':1,
        'addprice':0
      },
    ];
    if(sitenum==4){
      for (var i=0;i<sitenum;i++)
      { 
        siteList[i].addprice = priceArr[i]
      }
      var aa = [];
      aa = siteList
    }else{
      for (var i=0;i<sitenum;i++)
      { 
        siteList1[i].addprice = priceArr[i]
      }
      var aa = [];
      aa = siteList1
    }
    this.setData({
      checkedIndex:index,
      siteNum:sitenum+1,
      siteList:aa,
      imgHoverIndex:[],
      cartype:list[index].Name,
      cartypeId:list[index].Id
    })
  },
  xuanSite(e){
    var name = e.currentTarget.dataset.name;
    var arr = this.data.imgHoverIndex;
    if(arr.includes(name)){
      let index = arr.indexOf(name); // 获取要删除元素的索引  
      if (index !== -1) {  
        arr.splice(index, 1); // 删除元素  
      } 
    }else{
      arr.push(name);
    }
    this.setData({
      imgHoverIndex:arr
    })
    console.log(name,this.data.imgHoverIndex);
  }
})