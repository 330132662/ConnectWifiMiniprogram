import { getMyMerchantList } from '../../../../api/merchant'
const UserStore = require('../../../../store/user')
const app = getApp()

Component({
	options: {
		virtualHost: true,
	},
	externalClasses: ['x-class'],
	properties: {
		show: {
			type: Boolean,
			value: false,
			observer(showPopup) {
				if (showPopup) {
					if (!this.list || !this.list.length) {
						this.setData({ loading: false, finished: false, page: 1, list: [] })
						this.fetch()
					}
				}
				this.setData({ showPopup })
			},
		},
	},
	data: {
		showPopup: false,
		list: [],
		loading: false,
		page: 1,
		finished: false,
		selected: null,
	},
	methods: {
		handleClosePopup() {
			this.triggerEvent('close')
		},
		fetch() {
			const finished = this.data.finished
			const loading = this.data.loading
			if (loading || finished) {
				return
			}
			const userInfo = UserStore.data.userInfo
			const openid = userInfo.openid || ''
			const page = this.data.page
			this.setData({ loading: true })
			getMyMerchantList({ page, openid })
				.then(({ data: { list: newList } }) => {
					const oldList = this.data.list
					if (newList && newList.length) {
						this.setData({ finished: false, list: oldList.concat(newList) })
					} else {
						this.setData({ finished: true })
					}
					this.setData({ page: page + 1, loading: false })
				})
				.catch(() => {
					this.setData({ loading: false })
				})
		},
		onScrollBottom() {
			if (this.data.finished || this.data.loading) {
				return
			}
			this.fetch()
		},
		handleSelect(e) {
			const selected = e.currentTarget.dataset.item
			this.setData({ selected })
			this.triggerEvent('change', selected)
		},
	},
})
