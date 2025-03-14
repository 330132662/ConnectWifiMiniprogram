const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const utils = require('../../utils/index')

class ModelStore extends Store {
	constructor() {
		super()
		this.data = {
			singlePage: false,
			customLoading: true,
			custom: null,
			userInfo: null,

			search: '',
			loading: true,
			list: [],
			total: 0,
			finished: false,
			page: 1,
			agent: {},

			hasSwiperCell: '',
			disabled: false,

			showBlue: false,
			blueLink: false,
			printNum: 1,
			showDialog: false,
			dialogData: {},
			printLoading: false,
		}
		this.model = new Model()
	}
	async _init() {
		UserStore.subscribe(() => {
			const userInfo = UserStore.data.userInfo
			this.data.userInfo = userInfo
			this.update()
			if (userInfo && userInfo.agent_id && userInfo.agent) {
				this.data.agent = userInfo.agent
			}
			this.data.page = 1
			this.data.list = []
			this.data.finished = false
			this.data.loading = false
			this.getMyWifiList()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
		})
	}
	async getMyWifiList() {
		const userInfo = this.data.userInfo
		const search = this.data.search
		const openid = userInfo.openid
		if (!openid || this.data.loading || this.data.finished) {
			return
		}
		const page = +this.data.page
		this.data.loading = true
		this.update()
		try {
			const { list: newList, total } = await this.model.getMyWifiList({
				page,
				openid,
				search,
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
	async deleteMyWifi(id) {
		if (this.data.disabled) {
			return
		}
		const userInfo = this.data.userInfo
		const openid = userInfo.openid
		this.data.disabled = true
		this.update()
		utils.showLoading('正在删除')
		try {
			await this.model.deleteMyWifi({ id, openid })
			const list = this.data.list.filter(item => +item.id !== +id)
			this.data.list = list
			this.data.disabled = false
			this.update()
			UserStore.minusCreated()
			utils.hideLoading()
		} catch (e) {
			this.data.disabled = false
			this.update()
			utils.hideLoading()
		}
	}
	setItem(name, value) {
		this.data[name] = value
		this.update()
	}
}

module.exports = new ModelStore()
