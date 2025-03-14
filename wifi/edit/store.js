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
			wifi: {},
			platform: '',
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}, customCb = () => {}) {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			const platform = storage.getItem('platform')
			this.data.platform = platform
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
	async getWifiCode(data) {
		const wifi = await this.model.getWifiCode(data)
		this.data.wifi = wifi
		this.data.loading = false
		this.update()
		return wifi
	}
	async saveWifiCode(data) {
		const result = await this.model.saveWifiCode(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		return await this.model.checkImgIsValid(file, save)
	}
	async checkTextIsValid(content) {
		return await this.model.checkTextIsValid(content)
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
	setWifiData(name, value) {
		this.data.wifi[name] = value
		this.update()
	}
}

module.exports = new ModelStore()
