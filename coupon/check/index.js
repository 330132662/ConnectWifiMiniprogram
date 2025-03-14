const Store = require('./store')
const app = getApp()

Page({
	data: Store.data,
	async onLoad(options) {
		const { id } = options
		this.id = id
		if (!id) {
			wx.setNavigationBarTitle({
				title: '核销失败',
			})
			return app.utils
				.modalText('未知的核销码参数，请检查核销码是否正确，', '我知道了', {
					title: '核销失败',
				})
				.then(() => {
					app.utils.alwaysBack()
				})
		}
		Store.bind(this)
		Store._init(async () => {
			try {
				const result = await Store.checkedCouponlog({ id })
				Store.setItem('loading', false)
				wx.redirectTo({
					url: `/coupon/tip/index?type=success&tip=核销成功，优惠券已核销`,
				})
			} catch (e) {
				console.error(e)
				wx.redirectTo({
					url: `/coupon/tip/index?tip=${
						e.msg || '优惠券信息检测失败，此次核销失败'
					}`,
				})
			}
		})
	},
})
