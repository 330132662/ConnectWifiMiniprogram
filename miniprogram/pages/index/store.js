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
		}
		this.model = new Model()
		this.cb()
	}
	cb() {
		UserStore.subscribe(() => {
			this.data.userInfo = UserStore.data.userInfo
			this.update()
		})
		CustomStore.subscribe(() => {
			this.data.custom = CustomStore.data.custom
			this.data.customLoading = CustomStore.data.customLoading
			this.update()
		})
	}
	setItem(name, value) {
		this.data[name] = value
		this.update()
	}
}

module.exports = new ModelStore()
