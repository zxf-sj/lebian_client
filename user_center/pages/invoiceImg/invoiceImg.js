// user_center/pages/invoiceImg/invoiceImg.js
const BASE_URL = require("../../../utils/BASE_URL");
var baseUrl = BASE_URL.BASE_URL //配置基础url
Page({
    data: {
      items: []
    },
    onLoad: function (options) {
        let imgList = JSON.parse(options.invoiceList);
        console.log(imgList.PicList)
        let newList = []
        for(let i =0; i< imgList.PicList.length;i++) {
            if(imgList.PicList[i].split('.')[1] == 'pdf') {
                newList.push({
                    id:i,
                    title: "",
                    imageUrl:'',
                    imageFilename: "product_image.jpg",
                    pdfUrl: baseUrl + imgList.PicList[i],
                    pdfFilename: "product_brochure.pdf"
                })
            } else {
                newList.push({
                    id:i,
                    title: "",
                    imageUrl:baseUrl + imgList.PicList[i],
                    imageFilename: "product_image.jpg",
                    pdfUrl: '',
                    pdfFilename: "product_brochure.pdf"
                })
            }
        }
        console.log(newList)
        this.setData({
            items:newList
        })
      },
    /**
     * 预览图片
     */
    previewImage(e) {
      const url = e.currentTarget.dataset.url;
      
      wx.previewImage({
        current: url,
        urls: [url],
        fail: (err) => {
          console.error('预览图片失败', err);
          wx.showToast({
            title: '预览失败',
            icon: 'none'
          });
        }
      });
    },
  
    /**
     * 下载图片
     */
    downloadImage(e) {
      const { url, filename } = e.currentTarget.dataset;
      
      if (!url) {
        wx.showToast({
          title: '图片链接无效',
          icon: 'none'
        });
        return;
      }
  
      wx.showLoading({
        title: '下载中...'
      });
  
      wx.downloadFile({
        url: url,
        success: (res) => {
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            // 保存文件到本地
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                wx.showToast({
                  title: '下载成功',
                  icon: 'success'
                });
                console.log('文件保存成功，保存路径：', saveRes.savedFilePath);
              },
              fail: (saveErr) => {
                console.error('保存文件失败', saveErr);
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            });
          } else {
            throw new Error(`下载失败，状态码: ${res.statusCode}`);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('下载图片失败', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    },
  
    /**
     * 打开PDF文件（在线查看）
     */
    openPDF(e) {
      const { url, filename } = e.currentTarget.dataset;
      
      if (!url) {
        wx.showToast({
          title: 'PDF链接无效',
          icon: 'none'
        });
        return;
      }
  
      wx.showLoading({
        title: '加载中...'
      });
  
      // 下载PDF文件
      wx.downloadFile({
        url: url,
        success: (res) => {
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            // 使用wx.openDocument打开PDF
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: 'pdf',
              showMenu: true,
              success: () => {
                console.log('成功打开PDF');
              },
              fail: (err) => {
                console.error('打开PDF失败', err);
                wx.showToast({
                  title: '打开失败',
                  icon: 'none'
                });
              }
            });
          } else {
            throw new Error(`下载失败，状态码: ${res.statusCode}`);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('下载PDF失败', err);
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      });
    },
  
    /**
     * 下载PDF文件
     */
    downloadPDF(e) {
      const { url, filename } = e.currentTarget.dataset;
      
      if (!url) {
        wx.showToast({
          title: 'PDF链接无效',
          icon: 'none'
        });
        return;
      }
  
      wx.showLoading({
        title: '下载中...'
      });
  
      wx.downloadFile({
        url: url,
        success: (res) => {
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            // 保存PDF文件到本地
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                wx.showToast({
                  title: '下载成功',
                  icon: 'success'
                });
                console.log('PDF文件保存成功，保存路径：', saveRes.savedFilePath);
              },
              fail: (saveErr) => {
                console.error('保存PDF失败', saveErr);
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            });
          } else {
            throw new Error(`下载失败，状态码: ${res.statusCode}`);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('下载PDF失败', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    }
  });