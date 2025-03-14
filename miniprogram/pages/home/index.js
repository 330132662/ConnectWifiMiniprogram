const storage = require('../../utils/storage')
const Store = require('./store')
const app = getApp()

let interstitialAd = null
let adTimeoutId = null
Page({
  data: Store.data,
  onLoad(options) {
    Store.bind(this)
    Store._init(null, () => {
      const custom = this.data.custom
      if (
        custom.form_ad &&
        custom.form_ad.ad_screen_active &&
        custom.form_ad.ad_screen &&
        wx.createInterstitialAd
      ) {
        if (wx.createInterstitialAd) {
          adTimeoutId = setTimeout(() => {
            interstitialAd = wx.createInterstitialAd({
              adUnitId: custom.form_ad.ad_screen,
            })
            interstitialAd && interstitialAd.show().catch(console.error)
          }, (custom.form_ad.ad_screen_timeout || 1) * 1000)
        }
      }
    })
  },
  onShow() {
    if (this.getTabBar()) {
      this.getTabBar().init()
    }
    if (interstitialAd) {
      interstitialAd.show().catch(err => {
        console.error(err)
      })
    }
  },
  onHide() {
    if (adTimeoutId) {
      clearTimeout(adTimeoutId)
      adTimeoutId = null
    }
    if (interstitialAd && interstitialAd.destroy) {
      interstitialAd.destroy()
    }
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
  // 菜单点击
  handleItemClick(e) {
    const item = e.currentTarget.dataset.item
    switch (item.type) {
      case 'h5':
        if (item.url) {
          wx.navigateTo({
            url: `/pages/webview/index?src=${item.url}`,
          })
        } else {
          app.utils.modalText('未设置内容')
        }
        break
      case 'image':
        if (item.content) {
          wx.previewImage({
            current: item.content,
            urls: [item.content],
          })
        } else {
          app.utils.modalText('未设置内容')
        }
        break
      case 'text':
        if (item.content) {
          wx.showModal({
            content: item.content,
            showCancel: false,
            confirmText: item.confirm_text || '我知道了',
          })
        } else {
          app.utils.toastText('未设置内容')
        }
        break
      case 'mini':
        if (!item.appid) {
          wx.navigateTo({
            url: item.url,
          })
          return
        }
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
      case 'video':
        wx.previewMedia({
          sources: [{ type: 'video', url: item.content }],
        })
        break
      default:
        break
    }
  },
  handleCreateWifi() {
    wx.navigateTo({ url: '/wifi/edit/index' })
  },
  handleManagerClick() {
    wx.navigateTo({ url: '/wifi/list/index' })
  },
  handleMerchant() {
    wx.navigateTo({ url: '/pages/merchantlist/index' })
  },
  handle2Invite() {
    wx.navigateTo({ url: '/wifi/invite/index' })
  },
  handleMember() {
    wx.navigateTo({ url: '/wifi/member/index' })
  },
  onShareTimeline() {
    const custom = this.data.custom
    const userInfo = this.data.userInfo
    return {
      title: custom.share_title,
      query: `from=${userInfo.openid || ''}`,
    }
  },
  onShareAppMessage() {
    const custom = this.data.custom
    const userInfo = this.data.userInfo
    return {
      title: custom.share_title,
      path: `/pages/home/index?from=${userInfo.openid || ''}`,
      imageUrl: custom.share_icon,
    }
  },
})
