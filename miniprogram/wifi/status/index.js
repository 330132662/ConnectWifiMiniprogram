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
		const { role_id, pid, percent } = options
		this.params = { role_id, pid, percent }
		const code = app.getTempData('code')

		if (code) {
			Store.setItem('code', code)
			this.refreshPoster()
		} else {
			return app.utils.modalText('获取信息失败，未知的邀请码参数').then(() => {
				app.utils.alwaysBack()
			})
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
	onPosterSuccess(e) {
		const posterSrc = e.detail
		this.setData({
			posterSrc,
			loading: false,
		})
	},
	onPosterFail(e) {
		console.error('failfail: ', e)
	},
	refreshPoster() {
		const { currentColor, form } = this.data
		this.setData({
			posterSrc: '',
			loading: true,
		})
		return this.generatePoster(form, currentColor)
	},
	async generatePoster({ line_1, line_2, line_3, line_4 }, themeColor = '') {
		const code = this.data.code
		const custom = this.data.custom || {}
		const color = themeColor || custom.color || '#1890ff'
		const posterData = posterConfig(code, color, line_1, line_2, line_3, line_4)
		await Poster.create(true, posterData)
		this.setData({ loading: false })
	},
	handlePosterItemClick() {
		Store.setItem('showPickerColor', false)
		Store.setItem('showPickerColor', true)
	},
	onPickerColorConfirm(e) {
		const currentColor = e.detail
		Store.setItem('currentColor', currentColor)
		Store.setItem('posterSrc', '')
		this.showLoading('更换主题色')
		this.refreshPoster().then(() => {
			Store.setItem('showPickerColor', false)
			this.hideLoading()
		})
	},
	handleDownloadPoster() {
		const posterSrc = this.data.posterSrc
		if (this.data.disaled || !posterSrc) {
			return app.utils.toastText('请稍后')
		}
		const filePath = posterSrc
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
		const posterSrc = this.data.posterSrc
		if (!posterSrc || this.data.disabled) {
			return app.utils.toastText('请稍后')
		}
		const src = this.data.code
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
		Store.setItem(`form.${name}`, value)
	},
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		Store.setItem(`popupForm.${name}`, '')
	},
	handlePopupConfirm() {
		if (this.data.loading || this.data.disabled) {
			return
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
		const { role_id, pid, percent } = this.params
		const url = `/wifi/apply/index?role_id=${role_id}&pid=${pid}&percent=${percent}`
		wx.setClipboardData({
			data: `小程序APPID: ${appid} \n\n 小程序页面路径: ${url}`,
		})
		this.handleCloseMiniPopup()
	},
})
