const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

let timeoutId = null
let videoAd = null
let videoError = false
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
				videoAd.onError(err => {
					videoError = true
					app.utils.toastText('激励视频广告加载失败')
				})
				videoAd.onClose(async res => {
					if (res && res.isEnded) {
						await this._bindCode()
					} else {
						wx.showModal({
							content:
								'邀请代理商之前必须认真看完广告哦，否则无法正常生成邀请码。',
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
	},
	showLoading(title = '', mask = true, timeout = 200) {
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
	onActionShow() {
		const userInfo = this.data.userInfo
		if (userInfo.role_id == 1) {
			Store.setItem('actions', [
				{ id: 2, name: this.data.text_tuo, className: 'width100' },
				{ id: 3, name: this.data.text_shang, className: 'width100' },
			])
		} else if (userInfo.role_id == 2) {
			Store.setItem('actions', [
				{ id: 3, name: this.data.text_shang, className: 'width100' },
			])
		}
		Store.setItem('showAction', true)
	},
	onActionClose() {
		Store.setItem('showAction', false)
	},
	onInviteSelect({ detail }) {
		const custom = this.data.custom || {}
		const id = detail.id || ''
		const name = detail.name || ''
		Store.setItem('form.role_id', id)
		Store.setItem('form.role_name', name)
		let inputRangeActive = false
		let inputDown = 50
		let inputUp = 50
		let inputDefault = 50
		if (id == 2) {
			inputRangeActive = custom.range_tuo_active == 1
			inputDown = custom.range_tuo_down
			inputUp = custom.range_tuo_up
			inputDefault = custom.default_percent_tuo
		} else if (id == 3) {
			inputRangeActive = custom.range_shang_active == 1
			inputDown = custom.range_shang_down
			inputUp = custom.range_shang_up
			inputDefault = custom.default_percent_shang
		}
		if (inputRangeActive) {
			Store.setItem('inputDown', inputDown)
			Store.setItem('inputUp', inputUp)
		} else {
			Store.setItem('inputDown', 0)
			Store.setItem('inputUp', 100)
		}
		Store.setItem('form.percent', inputDefault)
		Store.setItem('inputRangeActive', inputRangeActive)
	},
	onPercentChange({ detail }) {
		Store.setItem('form.percent', detail)
	},
	handleShowMiniPopup() {
		Store.setItem('showMiniPopup', true)
	},
	handleCloseMiniPopup() {
		Store.setItem('showMiniPopup', false)
	},
	_showAd() {
		return new Promise((resolve, reject) => {
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
		})
	},
	async _bindCode() {
		const postData = Object.assign({}, this.data.form)
		if (!postData.role_id || !postData.role_name) {
			return app.utils.toastText('请选择邀请类型')
		}
		const userInfo = this.data.userInfo
		const pid = userInfo.agent_id
		postData.pid = pid
		this.showLoading()
		try {
			const { data: code } = await Store.getBindCode(postData)

			app.setTempData('code', code)
			wx.redirectTo({
				url: `/wifi/status/index?pid=${pid}&role_id=${postData.role_id}&percent=${postData.percent}`,
				complete: () => {
					this.hideLoading()
				},
			})
		} catch (e) {
			console.error(e)
			this.hideLoading()
		}
	},
	async handleGenerateBindCode() {
		if (this.data.disabled) {
			return
		}
		const postData = this.data.form
		if (!postData.role_id || !postData.role_name) {
			return app.utils.toastText('请选择邀请类型')
		}
		// tododelete
		return await this._bindCode()
		this._showAd().catch(async () => {
			await this._bindCode()
		})
	},
	handleViewMyTeam() {
		wx.navigateTo({ url: '/wifi/member/index' })
	},
})
