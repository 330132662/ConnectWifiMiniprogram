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
			search: {
				status: '',
				content: '',
			},
			showActiveList: false,
			activeList: [
				{ id: '', name: '全部', className: 'width100' },
				{ id: 1, name: '待审核', className: 'width100' },
				{ id: 2, name: '已审核', className: 'width100' },
			],

			loading: true,
			list: [],
			finished: false,
			page: 1,
		}
		this.model = new Model()
	}
	async _init() {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			this.data.loading = false
			this.update()
			this.getMyAgentList()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
		})
	}
	async getMyAgentList() {
		const loading = this.data.loading
		const finished = this.data.finished
		if (loading || finished) {
			return
		}
		const userInfo = this.data.userInfo
		const pid = userInfo.agent_id
		const page = this.data.page
		const search = this.data.search
		this.data.loading = true
		this.update()
		const { list: newList } = await this.model.getMyAgentList({
			page,
			pid,
			...search,
		})
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
	}
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	async toggleStatus(data) {
		return await this.model.toggleStatus(data)
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
