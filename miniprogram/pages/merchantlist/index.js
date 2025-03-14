const Store = require('./store')
const app = getApp()

Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
	},
	onShow() {
		if (app.getTempData('refresh')) {
			this.handleConfirmSearch()
		}
	},
	onReachBottom() {
		if (this.data.finished) {
			return
		}
		Store.getMyMerchantList()
	},
	onInputChange({ detail }) {
		const content = detail.value
		Store.setItem('search', content)
	},
	onInputClear() {
		Store.setItem('search', '')
	},
	handleConfirmSearch() {
		if (this.data.disabled) {
			return app.utils.toastText('请稍后')
			return
		}
		Store.setItem('page', 1)
		Store.setItem('finished', false)
		Store.setItem('list', [])
		Store.setItem('total', 0)
		Store.getMyMerchantList()
	},
	handleSwiperOpen(e) {
		const id = e.currentTarget.id
		Store.setItem('hasSwiperCell', `#${id}`)
	},
	handleSwiperClose() {
		Store.setItem('hasSwiperCell', '')
	},
	handleSwiperClick(e) {
		const type = e.detail
		const hasSwiperCell = this.data.hasSwiperCell
		if (hasSwiperCell) {
			this.selectComponent(hasSwiperCell).close()
			this.setData({ hasSwiperCell: '' })
		}
		if (type === 'right') {
			const id = e.currentTarget.dataset.item.id
			this.handleDeleteWifiCode(id)
		}
	},
	// 删除wifi
	handleDeleteWifiCode(id) {
		if (this.data.disabled) {
			return app.utils.toastText('请稍后')
		}
		wx.showModal({
			content: '是否永久删除该门店？',
			showCancel: true,
			cancelText: '取消',
			cancelColor: '#000',
			confirmText: '确定删除',
			confirmColor: '#999',
			success: async result => {
				if (result.confirm) {
					Store.deleteMyMerchant(id)
				}
			},
		})
	},
	handleNew(e) {
		wx.navigateTo({ url: `/wifi/merchantedit/index` })
	},
	handleEditClick(e) {
		const id = e.currentTarget.dataset.id
		wx.navigateTo({ url: `/wifi/merchantedit/index?id=${id}` })
	},
})
