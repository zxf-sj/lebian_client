const app = getApp()
let _this;
var http = require('../../../utils/http.js');
var base_url = require('../../../utils/BASE_URL');
const debounce = require('../../../utils/debounce');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        msg: {},
        temp: false,
        array: ["男", "女"],
        sex: 0,
        birthday: "2021-09-01",
        region: ['北京市', '北京市', '海淀区'],
        avatarUrl: "https://www.qierchuxing.com/upload/Annex/202411/AX-20241129-550505-127.png",
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        _this = this
        var msg = {};
        var info = wx.getStorageSync("userInfo");
        var list = [];
        list = [info.Province, info.City, info.County];
        info.region = list;
        //info.HeadIcon = info.HeadIcon?app.globalData.httpsUrl+info.HeadIcon:'';
        this.setData({
            msg: info,
            avatarUrl: info.HeadIcon ? app.globalData.httpsUrl + info.HeadIcon : '',
            region: list
        })
    },
    bindRegionChange: function (e) {
        var msg = this.data.msg;
        msg.region = e.detail.value;
        this.setData({
            region: e.detail.value,
            msg: msg
        })
        var userinfo = wx.getStorageSync('userInfo');
        var cc = e.detail.value;
        var data = {
            "Id": userinfo.Id,
            "Province": cc[0],
            "City": cc[1],
            "County": cc[2]
        };
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveProvince", data, wx.getStorageSync('header'), res => {
            wx.hideLoading()
            if (res.code == 0) {
                userinfo.Province = cc[0];
                userinfo.City = cc[1];
                userinfo.County = cc[2];
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '所在地区修改成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        }, err => {
            console.log(err)
            wx.hideLoading()
        })
    },
    bindSex(e) {
        var msg = this.data.msg;
        var array = this.data.array;
        msg.Gender_Name = array[e.detail.value];
        this.setData({
            sex: e.detail.value,
            msg: msg
        })
        var userinfo = wx.getStorageSync('userInfo');
        var sex = "";
        if (e.detail.value == 0) {
            sex = "100004-0000070001";
        } else {
            sex = "100004-0000070002";
        }
        var data = {
            "Id": userinfo.Id,
            "Gender": sex
        }
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveGender", data, wx.getStorageSync('header'), res => {
            wx.hideLoading()
            if (res.code == 0) {
                userinfo.Gender = sex;
                userinfo.Gender_Name = array[e.detail.value];
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '性别修改成功',
                })
            }
        }, err => {
            console.log(err)
            wx.hideLoading()
        })
    },
    bindBirthday(e) {
        var msg = this.data.msg;
        msg.Birthday = e.detail.value;
        this.setData({
            birthday: e.detail.value,
            msg: msg
        })
        var userinfo = wx.getStorageSync('userInfo');
        var data = {
            "Id": userinfo.Id,
            "Birthday": e.detail.value
        }
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveBirthday", data, wx.getStorageSync('header'), res => {
            wx.hideLoading()
            if (res.code == 0) {
                userinfo.Birthday = e.detail.value;
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '生日修改成功',
                })
            }
        }, err => {
            console.log(err)
            wx.hideLoading()
        })
    },
    onChooseAvatar(e) {
        let that = this;
        var userinfo = wx.getStorageSync('userInfo');
        const {
            avatarUrl
        } = e.detail
        that.setData({
            avatarUrl
        })
        wx.uploadFile({
            url: base_url.BASE_URL + '/Api/mobile/Picture', // 图片上传的接口地址，需要根据自己的实际情况填写
            filePath: avatarUrl, // 要上传的图片的本地路径
            name: 'file', // 上传图片时对应的参数名称，后端根据这个参数名称获取文件数据
            formData: { // 其他额外的参数
                'user': 'test'
            },
            success: (res) => {
                let data = JSON.parse(res.data) // 解析接口返回的数据
                if (data.code == 1) {
                    var datas = {
                        "Id": userinfo.Id,
                        "HeadIcon": data.data
                    }
                    wx.showLoading({
                        title: '',
                    })
                    http.postRequest("/Api/DispatchMobile/SaveHeadIcon", datas, wx.getStorageSync('header'), res => {
                        wx.hideLoading()
                        if (res.code == 0) {
                            userinfo.HeadIcon = data.data;
                            wx.setStorageSync('userInfo', userinfo);
                            wx.showToast({
                                title: '头像修改成功',
                            })
                        }
                    }, err => {
                        wx.hideLoading()
                        console.log(err)
                    })
                } else {
                    wx.showToast({
                        title: '上传失败',
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '上传失败',
                    icon: 'none'
                })
            }
        })
    },
    changeName: debounce(function (e) {
        wx.showLoading({
            title: '',
        })
        var userinfo = wx.getStorageSync('userInfo');
        var data = {
            "Id": userinfo.Id,
            "Name": e.detail.value
        }
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveName", data, wx.getStorageSync('header'), res => {
            console.log('res',res)
            if (res.code == 0) {
                userinfo.Name = e.detail.value
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '昵称修改成功',
                })
            } else {
                wx.showToast({
                    title: res.msg,
                })
            }
            wx.hideLoading()
        }, err => {
            console.log(err)
            wx.hideLoading()
        })
    }, 1000),
    changeTel: debounce(function (e) {
        if (e.detail.value && !/^1[3-9]\d{9}$/.test(e.detail.value)) {
            this.setData({
                phoneError: '请输入正确的手机号码'
            });
            return
        }
        this.setData({
            phoneError: ''
        });
        var userinfo = wx.getStorageSync('userInfo');
        var data = {
            "Id": userinfo.Id,
            "Phone": e.detail.value
        }
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveTel", data, wx.getStorageSync('header'), res => {
            wx.hideLoading()
            if (res.code == 0) {
                userinfo.Phone = e.detail.value
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '手机号码修改成功',
                })
            } else {
                wx.showToast({
                    title: res.msg,
                })
            }
        }, err => {
            wx.hideLoading()
            console.log(err)
        })
    }, 500),
    changeAddr(e) {
        var userinfo = wx.getStorageSync('userInfo');
        var data = {
            "Id": userinfo.Id,
            "HomeAddress": e.detail.value
        }
        wx.showLoading({
            title: '',
        })
        http.postRequest("/Api/DispatchMobile/SaveHomeAddress", data, wx.getStorageSync('header'), res => {
            wx.hideLoading()
            if (res.code == 0) {
                userinfo.HomeAddress = e.detail.value
                wx.setStorageSync('userInfo', userinfo);
                wx.showToast({
                    title: '详细地址修改成功',
                })
            } else {
                wx.showToast({
                    title: res.msg,
                })
            }
        }, err => {
            console.log(err)
            wx.hideLoading()
        })
    }
})