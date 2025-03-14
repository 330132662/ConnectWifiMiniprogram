const custom = require('../../store/custom')
const Store = require('./store')
const app = getApp()

let timeoutId = null
const formatCash = str => {
	if (str == 0) {
		return '0.00'
	} else {
		str = Number(str)
		if (isNaN(str)) {
			return '0.00'
		} else {
			str = parseFloat(str.toFixed(2))
			return str
		}
	}
}
const hasOne = (arr = [], val = '') => {
	var flag = false
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == val) {
			flag = true
		}
	}
	return flag
}

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init(async () => {
			if (this.data.agent && this.data.agent.id) {
				const agent = await Store.getAgentInfo({ id: this.data.agent.id })
				if (agent) {
					Store.setItem('fullLoading', false)
					Store.setItem('agent', agent)
					Store.setItem('agent', agent)
				} else {
					return app.utils.modalText('您还未成为代理商，无法访问该网页')
				}
			} else {
				return app.utils.modalText('您还未成为代理商，无法访问该网页')
			}
		})
	},
	showLoading(title = '', mask = true, timeout = 500) {
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
	selectType(e) {
		const type = e.currentTarget.dataset.type
		Store.setItem('type', type)
	},
	handleShowPopup() {
		this.setData({ showMiniPopup: true })
	},
	handleCloseMiniPopup() {
		this.setData({ showMiniPopup: false })
	},
	onInputBlur({ detail }) {
		let cash = Number(detail.value)
		if (isNaN(cash)) {
			this.setData({ cash: '' })
			return app.utils.toastText('金额格式输入错误')
		} else {
			cash = parseFloat(cash.toFixed(2))
			if (cash) {
				this.setData({ cash })
			} else {
				this.setData({ cash: '' })
			}
		}
	},
	handle2Agent() {
		wx.navigateTo({
			url: '/pages/agentinfo/index',
		})
	},
	async handleDeposit() {
		if (this.data.loading) {
			return app.utils.toastText('请稍后')
		}
		const userInfo = this.data.userInfo
		if (!userInfo.agent_id || !userInfo.agent) {
			return app.utils.modalText('您还不是代理商，仅代理商可申请提现哦 ~')
		}
		const agent = userInfo.agent
		const type = this.data.type
		const cashRemain = agent.cash_remain
		let cash = this.data.cash
		if (!type) {
			return app.utils.toastText('请选择提现渠道')
		}
		if (type == 1 && !agent.image_wechat) {
			return app.utils
				.modalText('检测到您还未配置微信收款信息，请先配置')
				.then(() => {
					wx.navigateTo({
						url: '/pages/agentinfo/index',
					})
				})
		}
		console.log(agent.image_ali)
		if (type == 2 && !agent.image_ali) {
			return app.utils
				.modalText('检测到您还未配置支付宝收款信息，请先配置')
				.then(() => {
					wx.navigateTo({
						url: '/pages/agentinfo/index',
					})
				})
		}
		if (!cash) {
			return app.utils.toastText('请填写提现金额')
		}
		cash = formatCash(cash)
		if (cash > cashRemain) {
			return app.utils.modalText('提现金额不能大于当前可提现金额')
		}
		const cashLimit = this.data.custom.deposit_cash || 5
		if (cash < cashLimit) {
			return app.utils.toastText(`提现金额不能低于${cashLimit}元`)
		}
		this.showLoading()
		try {
			await Store.generateDeposit({
				role_id: agent.role_id,
				agent_id: agent.id,
				agent_openid: agent.openid,
				agent_mobile: agent.mobile,
				agent_realname: agent.realname,
				cash,
				type,
			})
			this.hideLoading()
			let tip =
				'您的提现申请已提交，请耐心等候审核，预计 1 至 5天内会拨款到您的相应渠道'
			// let depositTypeList = custom.deposit_type
			// if (!depositTypeList || !Array.isArray(depositTypeList)) {
			// 	depositTypeList = []
			// }
			console.log(custom.deposit_type)
			if (hasOne(custom.deposit_type, '3')) {
				tip =
					'您的提现申请已提交，请耐心等候审核，如果选择的是自动提现渠道，请稍后关注微信支付提醒'
			}
			app.utils.modalText(tip).then(() => {
				app.utils.alwaysBack()
			})
		} catch (e) {
			this.hideLoading()
		}
	},
	handleRecord() {
		wx.navigateTo({
			url: '/pages/depositlist/index',
		})
	},
})
