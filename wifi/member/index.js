const Store = require('./store')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const app = getApp()

let timeoutId = null
Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init()
	},
	showLoading(title = '', mask = true, timeout = 500) {
		Store.setItem('loading', true)
		timeoutId = setTimeout(() => {
			if (title) {
				wx.showLoading({ title, mask })
			} else {
				wx.showLoading({ mask })
			}
		}, timeout)
	},
	hideLoading() {
		Store.setItem('loading', false)
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
		wx.hideLoading()
	},
	handleShowActiveList() {
		this.setData({ showActiveList: true })
	},
	handleCloseActiveList() {
		this.setData({ showActiveList: false })
	},
	handleActiveSelect({ detail }) {
		const status = detail.id
		this.setData({
			'search.status': status,
		})
	},
	onInputChange({ detail }) {
		const content = detail.value
		Store.setItem('search.content', content)
	},
	async handleConfirmSearch() {
		if (this.data.loading) {
			return
		}
		const userInfo = this.data.userInfo
		const pid = userInfo.agent_id
		if (pid) {
			this.setData({ list: [], finished: false, page: 1 })
			await Store.getMyAgentList()
		} else {
			return
		}
	},
	handleMore(e) {
		return
		const item = e.currentTarget.dataset.item
		if (item.status < 2) {
			return this.handleCheckMember({
				currentTarget: { dataset: { id: item.id } },
			})
		} else {
			this.setData({ popupDetail: item, popupShow: true })
		}
	},
	// 审核通过
	handleCheckMember(e) {
		if (this.data.loading) {
			return
		}
		const id = e.currentTarget.dataset.id
		wx.showActionSheet({
			itemList: ['拒绝通过', '审核通过'],
			success: async res => {
				const status = +res.tapIndex
				if (status === 0) {
					wx.showModal({
						content: '是否拒绝该用户的申请？',
						showCancel: true,
						cancelText: '取消',
						cancelColor: '#888',
						confirmText: '拒绝',
						confirmColor: '#e00',
						success: async result => {
							if (result.confirm) {
								this.setData({ loading: true })
								try {
									const reuslt = await Store.toggleStatus({
										id,
										status,
									})
									const list = this.data.list.filter(item => item.id != id)
									this.setData({ list })
									app.utils.toastText('已拒绝')
									this.setData({ loading: false })
								} catch (e) {
									app.utils.toastText('操作失败')
									this.setData({ loading: false })
								}
							}
						},
					})
				} else {
					this.setData({ loading: true })
					try {
						await Store.toggleStatus({
							id,
							status,
						})
						const list = this.data.list.slice().map(item => {
							if (item.id == id) {
								item.status = 2
							}
							return item
						})
						this.setData({ list })
						app.utils.toastText('审核通过', 'success')
						this.setData({ loading: false })
					} catch (e) {
						console.error(e)
						app.utils.toastText('操作失败')
						this.setData({ loading: false })
					}
				}
			},
		})
	},
	onReachBottom() {
		if (this.data.finished) {
			return
		}
		Store.getMyAgentList()
	},
	onPopupClose() {
		this.setData({ popupShow: false, popupHistoryShow: false })
	},
	handleShowHistory(e) {
		const item = e.currentTarget.dataset.item
		const memberInfo = this.data.memberInfo
		const prole = memberInfo.prole
		const popupHistoryDetail = Object.assign({}, item, { prole })
		this.setData({ popupHistoryShow: true, popupHistoryDetail })
	},
})
