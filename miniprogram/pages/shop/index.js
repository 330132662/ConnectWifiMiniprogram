const storage = require('../../utils/storage')
const Store = require('./store')
const app = getApp()

Page({
	data: Store.data,
	onLoad(options) {
		Store.bind(this)
		Store._init()
	},
	onShow() {
		if (this.getTabBar()) {
			this.getTabBar().init()
		}
	},
	handleMerchant() {
		wx.navigateTo({ url: '/other/merchant/index' })
	},
	handleContact(e) {
		const phoneNumber = e.currentTarget.dataset.tel
		wx.makePhoneCall({
			phoneNumber,
		})
	},
	handleLocate() {
		const merchant = this.data.custom.merchant
		if (merchant.longitude && merchant.latitude) {
			wx.showLoading()
			wx.openLocation({
				latitude: Number(merchant.latitude),
				longitude: Number(merchant.longitude),
				scale: 18,
				name: merchant.name,
				address: merchant.address,
				fail: e => {
					app.utils.modalText(e)
				},
				complete: () => {
					wx.hideLoading()
				},
			})
		}
	},
	handleCourseItemClick(e) {
		const id = e.currentTarget.dataset.id
		wx.navigateTo({
			url: `/pages/coursedetail/index?id=${id}`,
		})
	},
	handleTeacherItemClick(e) {
		const id = e.currentTarget.dataset.id
		wx.navigateTo({
			url: `/pages/teacherdetail/index?id=${id}`,
		})
	},
	handleAlbumItemClick(e) {
		const id = e.currentTarget.dataset.id
		wx.navigateTo({
			url: `/pages/albumdetail/index?id=${id}`,
		})
	},
	handleGroupClick(e) {
		const id = e.currentTarget.dataset.id
		wx.reLaunch({
			url: `/pages/course/index?id=${id}`,
		})
	},
})
