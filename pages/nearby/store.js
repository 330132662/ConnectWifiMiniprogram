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

			activeTabIndex: 0,
			fullLoading: true,
			groupList: [],
			list: [],
			loading: false,
			page: 1,
			finished: false,
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}, customCb = () => {}) {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			this.update()
			typeof userCb == 'function' && userCb()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
			typeof customCb == 'function' && customCb()
		})
	}
	async getGroupList(data) {
		const { list } = await this.model.getGroupList(data)
		return list
	}
	async getNearbyMerchant(postData) {
		const loading = this.data.loading
		const finished = this.data.finished
		if (loading || finished) {
			return
		}
		const page = this.data.page
		this.data.loading = true
		this.update()
		const newList = await this.model.getNearbyMerchant({ page, ...postData })
		const oldList = this.data.list
		if (newList && newList.length) {
			this.data.list = oldList.concat(newList)
			this.data.finished = false
		} else {
			this.data.finished = true
		}
		this.data.page = page + 1
		this.data.loading = false
		this.update()
		return this.data.list
	}
	setItem(name, value) {
		this.data[name] = value
		this.update()
	}
}

module.exports = new ModelStore()
