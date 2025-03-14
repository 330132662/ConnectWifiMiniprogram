const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
		const tip = options.tip
		const type = options.type || 'info'
		Store.setItem('tip', tip)
		Store.setItem('type', type)
	},
	handleClick() {
		if (this.data.back) {
			return app.utils.alwaysBack()
		} else {
			// 关闭小程序
			wx.exitMiniProgram()
		}
	},
})
