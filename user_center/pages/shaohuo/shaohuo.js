// user_center/pages/shaohuo/shaohuo.js
const throttle = require('../../../utils/throttle.js').throttle;
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
const debounce = require('../../../utils/debounce');
import http from '../../../utils/http.js';
const fs = wx.getFileSystemManager();
const CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB 原始数据（Base64 后约 2MB）
const UPLOAD_API = baseUrl + '/Api/UploadMobile/ImageChunk'; // 你的分片接口

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadedUrls: [], // [{ url: 'https://...' }]
    // --------------
    sendMailPhone: '', //寄件联系方式
    sendMailName: '',
    pickUpPhone: '', //取件联系方式
    pickUpName: '',
    belongings: '', //物品名称
    imgUrl: [], //物品照片地址
    remark: false,
    textareaValue: '',
    distanceNav_Data: '', //寄件日期、时间子->父->子传值
    showPreview: false,
    currentImage: '',
    currentIndex: -1,
    price: '',
    sharedData: [],
    rangfenceMapList: [],
    Version: '',
    PayAmount: '',
    newinformationId: '',
    DeliveryType: "",
    mrPrice:'',
    jisuan:'',
    num:11
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
    // if(wx.getStorageSync('mapBack')) {
    //   wx.removeStorageSync('mapBack')
    // } else {
    //   wx.removeStorageSync('starInfo2')
    //   wx.removeStorageSync('endInfo2')
    // }
  },
  sendMsg() {
    this.setData({
      jisuan:'jisuan'
    })
  },
  sendToParent2(e) {
    console.log(e)
    let a = e.detail.newinformationList.filter(item => item.checked == true)
    let b = e.detail.newremarkList.filter(item => item.checked == true)
    console.log(a,b)
    let mrPrice = {
      a:a.length>0?a[0].Price:'',
      b:b.length>0?b[0].Price:''
    }
    console.log(a)
    console.log(b)
    wx.setStorageSync('mrPrice', mrPrice)
    this.setData({
      sharedData: e.detail.newremarkList,
      newinformationId: a[0].Id,
      DeliveryType: b[0].Id,
    })
  },
  goods(e) {
    console.log(e.detail)
    let mrPrice = wx.getStorageSync('mrPrice')
    let updatedData = {
      ...mrPrice,
      a:e.detail[0].Price
    };
    wx.setStorageSync('mrPrice', updatedData)
    this.setData({
      newinformationId: e.detail[0].Id,
      jisuan:this.data.num++
    })
  },
  onRadioChange(e) {
    console.log(this.data.sharedData)
    let items = this.data.sharedData.filter(item => item.Id == e.detail.value)
    let mrPrice = wx.getStorageSync('mrPrice')
    let updatedData = {
      ...mrPrice,
      b:items[0].Price
    };
    wx.setStorageSync('mrPrice', updatedData)
    this.setData({
      DeliveryType: e.detail.value,
      jisuan:this.data.num++,
    })
  },
  handleFromA(e) {
    const data = e.detail;
    let newinformation = data.newinformationList.filter(item => item.checked == true)
    let newremarkId = data.newremarkList.filter(item => item.checked == true)
   
    this.setData({
      DeliveryType: newremarkId.length>0?newremarkId[0].Id:'',
      newinformationId: newinformation.length>0?newinformation[0].Id:'',
      sharedData: data.newremarkList,
      sendMailPhone: data.DeliverGoodsTel,
      pickUpPhone: data.TakeOverGoodsTel,
      rangfenceMapList: data.newremarkList[0].rangfenceMapList,
      Version: data.newremarkList[0].Version,
      PayAmount: data.PayAmount
    });
  },
  //------这里是上传组件
  // 1. 选择图片并自动上传
  async chooseAndUpload() {
    let that = this;
    if (that.data.uploadedUrls.length < 3) {
      try {
        // wx.chooseImage
        const {
          tempFilePaths
        } = await wx.chooseImage({
          count: 3 - that.data.uploadedUrls.length,
          sizeType: ['compressed'], // 压缩图
          sourceType: ['album', 'camera']
        });
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        const urls = [];
        // 串行上传（避免内存溢出）
        for (const path of tempFilePaths) {
          try {
            const url = await that.uploadFileChunked(path);
            console.log(url)
            urls.push(baseUrl + url.data);
          } catch (err) {
            wx.showToast({
              title: '部分上传失败',
              icon: 'none'
            });
            console.error('Upload failed:', err);
          }
        }
        console.log(urls)
        that.setData({
          uploadedUrls: [...that.data.uploadedUrls, ...urls]
        });
        wx.hideLoading();
        wx.showToast({
          title: '上传完成'
        });
      } catch (err) {
        wx.hideLoading();
        wx.showToast({
          title: '选择取消或失败',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '最多上传三张图片',
        icon: 'none'
      });
    }

  },
  // 2. 分片上传单个文件
  uploadFileChunked(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile({
        filePath,
        success: ({
          data: arrayBuffer
        }) => {
          const totalSize = arrayBuffer.byteLength;
          const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
          const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          let uploadedCount = 0;
          // 上传每个分片
          for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, totalSize);
            const chunk = arrayBuffer.slice(start, end);
            const base64 = wx.arrayBufferToBase64(chunk);
            wx.request({
              url: UPLOAD_API,
              method: 'POST',
              data: {
                FileKey: fileId, // 文件唯一 ID
                ChunkIndex: i, // 当前分片索引（从 0 开始）
                ChunkCount: totalChunks, // 总分片数
                ChunkData: base64 // Base64 字符串
              },
              timeout: 30000,
              success: res => {
                if (res.statusCode !== 200) {
                  return reject(new Error(`分片 ${i} 失败: ${res.statusCode}`));
                }
                uploadedCount++;
                // 最后一片上传完成，应返回 { url: "..." }
                if (uploadedCount === totalChunks) {
                  const url = res.data;
                  // const url = result.url || result.data?.url;
                  if (url) resolve(url);
                  else reject(new Error('未返回有效 URL'));
                }
              },
              fail: reject
            });
          }
        },
        fail: reject
      });
    });
  },
  //点击图片查看
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentImage: this.data.uploadedUrls[index],
      currentIndex: index,
      showPreview: true
    });
  },
  //关闭查看图片
  closePreview() {
    this.setData({
      showPreview: false
    });
  },
  //删除图片
  deleteImage() {
    const {
      currentIndex,
      uploadedUrls
    } = this.data;
    wx.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const newList = [...uploadedUrls];
          newList.splice(currentIndex, 1);
          this.setData({
            uploadedUrls: newList,
            showPreview: false
          });
          // 可选：调用接口删除服务器图片
        }
      }
    });
  },
  //----上面是上传组件
  //寄件联系方式填写
  sendMailInput:debounce(function(e) {
    let _this = this
    let phone_number = e.detail.value
    console.log(phone_number)
    const reg = /^1[3-9]\d{9}$/;
    let isphone = reg.test(phone_number);
    if(isphone) {
      _this.setData({
        sendMailPhone:phone_number
      })
    } else {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error',
        duration: 2000
      })
    }
    
  },500),
  sendMailName(e) {
    this.setData({
      sendMailName: e.detail.value
    })
  },
  pickUpInput:debounce(function(e) {
    let _this = this
    let phone_number = e.detail.value
    console.log(phone_number)
    const reg = /^1[3-9]\d{9}$/;
    let isphone = reg.test(phone_number);
    if(isphone) {
      _this.setData({
        pickUpPhone:phone_number
      })
    } else {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error',
        duration: 2000
      })
    }
    
  },500),
  pickUpName(e) {
    this.setData({
      pickUpName: e.detail.value
    })
  },
  //去下单
  handleCallCar: throttle(function (e) {
    // console.log('下单', e)
    let that = this;
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.navigateTo({
        url: '/user_center/pages/login/login',
      })
      return false;
    }
    var startInfo = wx.getStorageSync('starInfo2');
    if (!startInfo.startAddress) {
      wx.showToast({
        title: '请选择出发乘车位置',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var endInfo = wx.getStorageSync('endInfo2');
    if (!endInfo.endAddress) {
      wx.showToast({
        title: '请选择下车位置',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    var user = wx.getStorageSync('userInfo');
    console.log("newinformationId",that.data.newinformationId)
    console.log('DeliveryType',that.data.DeliveryType)
    var pcTypeId = that.data.newinformationId
    if (!pcTypeId) {
      wx.showToast({
        title: '请选择物品大小',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (!that.data.sendMailPhone) {
      wx.showToast({
        title: '请输入寄件人联系方式',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    if (!that.data.pickUpPhone) {
      wx.showToast({
        title: '请输入收件人联系方式',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    
    var note = wx.getStorageSync('textareaValue');
    var storageSync = wx.getStorageSync('storageSync')
    var startDate = storageSync.startDate;
    let reqData = {
      PassengerLineId: storageSync.lineId,
      IntoLocation: startInfo.startAddress,
      IntoLongitude: startInfo.startLont,
      IntoLatitude: startInfo.startLait,
      OffLocation: endInfo.endAddress,
      OffLongitude: endInfo.endLont,
      OffLatitude: endInfo.endLait,
      PassengerNumber: 1,
      Departure: "100004-0000980002",
      Personal: user.Id,
      SeatNumber: '', //????
      IsReservation: "100004-0000010002",
      Note: note, //空
      IsExclusive: "100004-0000010001",
      IsPickGoods: '100004-0000010001',
      SelectCarType: pcTypeId, //物品规格Id
      OrderSource: "小程序",
      priceType: '100004-0001270001',
      DeliverGoodsTel: that.data.sendMailPhone,
      DeliverGoodsName: that.data.sendMailName,//没有
      TakeOverGoodsTel: that.data.pickUpPhone,
      TakeOverGoodsName: that.data.pickUpName,//没有
      GoodsSize: that.data.belongings,
      ImgList: that.data.uploadedUrls,
      DeliveryType: that.data.DeliveryType
    };
    let phoneStr = that.data.sendMailPhone + '|' + that.data.sendMailName + "," + that.data.pickUpPhone + '|' + that.data.pickUpName
    http.getRequest('/Api/DispatchMobile/IsUserHaveDayOrder?phone=' + phoneStr + '&timeDay=' + startDate, '', '', res => {
      console.log(res)
      if (res.code == 0) {
        if (res.count == 0) {
          if (that.data.dispatchListId) {
            wx.showLoading({
              title: '车辆调度中',
            })
          } else {
            wx.showLoading({
              title: '加载中...',
            })
          }
          wx.request({
            url: baseUrl + '/api/DispatchMobile/CreateBringGoodsOrder',
            data: reqData,
            method: "POST",
            success(res) {
              var ress = res.data
              console.log(ress)
              if (ress.code == '0') {
                wx.hideLoading();
                console.log('拿支付信息')
                wx.showToast({
                  title: '下单成功',
                  icon: 'success',
                  duration: 2000
                })
               
                http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (res) => {
                  console.log(res)
                  if (res.code == 0) {
                    var data = JSON.parse(res.data);
                    wx.requestPayment({
                      timeStamp: data.timeStamp,
                      nonceStr: data.nonceStr,
                      package: data.package,
                      signType: 'MD5',
                      paySign: data.paySign,
                      success(res) {
                        console.log('回调', res)
                        wx.removeStorageSync('starInfo2');
                        wx.removeStorageSync('endInfo2');
                        wx.removeStorageSync('storageSync')
                        wx.removeStorageSync('passengerList')
                        wx.removeStorageSync('pcTimeSync')
                        wx.removeStorageSync('personNum')
                        wx.removeStorageSync('pcTypeId');
                        wx.removeStorageSync('SeatNumber')
                        wx.removeStorageSync('textareaValue');
                        wx.removeStorageSync('lineId');
                        console.log('拉起支付')
                        wx.showToast({
                          title: '支付成功',
                          icon: 'success',
                          duration: 2000,
                          success: function () {
                            console.log('支付成功')
                            that.setSubscribeMessage();
                            setTimeout(function () {
                              wx.reLaunch({
                                url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                              })
                            }, 1000)
                          }
                        })
                      },
                      fail(res) {
                        console.log('拉起支付失败', res)
                        setTimeout(function () {
                          wx.reLaunch({
                            url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                          })
                        }, 1000)
                      }
                    })
                  } else {
                    wx.showToast({
                      title: res.msg,
                      icon: 'success',
                      duration: 2000,
                    })
                  }
                }, (err) => {
                  console.log(err)
                })

              } else {
                wx.showToast({
                  title: ress.msg,
                  icon: 'none',
                  duration: 2000
                })
              }
            },
          })
        } else {
          var list = res.data;
          var str = "";
          list.forEach(function (item, index) {
            str += item.PassengerLineId_Name + "," + "订单号为:" + item.Code + "\n"
          });
          wx.showModal({
            title: '下单记录',
            content: str,
            cancelText: "取消下单",
            confirmText: "继续下单",
            complete: (res) => {
              if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/index/index',
                })
              }
              if (res.confirm) {
                if (that.data.dispatchListId) {
                  wx.showLoading({
                    title: '车辆调度中',
                  })
                } else {
                  wx.showLoading({
                    title: '加载中...',
                  })
                }

                wx.request({
                  url: baseUrl + '/Api/DispatchMobile/CreateBringGoodsOrder',
                  data: reqData,
                  method: "POST",
                  success(res) {
                    console.log(res)
                    var ress = res.data
                    if (ress.code == '0') {
                      wx.hideLoading();
                      console.log('拿支付信息')
                      http.getRequest('/Api/DispatchMobile/GoPay?LayerOrder=1&Id=' + ress.data.Id + '&MemberInfoId=' + user.Id, "", wx.getStorageSync('header'), (res) => {
                        console.log(res)
                        if (res.code == 0) {
                          var data = JSON.parse(res.data);
                          console.log('拉起支付')
                          wx.requestPayment({
                            timeStamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            signType: 'MD5',
                            paySign: data.paySign,
                            success(res) {
                              console.log('回调', res)
                              wx.removeStorageSync('starInfo2');
                              wx.removeStorageSync('endInfo2');
                              wx.removeStorageSync('storageSync')
                              wx.removeStorageSync('passengerList')
                              wx.removeStorageSync('pcTimeSync')
                              wx.removeStorageSync('personNum')
                              wx.removeStorageSync('pcTypeId');
                              wx.removeStorageSync('SeatNumber')
                              wx.removeStorageSync('textareaValue');
                              wx.removeStorageSync('lineId');
                              console.log('支付成功')
                              wx.showToast({
                                title: '支付成功',
                                icon: 'success',
                                duration: 2000,
                                success: function () {
                                  that.setSubscribeMessage();
                                  setTimeout(function () {
                                    wx.reLaunch({
                                      url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                    })
                                  }, 1000)
                                }
                              })
                            },
                            fail(res) {
                              console.log('拉起支付失败', res)
                              setTimeout(function () {
                                wx.reLaunch({
                                  url: '/user_center/pages/payDetail/payDetail?orderId=' + ress.data.Id + "&from=orderList"
                                })
                              }, 1000)
                            }
                          })
                        } else {
                          wx.showToast({
                            title: res.msg,
                            icon: 'success',
                            duration: 2000,
                          })
                        }
                      }, (err) => {
                        console.log(err)
                      })

                    } else {
                      wx.showToast({
                        title: ress.msg,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  },
                })
              }
            }
          })
        }
      } else {
        wx.showToast({
          title: '数据请求失败，请稍后重试111',
          icon: "error"
        })
      }
    }, err => {
      console.log(1111, err)
    })


  }, 5000),
  setSubscribeMessage:function(){
    wx.requestSubscribeMessage({
      tmplIds: ['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'],
      success(res) {
        if (res['deEFYI36UL3YupVO80D_0yKwFT_Q2NPV-VpYqGhn9DA'] === 'accept') {
          console.log('用户同意接收订阅消息');
        } else {
          wx.showModal({
            title: '订阅消息',
            content: '您当前拒绝接受消息通知，是否去开启',
            confirmText: '开启授权',
            confirmColor: '#345391',
            cancelText: '仍然拒绝',
            cancelColor: '#999999',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting);
                  },
                  fail(err) {
                    //失败
                    console.log(err);
                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        }
      },
      fail(err) {
        console.log('请求订阅消息权限失败：', err);
      }
    });
  },
  //information 组件 triggerEvent 传值 
  updatedData(e) {
    console.log(e.detail)
    const newData = e.detail;
    this.setData({
      distanceNav_Data: newData
    });
  },

  belongingsInput(e) {
    this.setData({
      belongings: e.detail.value
    })
  },
  handleTextareaValue(e) {
    this.setData({
      textareaValue: e.detail
    })
  },
  handlejijian() {
    this.setData({
      remark: true
    })
  },
  shippingCost(e) {
    console.log(e)
    this.setData({
      price: e.detail
    })
  },
  //上传物品照片
  handleUpload(e) {
    // imgUrl
    const that = this;
    wx.chooseMedia({
      count: 5, // 默认9，设置图片的最大数量
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          imgUrl: res.tempFiles // 将选择的图片路径设置到data中，用于显示
        });
        // 如果需要上传图片到服务器，可以使用res.tempFilePaths[0]作为参数进行上传
        // wx.uploadFile({
        //   url: '服务器地址', // 仅为示例，非真实的接口地址
        //   filePath: res.tempFilePaths[0],
        //   name: 'file', // 必须填，否则无法上传文件
        //   formData: {
        //     'user': 'test' // 其他表单参数
        //   },
        //   success(uploadRes) {
        //     console.log(uploadRes)
        //   }
        // })
      }
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

function cleanup(paths) {
  paths.forEach(p => {
    try {
      fs.unlinkSync(p);
    } catch (e) {}
  });
}