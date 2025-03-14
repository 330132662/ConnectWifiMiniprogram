const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const custom = require('../../store/custom')
const app = getApp()

let timeoutId = null
let interstitialAd = null
let adTimeoutId = null

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
		const pid = options.pid
		const role_id = options.role_id
		const percent = options.percent
		if (!pid) {
			return app.utils
				.modalText(
					'您的上级代理权限已被冻结或已被删除，此次邀请无效，现在您可以直接申请并成为我们的代理商。'
				)
				.then(() => {
					wx.redirectTo({ url: '/wifi/apply/index' })
				})
		} else {
			const pAgent = await Store.getDetail({ id: pid })
			Store.setItem('pAgent', pAgent)
			Store.setItem('form.pid', pid)
			Store.setItem('form.role_id', role_id)
			Store.setItem('form.percent', percent)
			const custom = this.data.custom
			let agentAuto = 0
			if (role_id == 1) {
				agentAuto = custom.agent_auto_tuan
			} else if (role_id == 2) {
				agentAuto = custom.agent_auto_tuo
			} else if (role_id == 3) {
				agentAuto = custom.agent_auto_shang
			}
			Store.setItem('form.agent_auto', agentAuto)
		}
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
	async handleConfirm() {
		if (this.data.loading) {
			return
		}
		const postData = Object.assign({}, this.data.form)
		if (!postData.role_id) {
			return app.utils.toastText('请选择代理商类型')
		}
		if (!postData.realname) {
			return app.utils.toastText('请输入真实姓名')
		}
		const userInfo = this.data.userInfo
		if (!userInfo.mobile && !postData.mobile) {
			return app.utils.toastText('请输入您的手机号')
		}
		this.showLoading('请稍后')
		try {
			await Store.applyAgent(postData)
			this.hideLoading()
			const tipAuto = `系统已自动审核，现在就可以开始WiFi分销赚钱啦！`
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
	},
})
