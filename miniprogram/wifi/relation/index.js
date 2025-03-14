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
		const { uid } = options
		this.uid = uid || ''
		if (!uid) {
			return app.utils.alwaysBack()
		}
		const wifi = await Store.getWifiCode({ uid })
		Store.setItem('wifi', wifi)
		if (wifi.mid) {
			// 获取门店信息
			try {
				const merchant = await Store.getMerchantDetail({ id: wifi.mid })
				Store.setItem('merchant', merchant)
				Store.setItem('loading', false)
			} catch (e) {
				Store.clearMerchantRelated({ uid: wifi.uid })
				Store.setItem('wifi.mid', '')
				app.utils.toastText('门店可能已删除，自动取消关联')
				Store.setItem('loading', false)
			}
		} else {
			Store.setItem('loading', false)
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
	onUnload() {
		Store.setItem('merchant', null)
		Store.setItem('wifi', null)
	},
	// 选择门店
	async handleSelectMerchant() {
		const hasRelation = this.data.merchant && this.data.merchant.id
		this.showLoading()
		try {
			const total = await Store.getTotal()
			this.hideLoading()
			if (total > 0) {
				Store.setItem('showPopupMerchant', true)
			} else {
				app.utils
					.modalText(
						`您还没有创建门店，请先创建门店后再尝试${
							hasRelation ? '切换' : '关联'
						}门店`
					)
					.then(() => {
						wx.navigateTo({ url: '/wifi/merchantedit/index' })
					})
			}
		} catch (e) {
			console.error(e)
			this.hideLoading()
		}
	},
	onPopupSelect({ detail }) {
		Store.setItem('merchant', detail)
		Store.setItem('wifi.mid', detail.id)
		this.onPopupClose()
	},
	onPopupClose() {
		Store.setItem('showPopupMerchant', false)
	},
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		Store.setItem(`wifi.${name}`, '')
	},
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		Store.setItem(`wifi.${name}`, value)
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
							Store.setItem(`wifi.${name}`, url)
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
					Store.setItem(`wifi.${name}`, '')
				}
			},
		})
	},
	async handleConfirm() {
		if (!this.data.wifi || !this.data.wifi.mid) {
			return app.utils.toastText('请先关联门店')
		}
		const postData = Object.assign({}, this.data.wifi)
		postData['uid'] = this.uid
		this.showLoading()
		try {
			await Store.updateMyRelation(postData)
			this.hideLoading()
			app.utils.toastText('保存成功', 'success').then(() => {
				app.utils.alwaysBack(500)
			})
		} catch (e) {
			this.hideLoading()
		}
	},
})
