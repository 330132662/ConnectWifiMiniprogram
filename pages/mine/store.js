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
			disabled: false,
			wifi: {},
			canApplyAuto: false,
		}
		this.model = new Model()
	}
	async _init(userCb = () => {}, customCb = () => {}) {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			this.data.loading = false
			this.update()
			typeof userCb == 'function' && userCb()
		})
		CustomStore.subscribe(() => {
			const custom = CustomStore.data.custom
			this.data.custom = custom
			this.data.customLoading = CustomStore.data.customLoading
			if (
				custom.agent_apply_tuan ||
				custom.agent_apply_tuo ||
				custom.agent_apply_shang
			) {
				this.data.canApplyAuto = true
			} else {
				this.data.canApplyAuto = false
			}
			this.update()
			typeof customCb == 'function' && customCb()
		})
	}
	async getWifiCode(data) {
		const wifi = await this.model.getWifiCode(data)
		this.data.wifi = wifi
		console.log('wifi', wifi)
		this.data.loading = false
		this.update()
		return wifi
	}
	async saveWifiCode(data) {
		if (this.data.disabled) {
			return
		}
		this.data.disabled = true
		this.update()
		const result = await this.model.saveWifiCode(data)
		this.data.disabled = false
		this.update()
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
	setWifiData(name, value) {
		this.data.wifi[name] = value
		this.update()
	}
}

module.exports = new ModelStore()
