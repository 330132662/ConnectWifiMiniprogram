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
		const mid = options.mid || ''
		const title = options.title || '附近WiFi列表'
		this.mid = mid
		if (!mid) {
			return app.utils.alwaysBack()
		}
		wx.setNavigationBarTitle({ title })
		Store.setItem('finished', false)
		Store.setItem('list', [])
		Store.setItem('page', 1)
		const list = await Store.getNearbyWifi({ mid, page: 1 })
		Store.setItem('list', list)
		Store.setItem('loading', false)
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
	async onReachBottom() {
		if (this.data.finished || this.data.loading) {
			return
		}
		const mid = this.mid
		await Store.getNearbyWifi({ mid })
	},
	handleWifiClick(e) {
		const item = e.currentTarget.dataset.item
		const uid = item.uid
		if (uid) {
			wx.reLaunch({
				url: `/wifi/linked/index?uid=${uid}`,
			})
		} else {
			app.utils.toastText('WiFi错误')
		}
	},
})
