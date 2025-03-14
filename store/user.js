const { Store } = require('../libs/westore')
const User = require('../model/user')
let singleStore = null

class UserStore extends Store {
	constructor() {
		super()
		this.onChanges = []
		this.data = {
			userInfo: {},
		}
		this.model = new User()
	}
	subscribe(cb = () => {}) {
		if (typeof cb == 'function') {
			if (this.data.userInfo && this.data.userInfo.nickname) {
				cb()
			} else {
				this.onChanges.push(cb)
			}
		}
	}
	inform() {
		this.onChanges.forEach(cb => typeof cb == 'function' && cb())
	}
	refreshUserInfo(postData) {
		console.log(postData, '111')
		this.data.userInfo = Object.assign({}, postData)
		this.update()
		this.inform()
	}
	async login() {
		const userInfo = await this.model.login()
		this.data.userInfo = userInfo
		this.update()
		this.inform()
		return userInfo
	}
	async updateUserInfo(data) {
		const result = await this.model.updateUserInfo(data)
		return result
	}
	minusCreated(num = 1) {
		const created =
			this.data.userInfo.created <= 0 ? 0 : this.data.userInfo.created
		this.data.userInfo.created = created - num <= 0 ? 0 : created - num
		this.update()
		this.inform()
	}
	addCreated(num = 1) {
		const created = this.data.userInfo.created
		this.data.userInfo.created = created + num
		this.update()
		this.inform()
	}
	setItem(name, value) {
		this.data.userInfo[name] = value
		this.update()
		this.inform()
	}
}
UserStore.getStore = () => {
	if (!singleStore) {
		singleStore = new UserStore()
	}
	return singleStore
}
module.exports = UserStore.getStore()
