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
			page: 1,
			finished: false,
			loading: false,
			list: [],
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
	async getGasList(location) {
		const userInfo = this.data.userInfo
		const loading = this.data.loading
		const finished = this.data.finished

		if (loading || finished || !location.lon || !location.lat) {
			return []
		}
		const page = this.data.page
		if (page >= 5) {
			this.data.finished = true
			this.data.loading = false
			this.update()
			return []
		}
		this.data.loading = true
		this.update()
		try {
			const lon = location.lon
			const lat = location.lat
			const mobile = userInfo.mobile || ''
			const oldList = this.data.list
			const itemName = this.data.itemName
			let { data: newList } = await this.model.getGasList({
				page,
				lon,
				lat,
				mobile,
			})
			if (newList && newList.length) {
				newList = newList.map(item => {
					if (item.queryStorePrice && item.queryStorePrice.storeId) {
						item.itemName = item.queryStorePrice.itemName
						item.storePrice = item.queryStorePrice.storePrice
						item.vipPrice = item.queryStorePrice.vipPrice
						const itemInfoStrList = []
						item.itemInfoList.map(val => {
							return val.itemName && itemInfoStrList.push(val.itemName)
						})
						item.itemInfoStrList = itemInfoStrList
					} else {
						const itemInfo =
							item.itemInfoList.find(val => val.itemName == itemName) || {}
						const itemInfoStrList = []
						item.itemInfoList.map(val => {
							return val.itemName && itemInfoStrList.push(val.itemName)
						})
						item.itemInfoStrList = itemInfoStrList
						item.itemName = itemInfo.itemName || itemName
						item.storePrice = itemInfo.storePrice || '-'
						item.vipPrice = itemInfo.storePrice || '-'
					}
					return item
				})
				this.data.list = oldList.concat(newList)
				this.data.finished = false
				if (page == 1) {
					this.data.list = newList
				}
			} else {
				this.data.finished = true
			}
			this.data.page = page + 1
			this.data.loading = false
			this.data.fullLoading = false
			this.update()
		} catch (e) {
			console.error(e)
			this.data.loading = false
			this.data.fullLoading = false
			this.update()
		}
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
