const Store = require('./store')
const app = getApp()

Page({
	data: Store.data,
	onLoad(options) {
		Store.bind(this)
		wx.reLaunch({ url: '/pages/home/index' })
	},
})
