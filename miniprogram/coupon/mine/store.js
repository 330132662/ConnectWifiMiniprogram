const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')

class ModelStore extends Store {
	constructor() {
		super()
		this.data = {
			customLoading: true,
			custom: null,
			userInfo: null,

			loading: false,
			currentIndex: 0,
			page: 1,
			finished: false,
			list: [],
			status: 0,
			showPopup: false,
			popupData: {},
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}) {
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
		})
	}
	async generateCheckedCode(data) {
		return await this.model.generateCheckedCode(data)
	}
	async toggleCouponlogStatus(data) {
		return await this.model.toggleCouponlogStatus(data)
	}
	async getMyCouponList(mid) {
		const loading = this.data.loading
		const finished = this.data.finished
		if (loading || finished) {
			return
		}
		this.data.loading = true
		this.update()
		const page = this.data.page
		const userInfo = this.data.userInfo
		const openid = userInfo.openid
		const status = this.data.status
		const { list: newList } = await this.model.getMyCouponList({
			page,
			merchant_id: mid,
			openid,
			status,
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
