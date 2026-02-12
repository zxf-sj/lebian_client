const app = getApp();
Page({
  data: {
    personNum:0,
    siteNum:5,
    siteList:[],
    imgHoverIndex:[],
    infos:{},
  },
  onLoad: function (options) {
    var num = options.personNum;
    var item = JSON.parse(options.item);
    console.log(1111,options.item)
    this.setData({
      personNum:num,
      infos:item
    })
    this.getInfo();
  },
  getInfo(){
    var info = this.data.infos;
    this.setList(info);
  },
  handleBtn(){
    let that = this;
    if(that.data.imgHoverIndex.length != that.data.personNum){
      wx.showToast({
        title: '乘车人数为'+that.data.personNum+'人，请选择'+that.data.personNum+'个座位',
        icon:'none',
        duration:2000    
      })
    }else{
      let list = that.data.imgHoverIndex;
      let list1 =list.sort();
      let str = list1.join(",");
      wx.setStorageSync('siteStr', str);
      wx.navigateBack({
        delta:1
      })
    }
  },
  setList(info){
    var arrs = info.seatList;
    var arr = [];
    var sitenum  = info.CarDirId_PersonNumber-1;
    var index = 0;
    var price = info.seatRule;
    var priceArr = price.split(",");
    var siteList=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10,
        'checked':0
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0,
        'checked':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0,
        'checked':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0,
        'checked':0
      },
    ];
    var siteList1=[
      {
        'id':"01",
        "name":"A",
        'isuser':0,
        'addprice':10,
        'checked':0
      },
      {
        'id':"02",
        "name":"B",
        'isuser':0,
        'addprice':0,
        'checked':0
      },
      {
        'id':"03",
        "name":"C",
        'isuser':1,
        'addprice':0,
        'checked':0
      }, {
        'id':"04",
        "name":"D",
        'isuser':1,
        'addprice':0,
        'checked':0
      },
      {
        'id':"05",
        "name":"E",
        'isuser':1,
        'addprice':0,
        'checked':0
      },
      {
        'id':"06",
        "name":"F",
        'isuser':1,
        'addprice':0,
        'checked':0
      },
    ];
    if(sitenum==4){
      for (var i=0;i<sitenum;i++)
      { 
        siteList[i].addprice = priceArr[i]
      }
      var aa = [];
      aa = siteList;
      for(var i=0;i<arrs.length;i++){
        if(arrs[i]==1){
          siteList[i].checked = 1;
        }else{
          siteList[i].checked = 0;
        }
      }
    }else{
      for (var i=0;i<sitenum;i++)
      { 
        siteList1[i].addprice = priceArr[i]
      }
      var aa = [];
      console.log(1111,arrs);
      for(var i=0;i<arrs.length;i++){
        if(arrs[i]==1){
          siteList1[i].checked = 1;
        }else{
          siteList1[i].checked = 0;
        }
      }
      aa = siteList1;
    }
    this.setData({
      siteNum:sitenum+1,
      siteList:aa,
      imgHoverIndex:arr,
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