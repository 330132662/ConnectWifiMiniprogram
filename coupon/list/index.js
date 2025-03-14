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
		const { mid } = options
		this.mid = mid
		if (mid) {
			await Store.getCouponList(mid)
		} else {
			app.utils.alwaysBack()
		}
	},
	onShow() {
		const refresh = app.getTempData('refresh')
		if (refresh) {
			this.setData({ list: [], finished: false, page: 1 })
			Store.getCouponList(this.mid)
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
	handleNew() {
		wx.navigateTo({
			url: '/coupon/edit/index?mid=' + this.mid,
		})
	},
	handleDelete(e) {
		const id = e.currentTarget.dataset.id
		wx.showModal({
			content:
				'该操作将永久删除该优惠券，但已被用户领取的优惠券仍可在有效期内核销。',
			showCancel: true,
			cancelText: '取 消',
			cancelColor: '#000',
			confirmText: '确 定',
			confirmColor: '#999',
			success: async result => {
				if (result.confirm) {
					this.showLoading('正在删除')
					try {
						await Store.deleteCoupon({ id })
						this.hideLoading()
						const list = this.data.list.filter(item => +item.id !== +id)
						this.setData({ list, disabled: false })
						app.utils.toastText('已删除')
					} catch (e) {
						this.hideLoading()
					}
				}
			},
			fail: e => {
				console.error('ERROR: ', e)
			},
		})
	},
	handleEdit(e) {
		const id = e.currentTarget.dataset.id
		const mid = this.mid
		wx.navigateTo({
			url: `/coupon/edit/index?mid=${mid}&id=${id}`,
		})
	},
})
