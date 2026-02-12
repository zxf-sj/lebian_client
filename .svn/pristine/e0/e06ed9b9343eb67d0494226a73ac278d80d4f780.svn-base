// user_center/pages/invoiceTitle/invoiceTitle.js
import http from '../../../utils/http';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getList()
    },
    getList() {
        let _this = this;
        var openid = wx.getStorageSync('openid');
        if (!openid) {
            that.setData({
                listData: false,
                noOrder: true
            })
        } else {
            wx.showLoading({
                title: '',
            })
            var usreinfo = wx.getStorageSync('userInfo');
            // MemberId
            http.getRequest("/api/DispatchMobile/GetMemberCompanyList?MemberId=" + usreinfo.Id, '', '', res => {
                wx.hideLoading()
                console.log(res)
                this.setData({
                    dataList:res.data
                })
            }, err => {
                wx.hideLoading()
                return false;
            })
        }
    },
    handle_to(e) {
        let ids = e.currentTarget.dataset.index
        wx.navigateTo({
            url: '/user_center/pages/invoiceTemplate/invoiceTemplate?Id=' + ids,
        })
    },
    handle_add() {
        wx.navigateTo({
            url: '/user_center/pages/invoiceTemplate/invoiceTemplate',
        })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})