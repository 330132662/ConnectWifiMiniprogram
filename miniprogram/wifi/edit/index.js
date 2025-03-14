const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

let timeoutId = null
let videoAd = null
let videoError = false

Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this)
    Store._init(null, () => {
      const custom = this.data.custom
      if (
        custom.form_ad.ad_jili_active &&
        custom.form_ad.ad_jili &&
        wx.createRewardedVideoAd
      ) {
        videoAd = wx.createRewardedVideoAd({
          adUnitId: custom.form_ad.ad_jili,
        })
        videoAd.onLoad(() => {
          videoError = false
        })
        videoAd.onError(() => {
          videoError = true
          app.utils.toastText('激励视频广告加载失败')
        })
        videoAd.onClose(async res => {
          if (res && res.isEnded) {
            await this.handleSaveWifiCode()
          } else {
            wx.showModal({
              content: '保存之前必须认真看完广告哦，否则无法正常保存WiFi信息。',
              showCancel: true,
              cancelText: '取消',
              cancelColor: '#bbb',
              confirmText: '确定',
              confirmColor: '#222',
              success: result => {
                if (result.confirm) {
                  videoAd.show()
                }
              },
              fail: e => {
                console.error(e)
              },
            })
          }
        })
      }
    })
    const { uid, scene } = options
    if (uid || scene) {
      this.uid = uid || scene
      wx.setNavigationBarTitle({ title: '编辑WiFi' })
      try {
        await Store.getWifiCode({ uid: this.uid })
      } catch (e) {
        console.error(e)
        app.utils.alwaysBack()
      }
    } else {
      wx.setNavigationBarTitle({ title: '新建WiFi' })
      Store.setItem('loading', false)
    }
  },
  onShow() {
    if (!this.data.wifi.ssid) {
      setTimeout(() => {
        this.onSearchWifiClick(false)
      }, 1000)
    }
  },
  onUnload() {
    if (videoAd) {
      videoAd = null
    }
  },
  showLoading(title = '', mask = true, timeout = 500) {
    Store.setItem('disabled', true)
    timeoutId = setTimeout(() => {
      if (title) {
        wx.showLoading({ title, mask })
      } else {
        wx.showLoading({ mask })
      }
    }, timeout)
  },
  hideLoading() {
    Store.setItem('disabled', false)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    wx.hideLoading()
  },
  handleBannerItemClick(e) {
    const item = e.currentTarget.dataset.item
    switch (item.type) {
      case 'h5':
        if (item.url) {
          wx.navigateTo({
            url: `/pages/webview/index?src=${item.url}`,
          })
        }
        break
      case 'mini':
        wx.navigateToMiniProgram({
          appId: item.appid,
          path: decodeURIComponent(item.url),
          fail: res => {
            const msg = res.errMsg
            if (msg === 'navigateToMiniProgram:fail invalid appid') {
              app.utils.modalText('跳转失败，可能是小程序路径或appid填写错误')
            } else if (
              msg === "navigateToMiniProgram:fail can't navigate to myself"
            ) {
              wx.reLaunch({
                url: decodeURIComponent(item.url),
              })
            }
          },
        })
        break
      default:
        break
    }
  },
  handleSelectLocation() {
    const latitude = this.data.wifi.latitude
    const longitude = this.data.wifi.longitude
    const rest = {}
    if (latitude && longitude) {
      rest['latitude'] = latitude
      rest['longitude'] = longitude
    }
    wx.showLoading()
    wx.chooseLocation({
      ...rest,
      success: res => {
        if (res.errMsg === 'chooseLocation:ok') {
          const { latitude, longitude, name } = res
          console.log(res)
          Store.setItem('wifi.latitude', latitude)
          Store.setItem('wifi.longitude', longitude)
          Store.setItem('wifi.address', name)
        }
      },
      complete: () => {
        wx.hideLoading()
      },
    })
  },
  onRawInput(e) {
    const name = e.currentTarget.dataset.name
    const value = e.detail.value
    Store.setItem(name, value)
  },
  onInputChange(e) {
    const name = e.currentTarget.dataset.name
    const value = e.detail.value
    Store.setWifiData(name, value)
  },
  onClearClick(e) {
    const name = e.currentTarget.dataset.name
    Store.setWifiData(name, '')
  },
  onSearchWifiClick(showToast = true) {
    wx.getConnectedWifi({
      success: res => {
        const wifi = res.wifi
        console.log('wifi', wifi)
        if (wifi && wifi.SSID) {
          Store.setWifiData('ssid', wifi.SSID)
        }
      },
      fail: e => {
        console.log('eee', e)
        showToast && app.utils.toastText('连接WiFi后可自动获取当前WiFi')
      },
    })
  },
  handleUpload(e) {
    if (this.data.disabled) {
      return
    }
    const name = e.currentTarget.dataset.name
    wx.chooseImage({
      sizeType: ['compressed'],
      count: 1,
      success: async res => {
        const tempFilePaths = res.tempFilePaths
        if (tempFilePaths && tempFilePaths.length) {
          this.showLoading('图片检测中')
          try {
            const url = await Store.checkImgIsValid(tempFilePaths[0], true)
            if (url) {
              Store.setWifiData(name, url)
            }
            this.hideLoading()
          } catch (e) {
            console.error('ERROR: ', e)
            this.hideLoading()
            app.utils.toastText(e.msg || e.message || '图片上传失败')
          }
        }
      },
      fail: e => {
        console.error('fail', e)
      },
    })
  },
  handleDeleteImage(e) {
    const name = e.currentTarget.dataset.name
    wx.showModal({
      content: '是否移除该照片？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#111',
      confirmText: '移除',
      confirmColor: '#aaa',
      success: result => {
        if (result.confirm) {
          Store.setWifiData(name, '')
        }
      },
    })
  },
  _showAd() {
    return new Promise((resolve, reject) => {
      try {
        const custom = this.data.custom || {}
        if (custom.form_ad.ad_jili_active && custom.form_ad.ad_jili) {
          if (videoAd) {
            this.showLoading()
            videoAd
              .show()
              .then(() => {
                this.hideLoading()
                resolve()
              })
              .catch(() => {
                videoAd
                  .load()
                  .then(() => {
                    this.hideLoading()
                    videoAd.show()
                    resolve()
                  })
                  .catch(err => {
                    this.hideLoading()
                    videoError = true
                    reject(err)
                  })
              })
          } else {
            reject()
          }
        } else {
          reject()
        }
      } catch (e) {
        reject(e)
      }
    })
  },
  async handleConfirm() {
    if (this.data.disabled) {
      return
    }
    const wifi = this.data.wifi
    if (!wifi.id) {
      return await this.handleSaveWifiCode()
    }
    await this.handleSaveWifiCode()
    // this._showAd().catch(async () => {
    // 	await this.handleSaveWifiCode()
    // })
  },
  async handleSaveWifiCode() {
    const wifi = this.data.wifi
    const userInfo = this.data.userInfo
    const postData = Object.assign({}, wifi, {
      openid: userInfo.openid,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    })
    app.utils.showLoading('安全检测中')
    try {
      await Store.checkTextIsValid(`${postData.form_title}${postData.form_desc}${postData.ssid}`)
      await Store.saveWifiCode(postData)
      app.utils.hideLoading()
      app.utils
        .toastText(postData.id ? '保存成功' : '新建成功', 'success')
        .then(() => {
          if (userInfo.created > 0) {
            if (!postData.uid) {
              UserStore.addCreated()
            }
            app.setTempData('refresh', true)
            app.utils.alwaysBack(500)
          } else {
            if (!postData.uid) {
              UserStore.addCreated()
            }
            app.setTempData('refresh', true)
            wx.redirectTo({
              url: '/wifi/list/index',
            })
          }
        })
    } catch (e) {
      app.utils.hideLoading()
    }
  },
})
