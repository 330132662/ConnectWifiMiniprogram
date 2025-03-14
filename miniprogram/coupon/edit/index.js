const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

let timeoutId = null
let videoAd = null
let videoError = false
const getTimestamp = (timestamp, isZero = false) => {
	const temp = new Date(timestamp)
	const year = temp.getFullYear()
	const month = temp.getMonth() + 1
	const day = temp.getDate()
	if (isZero) {
		return new Date(`${year}/${month}/${day} 00:00:00`).getTime()
	} else {
		return new Date(`${year}/${month}/${day} 23:59:59`).getTime()
	}
}
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
							content:
								'保存之前必须认真看完广告哦，否则无法正常保存优惠券信息。',
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
		const { mid, id } = options
		this.mid = mid || ''
		if (!this.mid) {
			return app.utils.alwaysBack()
		}
		if (id) {
			try {
				await Store.getMerchantCouponDetail({ id })
			} catch (e) {
				console.error(e)
				app.utils.modalText('服务器出错，获取信息失败').then(() => {
					app.utils.alwaysBack()
				})
			}
		} else {
			Store.setItem('loading', false)
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
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		this.setData({
			[`coupon.${name}`]: '',
		})
	},
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		this.setData({
			[`coupon.${name}`]: value,
		})
	},
	handleToggleSwitch(e) {
		const name = e.currentTarget.dataset.name
		const coupon = this.data.coupon
		let value = false
		if (coupon[name] == 1) {
			value = false
		} else {
			value = true
		}
		this.setData({
			[`coupon.${name}`]: +value,
		})
	},
	onShowPopup(e) {
		const currentName = e.currentTarget.dataset.name
		let currentTitle = ''
		if (currentName == 'get_begin') {
			currentTitle = '开始领取时间'
		} else if (currentName == 'get_end') {
			currentTitle = '结束领取时间'
		} else if (currentName == 'use_begin') {
			currentTitle = '开始使用时间'
		} else if (currentName == 'use_end') {
			currentTitle = '结束使用时间'
		}
		this.setData({
			currentTitle,
			currentName,
			showPopup: true,
			currentValue: new Date().getTime(),
		})
	},
	onStepChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail
		this.setData({
			[`coupon.${name}`]: value,
		})
	},
	onClosePopup() {
		this.setData({ currentName: '', showPopup: false })
	},
	handlePopupConfirm(e) {
		let currentValue = e.detail
		const currentName = this.data.currentName
		if (currentName == 'get_end' || currentName == 'use_end') {
			currentValue = getTimestamp(currentValue)
		} else {
			currentValue = getTimestamp(currentValue, true)
		}
		this.setData({
			[`coupon.${currentName}`]: currentValue,
		})
		this.onClosePopup()
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
			return app.utils.toastText('请稍后')
		}
		const coupon = Object.assign({}, this.data.coupon)
		if (!coupon.name) {
			return app.utils.toastText('请填写优惠券名称')
		}
		const mid = this.mid
		if (!mid) {
			return app.utils.toastText('未知的门店id')
		}
		if (!coupon.id) {
			return await this.handleSaveDetail()
		}
		this._showAd().catch(async () => {
			return await this.handleSaveDetail()
		})
	},
	async handleSaveDetail() {
		const coupon = Object.assign({}, this.data.coupon)
		if (!coupon.name) {
			return app.utils.toastText('请填写优惠券名称')
		}
		const mid = this.mid
		if (!mid) {
			return app.utils.toastText('未知的门店id')
		}
		coupon.merchant_id = mid
		this.showLoading('正在提交')
		try {
			await Store.saveMerchantCouponDetail(coupon)
			this.hideLoading()
			app.utils
				.toastText(coupon.id ? '保存成功' : '新建成功', 'success')
				.then(() => {
					app.setTempData('refresh', true)
					app.utils.alwaysBack(500)
				})
		} catch (e) {
			this.hideLoading()
			console.error('ERROR: ', e)
			app.utils.modalText(e.errMsg || '服务器出错，保存失败。')
		}
	},
})
