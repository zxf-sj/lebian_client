var $ = require('../../libs/conf.js');
var city = require('../../libs/city.js');
import http from '../../utils/http';
const app = getApp()
Page({
    data: {
        //城市下拉
        citySelected: '上海市',
        city: '',
        cityData: {},
        hotCityData: [],
        _py: ["hot", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"],
        //搜索列表
        inputVal: '',
        searchList: [],
        cityListShow: false,
        inputListShow: false,
        hidden: true,
        showPy: '★',
        //搜索历史记录
        historyListShow: true,
        historyList: [],
        from: '',
        searchCityVal: '',
        searchCityRes: [],
        hasCityRes:true,
        showAllCity:true,
    },
    onLoad: function (e) {
        this.setData({
            from: e.urlFrom,
            city: app.globalData.originCity,
            cityData: city.all,
            hotCityData: city.hot,
            type:e.type || null
        });

    },

    select(event) {
        var query = event.currentTarget.dataset;
        query.POIlongitude = query.poilocation.split(',')[0];
        query.POIlatitude = query.poilocation.split(',')[1];
        wx.navigateTo({
            url: '../detail/detail?query=' + JSON.stringify(query)
        });
        //历史记录
        // var history = $.saveHistory(wx.getStorageSync("historyList"), query);
        // this.setData({
        //     historyList: history
        // });
        //wx.setStorageSync("historyList", history);
    },

    //搜索关键字
    keyword: function (keyword) {
        var that = this;
        $.map.getInputtips({
            keywords: keyword,
            location: that.data.longitude + "," + that.data.latitude,
            success: function (data) {
                if (data && data.tips) {
                    var searchList = data.tips.filter((item) => {
                        return typeof item.location != 'undefined';
                    })
                    that.setData({
                        searchList: searchList
                    });
                }
            }
        });
    },

    //打开城市列表
    openCityList: function () {
        this.setData({
            cityListShow: true,
            inputListShow: false,
            historyListShow: false
        });
    },

    //选择城市
    selectCity: function (e) {
        var city = e.currentTarget.dataset.fullname;
        var code = e.currentTarget.dataset.code;
        console.log('searchFrom',this.data.from)
        if (this.data.from == 1) { //选择起点城市
            if(this.data.type === 'fixedLine'){
                app.globalData.lineStartCity = city;
                app.globalData.lineCityCode = code;
            }else{
                app.globalData.startCity = city
            }
            wx.navigateBack()
        }else  if (this.data.from == 2) { //选择终点城市
            app.globalData.destinationCity = city
            wx.navigateBack()
        }else  if (this.data.from == 3) { //远程
            app.globalData.lineStartCity = city;
            app.globalData.lineCityCode = code;
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            http.postRequest("/v2/passenger/remote/getRemoteStationListByCityCode?cityCode="+code, '', wx.getStorageSync('header'), res => {
                prevPage.setData({
                  lineStartList:res.content,
                  lineStartItem:res.content[0].remoteStationList[0] || null,
                  lineEndItem:''
                })
                wx.navigateBack()
              }, err => {
                console.log(err)
              })
        }else if(this.data.from == 4){ // 包车
            app.globalData.exclusiveCarStartCity = city;
            app.globalData.exclusiveCarCityCode = code;
            wx.navigateBack()
        }
    },
    touchstart: function (e) {
        this.setData({
            index: e.currentTarget.dataset.index,
            Mstart: e.changedTouches[0].pageX
        });
    },
    touchmove: function (e) {
        var history = this.data.historyList;
        var move = this.data.Mstart - e.changedTouches[0].pageX;
        history[this.data.index].x = move > 0 ? -move : 0;
        this.setData({
            historyList: history
        });
    },
    touchend: function (e) {
        var history = this.data.historyList;
        var move = this.data.Mstart - e.changedTouches[0].pageX;
        history[this.data.index].x = move > 100 ? -180 : 0;
        this.setData({
            historyList: history
        });
    },
    //获取文字信息
    getPy: function (e) {
        this.setData({
            hidden: false,
            showPy: e.target.id,
        })
    },

    setPy: function (e) {
        this.setData({
            hidden: true,
            scrollTopId: this.data.showPy
        })
    },

    //滑动选择城市
    tMove: function (e) {
        var y = e.touches[0].clientY,
        offsettop = e.currentTarget.offsetTop;
        //判断选择区域,只有在选择区才会生效
        if (y > offsettop) {
            var num = parseInt((y - offsettop) / 12);
            this.setData({
                showPy: this.data._py[num]
            })
        };
    },

    //触发全部开始选择
    tStart: function () {
        this.setData({
            hidden: false
        })
    },

    //触发结束选择
    tEnd: function () {
        this.setData({
            hidden: true,
            scrollTopId: this.data.showPy
        })
    },
    //清空历史记录
    clearHistory: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ['清空'],
            itemColor: '#DD4F43',
            success: function (res) {
                if (res.tapIndex == 0) {
                    that.setData({
                        historyList: []
                    });
                    wx.setStorageSync("historyList", []);
                }
            }
        })
    },
    //删除某一条
    del: function (e) {
        var that = this;
        wx.showActionSheet({
            itemList: ['删除'],
            itemColor: '#DD4F43',
            success: function (res) {
                if (res.tapIndex == 0) {
                    var index = e.currentTarget.dataset.index,
                        history = that.data.historyList;
                    history.splice(index, 1);
                    that.setData({
                        historyList: history
                    });
                    wx.setStorageSync("historyList", history);
                }
            }
        });
    },
    //输入
    input: function (e) {
        if (e.detail.value == '') {
            this.setData({
                inputVal: e.detail.value,
                inputListShow: false,
                cityListShow: false,
                historyListShow: true
            });
        } else {
            this.setData({
                inputVal: e.detail.value,
                inputListShow: true,
                cityListShow: false,
                historyListShow: false
            });
            this.keyword(this.data.citySelected + e.detail.value)
        }
    },

    //清除输入框
    clear: function () {
        this.setData({
            inputVal: '',
            inputListShow: false,
            historyListShow: true
        })
    },

    // 输入监听
    handleInput(e){
        this.setData({
            searchCityVal:e.detail.value
        })
        if(!e.detail.value){
            this.setData({
                showAllCity : true
            })
        }
    },

    // 点击搜索
    searchCity(){
        this.setData({
            showAllCity:false
        })
        let cityVal = this.data.searchCityVal.trim();
        let resCityList = [];
        for(let k in this.data.cityData){
            this.data.cityData[k].forEach(val=>{
                if(val.fullname.indexOf(cityVal) !== -1){
                    resCityList.push(val)
                }
            })
        }
        console.log(resCityList)
        if(resCityList.length === 0){
            this.setData({
                hasCityRes:false
            })
        }else{
            this.setData({
                searchCityRes : resCityList,
                hasCityRes:true
            })
        }
    }
})