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
			wifi: null,
			hasAdMust: false,
			hasAd: false,
			hasMobile: false,
			hasInfo: false,
			// 连接状态 0未连接；  1：已连接；2：连接中；3；连接失败
			linkStatus: 0,
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
	async getLinkedWifi(data) {
		const wifi = await this.model.getLinkedWifi(data)
		this.data.wifi = wifi
		this.data.loading = false
		this.update()
		return wifi
	}
	async lingquCoupon(data) {
		return await this.model.lingquCoupon(data)
	}
	async logEveryLink(data) {
		const userInfo = this.data.userInfo
		data.openid = userInfo.openid
		data.avatar = userInfo.avatar
		data.nickname = userInfo.nickname
		data.mobile = userInfo.mobile
		data.system = userInfo.system
		return await this.model.logEveryLink(data)
	}
	async logValidLink(data) {
		const userInfo = this.data.userInfo
		data.openid = userInfo.openid
		return await this.model.logValidLink(data)
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
