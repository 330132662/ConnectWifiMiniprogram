const Store = require('./store')
const app = getApp()

let timeoutId = null
Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init(() => {
			if (!this.data.agent) {
				return app.utils
					.modalText('您还不是代理商，无法访问该页面')
					.then(() => {
						app.utils.alwaysBack()
					})
			}
			Store.getDepositList()
		})
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
		if (this.data.loading || this.data.finished) {
			return
		}
		await Store.getDepositList()
	},
})
