const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

let timeoutId = null
Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
		const { uid, scene } = options
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
	async handleSaveWifiCode() {
		const wifi = this.data.wifi
		if (!wifi.ssid) {
			return app.utils.toastText('请填写WiFi账号')
		}
		const userInfo = this.data.userInfo
		const postData = Object.assign({}, wifi, {
			openid: userInfo.openid,
			nickname: userInfo.nickname,
			avatar: userInfo.avatar,
		})
		app.utils.showLoading('安全检测中')
		try {
			await Store.saveWifiCode(postData)
			app.utils.hideLoading()
			app.utils.toastText('', 'success').then(() => {
				if (!postData.uid) {
					UserStore.addCreated()
				}
				app.setTempData('refresh', true)
				app.utils.alwaysBack(500)
			})
		} catch (e) {
			app.utils.hideLoading()
		}
	},
})
