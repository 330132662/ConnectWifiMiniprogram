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
			coupon: {},
			showPopup: false,
			currentTitle: '',
			currentName: '',
			currentValue: new Date().getTime(),
			minDate: new Date().getTime(),
			maxDate: new Date(2024, 12, 31).getTime(),
			formatter(type, value) {
				if (type === 'year') {
					return `${value}年`
				} else if (type === 'month') {
					return `${value}月`
				} else if (type === 'day') {
					return `${value}日`
				}
				return value
			},
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
	async getMerchantCouponDetail(data) {
		const coupon = await this.model.getMerchantCouponDetail(data)
		this.data.coupon = coupon
		this.data.loading = false
		this.data.disabled = false
		this.update()
		return coupon
	}
	async saveMerchantCouponDetail(data) {
		this.data.disabled = true
		this.update()
		const result = await this.model.saveMerchantCouponDetail(data)
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
}

module.exports = new ModelStore()
