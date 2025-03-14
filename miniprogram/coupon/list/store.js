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

			loading: true,
			disabled: false,
			list: [],
			page: 1,
			finished: false,
		}
		this.model = new Model()
	}
	async _init() {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			this.update()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
		})
	}
	async getCouponList(mid) {
		const disabled = this.data.disabled
		const finished = this.data.finished
		if (disabled || finished) {
			return
		}
		const page = this.data.page
		this.data.loading = true
		this.update()
		const { list: newList } = await this.model.getCouponList({
			page,
			merchant_id: mid,
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
	async deleteCoupon(data) {
		return await this.model.deleteCoupon(data)
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
