const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
		this.setData({
			tipType: options.tipType || 'info',
			tipText: options.tipText || '',
			btnType: options.btnType || 'back',
			btnText: options.btnText || '确定',
			copy: options.copy || '',
		})
		const tip = options.tip || ''
		const back = options.back || true
		const type = options.type || 'info'
		Store.setItem('tip', tip)
		Store.setItem('type', type)
		Store.setItem('back', back)
	},
	handleBack() {
		return app.utils.alwaysBack()
	},
	handleExit() {
		return wx.exitMiniProgram()
	},
	handleCopy() {
		if (this.data.copy) {
			wx.setClipboardData({
				data: this.data.copy,
			})
		} else {
			app.utils.toastText('复制失败')
		}
	},
})
