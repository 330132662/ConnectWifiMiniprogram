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
			disabled: false,
			merchant: null,

			groupPopupShow: false,
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
	async getMerchantDetail(data) {
		this.setItem('disabled', true)
		try {
			const merchant = await this.model.getMerchantDetail(data)
			this.setItem('merchant', merchant)
			this.setItem('disabled', false)
			return merchant
		} catch (e) {
			this.setItem('disabled', false)
			return null
		}
	}
	async saveMyMerchant(data) {
		const userInfo = this.data.userInfo
		const openid = userInfo.openid
		data.openid = openid
		return await this.model.saveMyMerchant(data)
	}
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	setItem(name, value) {
		const arr = name.split('.')
		if (arr && arr.length == 2) {
			this.data[arr[0]][arr[1]] = value
		} else {
			this.data[name] = value
		}
		this.update()
	}
}

module.exports = new ModelStore()
