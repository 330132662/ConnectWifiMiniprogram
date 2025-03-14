const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')

class ModelStore extends Store {
	constructor() {
		super()
		this.data = {
			singlePage: false,
			customLoading: true,
			custom: null,
			userInfo: null,

			fullLoading: true,
			loading: true,
			agent: {},
			// 1: 微信   2：支付宝 3: 自动提现
			type: 0,
			// 金额
			cash: '',
			showMiniPopup: false,
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}, customCb = () => {}) {
		UserStore.subscribe(() => {
			const userInfo = UserStore.data.userInfo
			if (userInfo.agent_id && userInfo.agent) {
				this.data.agent = userInfo.agent
			}
			this.data.userInfo = UserStore.data.userInfo
			this.update()
			typeof userCb == 'function' && userCb()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			if (custom.deposit_type && custom.deposit_type.length == 1) {
				this.setData({ type: custom.deposit_type[0] })
			}
			this.data.custom = custom
			this.data.loading = false
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
			typeof customCb == 'function' && customCb()
		})
	}
	async generateDeposit(data) {
		return await this.model.generateDeposit(data)
	}
	async getAgentInfo(data) {
		return await this.model.getAgentInfo(data)
	}
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	setItem(name, value) {
		const arr = name.split('.')
		if (arr && arr.length == 2) {
			if (!this.data[arr[0]]) {
				this.data[arr[0]] = {}
			}
			this.data[arr[0]][arr[1]] = value
		} else {
			this.data[name] = value
		}
		this.update()
	}
}

module.exports = new ModelStore()
