const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const storage = require('../../utils/storage')

class ModelStore extends Store {
	constructor() {
		super()
		this.data = {
			singlePage: false,
			customLoading: true,
			custom: null,
			userInfo: null,

			fullLoading: true,
			loading: false,
			form: {},
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}) {
		UserStore.subscribe(() => {
			const userInfo = UserStore.data.userInfo
			if (userInfo.agent_id && userInfo.agent) {
				this.data.form = Object.assign({}, userInfo.agent)
			}
			this.data.fullLoading = false
			this.data.userInfo = UserStore.data.userInfo
			this.update()
			typeof userCb == 'function' && userCb()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
		})
	}
	async updateMyAgentInfo(data) {
		const userInfo = this.data.userInfo
		data.openid = userInfo.openid
		const result = await this.model.updateMyAgentInfo(data)
		if (result) {
			UserStore.data.userInfo.agent = Object.assign(
				{},
				this.data.userInfo.agent,
				result
			)
			console.log(
				'UserStore.data.userInfo.agent',
				UserStore.data.userInfo.agent,
				Object.assign({}, this.data.userInfo.agent, result)
			)
			UserStore.update()
			UserStore.inform()
		}
		return result
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
