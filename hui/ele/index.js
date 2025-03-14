const Store = require('./store')
const app = getApp()
let timeoutId = null

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init(() => {
			this.onTabClick({ detail: { name: '3' } })
		})
	},
	handleBack() {
		return app.utils.alwaysBack()
	},
	showLoading(title = '', mask = true, timeout = 20) {
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
	async onTabClick({ detail }) {
		if (this.data.disabled) {
			return
		}
		const currentName = detail.name
		const current = await this.handleHuiItemClick(currentName)
		Store.setItem('current', current)
		Store.setItem('currentName', currentName)
	},
	async handleHuiItemClick(act_id) {
		if (this.data.disabled) {
			return
		}
		const history = app.getItem('history')
		if (history[`act_${act_id}`] && history[`act_${act_id}`].act_id) {
			return history[`act_${act_id}`].we_app_info
		}
		const userInfo = this.data.userInfo
		const mobile = userInfo.mobile || ''
		const sid = userInfo.id
		this.showLoading()
		try {
			const result = await Store.getActDetail({ act_id, sid, mobile })
			this.hideLoading()
			if (result.we_app_info && result.we_app_info.app_id) {
				result.act_id = act_id
				app.setItem(`history.act_${act_id}`, result)
				return result.we_app_info
			} else {
				app.utils.toastText('获取小程序信息失败')
				return null
			}
		} catch (e) {
			console.error(e)
			this.hideLoading()
			app.utils.toastText('获取小程序信息失败')
		}
	},
	handleBtnClick() {
		if (this.data.disabled || this.data.loading) {
			return
		}
		const current = this.data.current
		if (current && current.app_id) {
			wx.navigateToMiniProgram({
				appId: current.app_id,
				path: decodeURIComponent(current.page_path),
				fail: res => {
					const msg = res.errMsg
					if (msg === 'navigateToMiniProgram:fail invalid appid') {
						app.utils.modalText('跳转失败，可能是小程序路径或appid填写错误')
					} else if (
						msg === "navigateToMiniProgram:fail can't navigate to myself"
					) {
						wx.reLaunch({
							url: decodeURIComponent(current.page_path),
						})
					}
				},
			})
		} else {
			app.utils.modalText('跳转失败，存在未知的参数')
		}
	},
})
