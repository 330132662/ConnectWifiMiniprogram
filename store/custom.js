const { Store } = require('../libs/westore')
const Custom = require('../model/custom')
const storage = require('../utils/storage')
const siteInfo = require('../siteinfo')
let singleStore = null

class CustomStore extends Store {
	constructor() {
		super()
		this.onChanges = []
		this.data = {
			customLoading: true,
			custom: {},
			singlePage: false,
		}
		this.model = new Custom()
	}
	subscribe(cb) {
		if (typeof cb == 'function') {
			if (this.data.custom && this.data.custom.id) {
				cb()
			} else {
				this.onChanges.push(cb)
			}
		}
	}
	inform() {
		this.onChanges.forEach(cb => typeof cb == 'function' && cb())
	}
	async getCustomDetail(data) {
		const custom = await this.model.getCustomDetail(data)
		const result = custom.data
		if (!result.color) {
			result.color = '#1989fa'
		}
		if (!result.form_ad) {
			result.form_ad = {}
		}
		if (!result.form_cdn) {
			result.form_cdn = { type: 1 }
		}
		if (!result.form_icon) {
			result.form_icon = {}
		}
		if (!result.form_pay) {
			result.form_pay = {}
		}
		if (!result.form_mini) {
			result.form_mini = {}
		}
		result.host = siteInfo.host || ''

		this.data.custom = result
		this.data.customLoading = false
		this.update()
		this.inform()
		return custom
	}
	setItem(name, value) {
		this.data.custom[name] = value
		this.update()
		this.inform()
	}
}
CustomStore.getStore = () => {
	if (!singleStore) {
		singleStore = new CustomStore()
	}
	return singleStore
}
module.exports = CustomStore.getStore()
