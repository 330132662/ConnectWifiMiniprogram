const Store = require('./store')

const app = getApp()
let timeoutId = null

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
		const { id } = options
		if (id) {
			await Store.getMerchantDetail({ id })
			Store.setItem('fullLoading', false)
		} else {
			wx.setNavigationBarTitle({ title: '新建门店' })
			Store.setItem('fullLoading', false)
			Store.setItem('merchant', {})
		}
	},
	showLoading(title = '', mask = true, timeout = 300) {
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
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		Store.setItem(`merchant.${name}`, value)
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
							Store.setItem(`merchant.${name}`, url)
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
					Store.setItem(`merchant.${name}`, '')
				}
			},
		})
	},
	// 选择门店分类
	handleShowGroupPopup() {
		Store.setItem('groupPopupShow', true)
	},
	onGroupPopupSelect({ detail }) {
		Store.setItem('merchant.gid', detail.id)
		Store.setItem('merchant.gname', detail.name)
		Store.setItem('merchant.group', detail)
		this.onGroupPopupClose()
	},
	onGroupPopupClose() {
		Store.setItem('groupPopupShow', false)
	},
	async handleConfirm() {
		const postData = Object.assign({}, this.data.merchant)
		if (!postData.gid || !postData.group.id) {
			return app.utils.toastText('请选择门店分类')
		}
		if (!postData.name) {
			return app.utils.toastText('请填写门店名称')
		}
		if (!postData.logo) {
			return app.utils.toastText('请上传门店Logo')
		}
		if (!postData.address || !postData.latitude || !postData.longitude) {
			return app.utils.toastText('请选择门店地址')
		}
		this.showLoading()
		try {
			await Store.saveMyMerchant(postData)
			this.hideLoading()
			app.utils
				.toastText(postData.id ? '保存成功' : '新建成功', 'success')
				.then(() => {
					app.setTempData('refresh', true)
					app.utils.alwaysBack(500)
				})
		} catch (e) {
			console.error(e)
			this.hideLoading()
		}
	},
	handle2Coupon() {
		const merchant = this.data.merchant
		const id = merchant.id || ''
		wx.navigateTo({ url: `/coupon/list/index?mid=${id}` })
	},
	handle2Carousel() {
		const merchant = this.data.merchant
		const id = merchant.id || ''
		wx.navigateTo({ url: `/wifi/carousel/index?mid=${id}` })
	},
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		console.log('onClearClick', name)
		if (name === 'address') {
			Store.setItem('merchant.latitude', '')
			Store.setItem('merchant.longitude', '')
			Store.setItem('merchant.address', '')
		}
	},
	handleSelectLocation() {
		const merchant = this.data.merchant || {}
		const latitude = merchant.latitude
		const longitude = merchant.longitude
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
					Store.setItem('merchant.latitude', latitude)
					Store.setItem('merchant.longitude', longitude)
					Store.setItem('merchant.address', name)
				}
			},
			fail: e => {
				console.log(e)
			},
			complete: () => {
				wx.hideLoading()
			},
		})
	},
})
