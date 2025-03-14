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

			loading: false,
			page: 1,
			list: [],
			finished: false,
			agent: null,
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}) {
		UserStore.subscribe(() => {
			const userInfo = UserStore.data.userInfo
			this.data.userInfo = UserStore.data.userInfo
			if (userInfo.agent_id && userInfo.agent) {
				this.data.agent = userInfo.agent
			}
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
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	async getDepositList() {
		const agent = this.data.agent
		if (!agent || this.data.loading || this.data.finished) {
			return
		}
		const page = this.data.page
		this.data.loading = true
		this.update()
		try {
			const { list: newList, total } = await this.model.getDepositList({
				page,
				agent_id: agent.id,
			})
			const oldList = this.data.list
			if (newList && newList.length) {
				this.data.list = oldList.concat(newList)
				this.data.finished = false
			} else {
				this.data.finished = true
			}
			this.data.page = page + 1
			this.data.total = total
			this.data.loading = false
			this.update()
		} catch (e) {
			this.data.loading = false
			this.update()
		}
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
