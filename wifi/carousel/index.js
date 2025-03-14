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
						await this.handleSaveDetail()
					} else {
						wx.showModal({
							content: '保存之前必须认真看完广告哦，否则无法正常保存轮播图。',
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
		const { mid } = options
		this.mid = mid
		if (!mid) {
			return app.utils.alwaysBack()
		}
		try {
			await Store.getMerchantBanner({ id: mid })
		} catch (e) {
			return app.utils.alwaysBack()
		}
	},
	onShow() {},
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
	handleDelete(e) {
		wx.showModal({
			content: '正在删除当前轮播图照片，一旦删除就永远无法恢复，是否永久删除？',
			cancelColor: '#111',
			confirmText: '删除',
			confirmColor: '#d00',
			success: result => {
				if (result.confirm) {
					const current = e.currentTarget.dataset.index
					const { banners } = this.data
					banners.splice(current, 1)
					this.setData({
						current: current - 1 < 0 ? 0 : current - 1,
						banners,
						currentSelected: null,
					})
				}
			},
		})
	},
	handleAddPhoto() {
		if (this.data.loading) {
			return
		}
		wx.chooseImage({
			sizeType: ['compressed'],
			count: 1,
			success: async res => {
				const tempFilePaths = res.tempFilePaths
				if (tempFilePaths && tempFilePaths.length) {
					this.showLoading('图片检测中')
					try {
						const src = await Store.checkImgIsValid(tempFilePaths[0], true)
						if (src) {
							let banners = this.data.banners
							if (Array.isArray(banners)) {
								banners.push({ src, type: 'none' })
							} else {
								banners = [{ src, type: 'none' }]
							}
							const current = banners.length - 1
							this.setData({
								banners,
								current,
								currentSelected: banners[current],
							})
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
	handleChangeBanner(e) {
		const { current } = e.detail
		const { banners } = this.data
		this.setData({
			current,
			currentSelected: banners[current],
		})
	},
	handleBannerClick(e) {
		const index = e.currentTarget.dataset.index
		const { banners, currentSelected } = this.data
		if (!currentSelected) {
			this.setData({
				current: index,
				currentSelected: banners[index],
			})
		}
	},
	_handleUpdateBanner(name, value) {
		const { current } = this.data
		this.setData({
			[`currentSelected.${name}`]: value,
		})
		this.setData({
			[`banners[${current}].${name}`]: value,
		})
	},
	handleSwitchToggle() {
		const currentSelected = this.data.currentSelected
		const type = currentSelected.type
		if (type === 'none') {
			this._handleUpdateBanner('type', 'mini')
		} else {
			this._handleUpdateBanner('type', 'none')
		}
	},
	handleSelectType() {
		wx.showActionSheet({
			itemList: ['小程序', 'H5链接'],
			success: ({ tapIndex }) => {
				if (tapIndex == 0) {
					this._handleUpdateBanner('type', 'mini')
				} else if (tapIndex == 1) {
					this._handleUpdateBanner('type', 'h5')
				}
			},
		})
	},
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		this._handleUpdateBanner([name], value)
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
		let banners = this.data.banners.slice()
		if (!Array.isArray(banners)) {
			banners = []
		}
		if (!banners.length) {
			app.utils.toastText('至少上传一张轮播图')
			return
		}
		this._showAd().catch(async () => {
			await this.handleSaveDetail()
		})
	},
	async handleSaveDetail() {
		let banners = this.data.banners.slice()
		if (!Array.isArray(banners)) {
			banners = []
		}
		if (!banners.length) {
			app.utils.toastText('至少上传一张轮播图')
			return
		}
		this.showLoading('正在上传')
		const mid = this.mid
		try {
			await Store.updateMerchantBanner({
				id: mid,
				banners: JSON.stringify(banners),
			})
			this.hideLoading()
			app.utils.toastText('保存成功', 'success')
			app.utils.alwaysBack(500)
		} catch (e) {
			this.hideLoading()
			app.utils.modalText(e.msg || '保存失败')
		}
	},
})
