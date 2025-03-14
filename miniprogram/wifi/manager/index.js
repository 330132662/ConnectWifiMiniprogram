const Store = require('./store')
import Poster from '../../components/common/poster/poster'
import posterConfig from './poster'

const app = getApp()
let timeoutId = null
Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this)
    Store._init()
    const { uid, scene } = options
    if (uid || scene) {
      this.uid = uid || scene
      await Store.getWifiCode({ uid: this.uid })
      this.refreshPoster()
    } else {
      app.utils.alwaysBack()
    }
  },
  showLoading(title = '', mask = true, timeout = 500) {
    Store.setItem('loading', true)
    timeoutId = setTimeout(() => {
      if (title) {
        wx.showLoading({ title, mask })
      } else {
        wx.showLoading({ mask })
      }
    }, timeout)
  },
  hideLoading() {
    Store.setItem('loading', false)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    wx.hideLoading()
  },
  handlePosterItemClick() {
    Store.setItem('showPickerColor', false)
    Store.setItem('showPickerColor', true)
  },
  onPickerColorConfirm(e) {
    const currentColor = e.detail
    Store.setItem('currentColor', currentColor)
    Store.setItem('posterList', [])
    this.showLoading('更换主题色')
    this.refreshPoster().then(() => {
      Store.setItem('showPickerColor', false)
      this.hideLoading()
    })
  },
  createPoster(drawData) {
    return new Promise((resolve, reject) => {
      Poster.create(drawData, this, '#myCanvas')
        .then(posterSrc => {
          const oldList = this.data.posterList
          if (posterSrc) {
            const newList = oldList.concat(posterSrc)
            Store.setItem('posterList', newList)
          }
          resolve(posterSrc)
        })
        .catch(err => {
          console.error(err)
          app.utils.toastText('海报生成失败')
          reject(err)
        })
    })
  },
  refreshPoster() {
    const { currentColor, wifi } = this.data
    Store.setItem('posterList', [])
    Store.setItem('loading', true)
    return this.generatePosterList(wifi, currentColor)
  },
  onPosterSuccess(e) {
    const src = e.detail
    const posterList = this.data.posterList
    posterList.push(src)
    Store.setItem('posterList', posterList)
    Store.setItem('loading', false)
  },
  onPosterFail(e) {
    console.error('fail: ', e)
    Store.setItem('loading', false)
  },
  async generatePosterList(wifi, themeColor = '') {
    const COUNT = 2
    const color = themeColor || this.data.custom.color || '#1890ff'
    const popupForm = this.data.popupForm
    const activeQRCode = this.data.custom.active_qr_code == 1
    const activeH5Code = this.data.custom.active_h5_code == 1
    let code = wifi.mini_code
    if (activeH5Code && wifi.h5_code) {
      code = wifi.h5_code
    } else if (activeQRCode && wifi.qr_code) {
      code = wifi.qr_code
    }
    for (let i = 1; i <= COUNT; i++) {
      const posterData = posterConfig(
        code,
        color,
        popupForm.line_1,
        popupForm.line_2,
        popupForm.line_3 || wifi.form_title,
        popupForm.line_4,
        wifi.uid
      )[`theme_${i}`]
      await Poster.create(true, posterData)
    }
  },
  onSwiperChange({ detail }) {
    Store.setItem('current', detail.current)
  },
  handleDownloadPoster() {
    const posterList = this.data.posterList || []
    if (this.data.disaled || !posterList.length) {
      return app.utils.toastText('请稍后')
    }
    const current = this.data.current
    const filePath = posterList[current]
    this.showLoading('正在保存')
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        this.hideLoading()
        app.utils.modalText('已保存至相册，记得前往相册查看哦 ~')
      },
      fail: e => {
        this.hideLoading()
        console.error('saveImageToPhotosAlbum ERROR: ', e)
        app.utils.toastText('图片保存失败')
      },
    })
  },
  handleDownloadMiniCode() {
    const posterList = this.data.posterList
    if (!posterList.length || this.data.disabled) {
      return app.utils.toastText('请稍后')
    }
    const wifi = this.data.wifi
    const src = wifi.mini_code
    this.showLoading('正在保存')
    wx.getImageInfo({
      src,
      success: res => {
        const filePath = res.path
        wx.saveImageToPhotosAlbum({
          filePath,
          success: () => {
            this.hideLoading()
            app.utils.modalText('已保存至相册，记得前往相册查看哦 ~')
          },
          fail: e => {
            this.hideLoading()
            console.error('saveImageToPhotosAlbum ERROR: ', e)
            app.utils.toastText('图片保存失败')
          },
        })
      },
      fail: e => {
        this.hideLoading()
        console.error('getImageInfo ERROR: ', e)
        utils.toastText('获取图片失败')
      },
    })
  },
  handleSaveImage() {
    if (this.data.disabled || this.loading) {
      return
    }
    this.loading = true
    wx.showActionSheet({
      itemList: ['保存海报', '保存WiFi码'],
      success: ({ tapIndex }) => {
        if (tapIndex == 0) {
          this.handleDownloadPoster()
        } else if (tapIndex == 1) {
          this.handleDownloadMiniCode()
        }
      },
      complete: () => {
        this.loading = false
      },
    })
  },
  handleTextChange() {
    Store.setItem('showPopup', true)
  },
  onPopupClose() {
    Store.setItem('showPopup', false)
  },
  onInputChange(e) {
    const name = e.currentTarget.dataset.name
    const value = e.detail.value
    Store.setItem(`popupForm.${name}`, value)
  },
  onClearClick(e) {
    const name = e.currentTarget.dataset.name
    Store.setItem(`popupForm.${name}`, '')
  },
  async handlePopupConfirm() {
    if (this.data.loading || this.data.disabled) {
      return
    }
    try {
      this.showLoading()
      const popupForm = this.data.popupForm
      await Store.checkTextIsValid(`${popupForm.line_1}${popupForm.line_2}${popupForm.line_3}${popupForm.line_4}`)
      this.hideLoading()
    } catch (_) {
      Store.setItem('popupForm', {})
      this.hideLoading()
    }


    Store.setItem('posterList', [])
    Store.setItem('showPopup', false)
    this.showLoading('正在更新')
    this.refreshPoster()
      .then(() => {
        this.hideLoading()
      })
      .catch(() => {
        app.utils.toastText('海报更新失败')
        this.hideLoading()
      })
  },
  handleShowMiniPopup() {
    Store.setItem('showMiniPopup', true)
  },
  handleCloseMiniPopup() {
    Store.setItem('showMiniPopup', false)
  },
  handleConfirmCopy() {
    const appid = this.data.custom.form_mini.appid
    const url = `/wifi/linked/index?uid=${this.data.wifi.uid}`
    wx.setClipboardData({
      data: `小程序APPID: ${appid} \n\n 小程序页面路径: ${url}`,
    })
    this.handleCloseMiniPopup()
  },
  handleRelateMerchant() {
    if (this.data.loading) {
      return app.utils.toastText('请稍后')
    }
    const wifi = this.data.wifi
    wx.navigateTo({
      url: `/wifi/relation/index?uid=${wifi.uid}`,
    })
  },
})
