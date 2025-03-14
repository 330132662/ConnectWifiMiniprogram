const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const storage = require('../../utils/storage')

class ModelStore extends Store {
	constructor() {
		super()
		this.data = {
			customLoading: true,
			custom: null,
			userInfo: null,
			text_tuan: '团长',
			text_tuo: '拓展员',
			text_shang: '商家',

			form: {},
			actions: [],
			showAction: false,

			inputRangeActive: false,
			inputDown: 0,
			inputUp: 100,
			showMiniPopup: false,
			mobileError: false,
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
			this.data.text_tuan = custom.text_tuan || '团长'
			this.data.text_tuo = custom.text_tuo || '拓展员'
			this.data.text_shang = custom.text_shang || '商家'
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
			typeof customCb == 'function' && customCb()
		})
	}
	async generateAgentOrder(data) {
		const userInfo = this.data.userInfo
		data.openid = userInfo.openid
		data.nickname = userInfo.nickname
		data.mobile = userInfo.mobile
		return await this.model.generateAgentOrder(data)
	}
	async applyAgent(data) {
		const userInfo = this.data.userInfo
		data.openid = userInfo.openid
		data.nickname = userInfo.nickname
		data.avatar = userInfo.avatar
		data.mobile = userInfo.mobile
		return await this.model.applyAgent(data)
	}
	async getDetail(data) {
		return await this.model.getDetail(data)
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
