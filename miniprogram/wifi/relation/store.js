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
			showPopupMerchant: false,
			merchant: null,
			wifi: null,
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
	async clearMerchantRelated(data) {
		return await this.model.clearMerchantRelated(data)
	}
	async getTotal(data = {}) {
		const userInfo = this.data.userInfo
		const openid = userInfo.openid
		data.openid = openid
		return await this.model.getTotal(data)
	}
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	async updateMyRelation(data) {
		return await this.model.updateMyRelation(data)
	}
	async getWifiCode(data) {
		return await this.model.getWifiCode(data)
	}
	async getMerchantDetail(data) {
		return await this.model.getMerchantDetail(data)
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
