const Store = require('./store')
const UserStore = require('../../store/user')
const app = getApp()

let timeoutId = null
let interstitialAd = null
let adTimeoutId = null

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init(null, () => {
			const custom = this.data.custom
			if (
				custom.form_ad &&
				custom.form_ad.ad_screen_active &&
				custom.form_ad.ad_screen &&
				wx.createInterstitialAd
			) {
				interstitialAd = wx.createInterstitialAd({
					adUnitId: custom.form_ad.ad_screen,
				})
				if (interstitialAd) {
					adTimeoutId = setTimeout(() => {
						interstitialAd.show().catch(e => console.error)
					}, custom.form_ad.ad_screen_timeout * 1000)
				}
			}
		})
	},
	onShow() {
		if (this.getTabBar()) {
			this.getTabBar().init()
		}
		Store.setItem('userInfo', UserStore.data.userInfo)
	},
	onHide() {
		if (adTimeoutId) {
			clearTimeout(adTimeoutId)
			adTimeoutId = null
		}
		if (interstitialAd && interstitialAd.destroy) {
			interstitialAd.destroy()
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
	handleInfoClick() {
		wx.navigateTo({ url: `/pages/info/index` })
	},
	handleItemClick(e) {
		const name = e.currentTarget.dataset.name
		switch (name) {
			// 我的优惠券
			case 'yhq':
				wx.navigateTo({
					url: '/coupon/mine/index',
				})
				break
			// 代理商申请
			case 'dlssq':
				wx.navigateTo({
					url: '/wifi/apply/index',
				})
				break
			// 申请提现
			case 'sqtx':
				wx.navigateTo({
					url: '/pages/deposit/index',
				})
				break
			// 提现记录
			case 'txjl':
				wx.navigateTo({
					url: '/pages/depositlist/index',
				})
				break
			// 帮助中心
			case 'bzzx':
				wx.navigateTo({
					url: '/wifi/help/index',
				})
				break
			default:
				break
		}
	},
})
