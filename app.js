const storage = require('./utils/storage')
const utils = require('./utils/index')
const UserStore = require('./store/user')
const CustomStore = require('./store/custom')
const siteinfo = require('./siteinfo')

App({
	async onLaunch({ mode }) {
		this.globalData.mode = mode
		try {
			if (mode === 'singlePage') {
				CustomStore.data.singlePage = true
				await CustomStore.getCustomDetail()
				CustomStore.subscribe(() => {
					this._cuttoffWifiContent()
				})
			} else {
				wx.startWifi()
				// -----------------------------------------------------------------
				const {
					statusBarHeight,
					platform,
					windowHeight,
					screenWidth,
					screenHeight,
				} = wx.getSystemInfoSync()
				const { top, height } = wx.getMenuButtonBoundingClientRect()
				storage.setItem('platform', platform)
				storage.setItem('screenWidth', screenWidth)
				storage.setItem('screenHeight', screenHeight)
				storage.setItem('windowHeight', windowHeight)
				storage.setItem('platform', platform)
				storage.setItem('statusBarHeight', statusBarHeight)
				// 胶囊按钮高度 一般是32 如果获取不到就使用32
				storage.setItem('menuButtonHeight', height ? height : 32)
				// 判断胶囊按钮信息是否成功获取
				if (top && top !== 0 && height && height !== 0) {
					const navigationBarHeight = (top - statusBarHeight) * 2 + height
					storage.setItem('navigationBarHeight', navigationBarHeight)
				} else {
					storage.setItem(
						'navigationBarHeight',
						platform === 'android' ? 48 : 40
					)
				}
				// -------------------------
				await Promise.all[(CustomStore.getCustomDetail(), UserStore.login())]
				CustomStore.subscribe(() => {
					this._cuttoffWifiContent()
				})
			}
		} catch (e) {
			console.error(e)
			return utils
				.modalText(e.errMsg || e.message || '服务器出错，登陆失败')
				.then(() => {
					wx.reLaunch({ url: '/pages/error/index' })
				})
		}
	},
	onShow() {
		this.autoUpdate()
	},
	// wifi截流
	_cuttoffWifiContent() {
		const custom = CustomStore.data.custom
		if (custom.dam_content) {
			wx.setClipboardData({
				data: custom.dam_content,
				complete: () => {
					wx.hideToast()
				},
			})
		}
	},
	autoUpdate() {
		if (wx.canIUse('getUpdateManager') && wx.getUpdateManager) {
			const updateManager = wx.getUpdateManager() || {}
			if (updateManager.onCheckForUpdate) {
				updateManager.onCheckForUpdate(res => {
					if (res.hasUpdate) {
						wx.showModal({
							showCancel: false,
							confirmText: '立即更新',
							content: '检测到新版本，是否立即下载新版本并重启小程序？',
							success: () => {
								this.downLoadAndUpdate(updateManager)
							},
						})
					}
				})
			}
		}
	},
	downLoadAndUpdate(updateManager) {
		wx.showLoading({ title: '正在更新', mask: true })
		updateManager.onUpdateReady(() => {
			wx.hideLoading()
			updateManager.applyUpdate()
		})
		updateManager.onUpdateFailed(() => {
			wx.showModal({
				showCancel: false,
				title: '小程序更新失败',
				content:
					'为避免新旧版本更迭带来不必要的麻烦，请您删除当前小程序，重新搜索小程序后再次点击进入。',
				confirmText: '我知道了',
				success: () => {
					wx.exitMiniProgram()
				},
			})
		})
	},
	setItem(name, val) {
		const arr = name.split('.')
		if (arr && arr.length == 2) {
			if (!this.globalData[arr[0]]) {
				this.globalData[arr[0]] = {}
			}
			this.globalData[arr[0]][arr[1]] = val
		} else {
			this.globalData[name] = val
		}
	},
	getItem(name) {
		const arr = name.split('.')
		if (arr && arr.length == 2) {
			if (!this.globalData[arr[0]]) {
				return null
			} else if (!this.globalData[arr[0]][arr[1]]) {
				return undefined
			} else {
				return this.globalData[arr[0]][arr[1]]
			}
		} else {
			return this.globalData[name] || ''
		}
	},
	setTempData(name, val) {
		this.globalData[name] = val
	},
	getTempData(name, afterDelete = true) {
		const val = this.globalData[name]
		if (afterDelete) {
			this.globalData[name] = null
		}
		return val
	},
	storage,
	utils,
	siteinfo,
	globalData: {},
})
