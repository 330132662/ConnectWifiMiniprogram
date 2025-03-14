const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

Page({
	data: Store.data,
	async onLoad(options) {
		const { mid } = options
		this.mid = mid
		Store.bind(this)
		Store._init(() => {
			Store.getMyCouponList(mid)
		})
	},
	async onTabChange({ detail: { index } }) {
		const mid = this.mid
		Store.setItem('status', index)
		Store.setItem('finished', false)
		Store.setItem('list', [])
		Store.setItem('page', 1)
		try {
			await Store.getMyCouponList(mid)
		} catch (e) {
			console.error(e)
		}
	},
	onReachBottom() {
		if (this.data.loading || this.data.finished) {
			return
		}
		const mid = this.mid
		Store.getMyCouponList(mid)
	},
	toggleCouponlogStatus(id, status) {
		Store.toggleCouponlogStatus({ id, status })
		if (status == 2) {
			const list = this.data.list.filter(item => item.id != id)
			Store.setItem('list', list)
		}
	},
	// 判断是否可使用
	_canUseCoupon(coupon) {
		if (coupon.use_active) {
			const currentTime = new Date().getTime()
			if (coupon.use_begin && coupon.use_end) {
				if (currentTime < coupon.use_begin) {
					app.utils.modalText('未到优惠券可用时间段')
					return false
				} else if (
					currentTime >= coupon.use_begin &&
					currentTime <= coupon.use_end
				) {
					return true
				} else {
					this.toggleCouponlogStatus(coupon.id, 2)
					app.utils.modalText('优惠券已过期，无法使用')
					return false
				}
			} else if (coupon.use_begin && !coupon.use_end) {
				if (currentTime < coupon.use_begin) {
					app.utils.modalText('未到优惠券可用时间段')
					return false
				}
			} else if (!coupon.use_begin && coupon.use_end) {
				if (currentTime > coupon.use_end) {
					this.toggleCouponlogStatus(coupon.id, 2)
					app.utils.modalText('优惠券已过期，无法使用')
					return false
				}
			}
		}
		return true
	},
	async showCode(e) {
		const coupon = e.currentTarget.dataset.item
		const id = coupon.id
		const code = coupon.mini_code
		const flag = this._canUseCoupon(coupon)
		if (!flag) {
			return
		}
		if (!code) {
			wx.showLoading({ mask: true })
			try {
				const url = await Store.generateCheckedCode({ id })
				wx.hideLoading()
				this.setData({ popupData: { code: url }, showPopup: true })
			} catch (e) {
				console.error(e)
				wx.hideLoading()
				app.utils.toastText(e.message || e.errMsg || '核销码生成失败')
			}
		} else {
			this.setData({ popupData: { code }, showPopup: true })
		}
	},
	closePopup() {
		this.setData({ showPopup: false })
	},
})
