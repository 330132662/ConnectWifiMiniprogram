const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const custom = require('../../store/custom')
const storage = require('../../utils/storage')
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
				})
				videoAd.onClose(async res => {
					if (res && res.isEnded) {
						await this.handleApply()
					} else {
						wx.showModal({
							content: '申请成为代理商之前必须认真看完广告哦',
							showCancel: true,
							cancelText: '暂不申请',
							cancelColor: '#bbb',
							confirmText: '继续申请',
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
		Store.setItem('loading', true)
		timeoutId = setTimeout(() => {
			if (title) {
				wx.showLoading({ title, mask })
			} else {
				wx.showLoading({ mask })
			}
		}, timeout)
	},
	hideLoading() {
		Store.setItem('loading', false)
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
		wx.hideLoading()
	},
	onActionShow() {
		const actions = []
		const custom = this.data.custom
		if (custom.agent_apply_tuan == 1) {
			actions.push({ id: 1, name: this.data.text_tuan, className: 'width100' })
		}
		if (custom.agent_apply_tuo == 1) {
			actions.push({ id: 2, name: this.data.text_tuo, className: 'width100' })
		}
		if (custom.agent_apply_shang == 1) {
			actions.push({ id: 3, name: this.data.text_shang, className: 'width100' })
		}
		Store.setItem('actions', actions)
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
		let inputDefault = 50
		let agentPayActive = false
		let agentPayFee = 0
		let agentAuto = 0
		if (id == 1) {
			inputDefault = custom.default_percent_tuan || 50
			agentPayActive = custom.agent_pay_tuan
			agentPayFee = custom.agent_fee_tuan
			agentAuto = custom.agent_auto_tuan
		} else if (id == 2) {
			inputDefault = custom.default_percent_tuo || 50
			agentPayActive = custom.agent_pay_tuo
			agentPayFee = custom.agent_fee_tuo
			agentAuto = custom.agent_auto_tuo
		} else if (id == 3) {
			inputDefault = custom.default_percent_shang || 50
			agentPayActive = custom.agent_pay_shang
			agentPayFee = custom.agent_fee_shang
			agentAuto = custom.agent_auto_shang
		}
		Store.setItem('form.percent', inputDefault)
		Store.setItem('form.agent_pay', agentPayActive)
		Store.setItem('form.agent_fee', agentPayFee)
		Store.setItem('form.agent_auto', agentAuto)
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
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		Store.setItem(`form.${name}`, value)
	},
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		console.log(name)
		Store.setItem(`form.${name}`, '')
	},
	onMobileError() {
		this.setData({ mobileError: true })
	},
	onShowTip(e) {
		const name = e.currentTarget.dataset.name
		if (name == 'realname') {
			return app.utils.modalText(
				'请正确填写您的名字，该项主要用于佣金提现时的真实姓名校验。'
			)
		} else if (name == 'mobile') {
			return app.utils.modalText(
				'请正确填写您的手机号，该项主要用于佣金提现时的校验或确认。'
			)
		}
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
	async handleConfirm() {
		if (this.data.loading) {
			return
		}
		const postData = Object.assign({}, this.data.form)
		if (!this.data.mobileError) {
			postData.mobile = this.data.userInfo.mobile
		}
		if (!postData.role_id || !postData.role_name) {
			return app.utils.toastText('请选择代理商类型')
		}
		if (!postData.realname) {
			return app.utils.toastText('请输入真实姓名')
		}
		if (!postData.mobile) {
			return app.utils.toastText('请输入您的手机号')
		}
		if (postData.agent_pay == 1 && postData.agent_fee > 0) {
			await this.handleApply()
		} else {
			this._showAd().catch(async () => {
				await this.handleApply()
			})
		}
	},
	async handleApply() {
		if (this.data.loading) {
			return
		}
		const postData = Object.assign({}, this.data.form)
		if (!this.data.mobileError) {
			postData.mobile = this.data.userInfo.mobile
		}
		if (!postData.role_id || !postData.role_name) {
			return app.utils.toastText('请选择代理商类型')
		}
		if (!postData.realname) {
			return app.utils.toastText('请输入真实姓名')
		}
		if (!postData.mobile) {
			return app.utils.toastText('请输入您的手机号')
		}
		try {
			if (postData.agent_pay == 1 && postData.agent_fee > 0) {
				const platform = storage.getItem('platform')
				if (platform == 'ios') {
					return app.utils.modalText('暂不支持iOS用户申请入驻')
				}
				this.showLoading('生成订单')
				const result = await Store.generateAgentOrder(postData)
				this.hideLoading()
				wx.requestPayment({
					...result,
					timeStamp: result.timestamp,
					success: async () => {
						this.showLoading('请稍后')
						try {
							await Store.applyAgent(postData)
							this.hideLoading()
							const tipAuto = `恭喜您成为${postData.role_name}，现在就可以开始WiFi分销赚钱啦！`
							const tipCheck = `您已成功提交申请，请耐心等候平台审核后方可进行WiFi分销赚钱`
							UserStore.login()
							app.utils
								.modalText(postData.agent_auto == 1 ? tipAuto : tipCheck)
								.then(() => {
									wx.reLaunch({
										url: '/pages/home/index',
									})
								})
						} catch (e) {
							console.error(e)
							this.hideLoading()
						}
					},
					fail: err => {
						console.error('pay fail', err)
					},
				})
			} else {
				this.showLoading('请稍后')
				try {
					await Store.applyAgent(postData)
					this.hideLoading()
					const tipAuto = `恭喜您成为${postData.role_name}，现在就可以开始WiFi分销赚钱啦！`
					const tipCheck = `您已成功提交申请，请耐心等候平台审核后方可进行WiFi分销赚钱`
					UserStore.login()
					app.utils
						.modalText(postData.agent_auto == 1 ? tipAuto : tipCheck)
						.then(() => {
							wx.reLaunch({ url: '/pages/home/index' })
						})
				} catch (e) {
					console.error(e)
					this.hideLoading()
				}
			}
		} catch (e) {
			console.error(e)
			this.hideLoading()
		}
	},
})
