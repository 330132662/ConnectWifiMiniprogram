const Store = require('./store')
const app = getApp()
const lpapi = require('./blue/LPAPI')
let num = 1
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
		const showBlue = this.data.showBlue
		if (!showBlue) {
			wx.openBluetoothAdapter({
				success: () => {
					this.setData({ showBlue: true })
				},
				fail: e => {
					if (e.errMsg === 'openBluetoothAdapter:fail already opened') {
						this.setData({ showBlue: true })
					}
				},
			})
		}
	},
	_connectBlue() {
		return new Promise((resolve, reject) => {
			if (!this.data.blueLink && lpapi) {
				wx.showLoading({
					title: '连接打印机',
					mask: true,
				})
				let timeoutId = setTimeout(() => {
					app.utils.toastText('打印机连接超时')
					wx.hideLoading()
				}, 12000)
				lpapi.openPrinter(
					'',
					() => {
						if (timeoutId) {
							clearTimeout(timeoutId)
							timeoutId = null
						}
						wx.hideLoading()
						this.setData({ blueLink: true })
						app.utils.toastText('连接成功', 'success')
						return resolve()
					},
					() => {
						if (timeoutId) {
							clearTimeout(timeoutId)
							timeoutId = null
						}
						wx.hideLoading()
						reject()
					}
				)
			} else if (this.data.blueLink && lpapi) {
				resolve()
			} else {
				reject()
			}
		})
	},
	_printCode({ code, uid }) {
		const width = 72
		const height = 110
		lpapi.startDrawLabel('print', this, width, height, 0)
		const codeWidth = 47
		lpapi.setItemHorizontalAlignment(1)
		lpapi.drawTextInWidth(uid, 0, 88, width, 3)

		lpapi.drawImageURL(
			code,
			(width - codeWidth) * 0.5,
			35,
			codeWidth,
			codeWidth,
			() => {
				lpapi.endDrawLabel(() => {
					lpapi.print(() => {
						this._printNextCode({ code, uid })
					})
				})
			},
			err => {
				console.error('ERROR: ', err)
			}
		)
	},
	_printNextCode({ code, uid }) {
		num--
		if (num <= 0) {
			this.setData({ printLoading: false })
			app.utils.toastText('打印成功', 'success')
		} else {
			this._printCode({ code, uid })
		}
	},
	// 蓝牙打印
	onStepChange({ detail }) {
		this.setData({ printNum: detail })
	},
	handleCancel() {
		this.setData({ printLoading: false, showDialog: false, dialogData: {} })
	},
	handleConfirmPrint(e) {
		const dialogData = this.data.dialogData
		this.setData({ printLoading: true, showDialog: false, dialogData: {} })
		num = this.data.printNum || 1
		this._printCode(dialogData)
	},
	handlePrint(e) {
		if (!this.data.showBlue) {
			return
		}
		if (this.data.printLoading) {
			lpapi.scanedPrinters(printList => {
				if (!printList || !printList.length) {
					this.setData({
						showBlue: false,
						blueLink: false,
						printLoading: false,
						dialogData: {},
					})
				}
			})
			return app.utils.toastText('正在打印，请稍后')
		}
		const item = e.currentTarget.dataset.item
		const custom = this.data.custom
		const active_qr_code = custom.active_qr_code == 1
		let code = item.mini_code
		if (active_qr_code) {
			code = item.qr_code
		}
		const uid = item.uid
		this._connectBlue()
			.then(() => {
				// success
				wx.hideLoading()
				wx.hideToast()
				this.setData({
					showDialog: true,
					dialogData: {
						code,
						uid,
					},
				})
			})
			.catch(() => {
				app.utils.modalText(
					'打印机连接失败，请检查打印机是否在身边或是否开启蓝牙。'
				)
			})
	},
	onReachBottom() {
		if (this.data.finished) {
			return
		}
		Store.getMyWifiList()
	},
	onInputChange({ detail }) {
		const content = detail.value
		Store.setItem('search', content)
	},
	onInputClear() {
		Store.setItem('search', '')
	},
	handleConfirmSearch() {
		if (this.data.loading) {
			return
		}
		Store.setItem('page', 1)
		Store.setItem('finished', false)
		Store.setItem('list', [])
		Store.setItem('total', 0)
		Store.getMyWifiList()
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
			content:
				'您可通过修改WiFi账号密码重复使用！但删除该WiFi码后会导致已经印刷的二维码失效，是否确定删除？',
			showCancel: true,
			cancelText: '取消',
			cancelColor: '#000',
			confirmText: '确定删除',
			confirmColor: '#999',
			success: async result => {
				if (result.confirm) {
					Store.deleteMyWifi(id)
				}
			},
		})
	},
	handleNewWifi() {
		wx.navigateTo({ url: '/wifi/edit/index' })
	},
	handleEditClick(e) {
		const uid = e.currentTarget.dataset.uid
		wx.navigateTo({ url: `/wifi/edit/index?uid=${uid}` })
	},
	handleManagerClick(e) {
		const hasSwiperCell = this.data.hasSwiperCell
		if (this.data.disabled || hasSwiperCell) {
			return
		}
		const uid = e.currentTarget.dataset.uid
		wx.navigateTo({
			url: `/wifi/manager/index?uid=${uid}`,
		})
	},
	onShareAppMessage({ from, target }) {
		const custom = this.data.custom
		if (from == 'button') {
			const item = target.dataset.item
			return {
				title: item.form_share_title || custom.share_title,
				path: `/wifi/linked/index?uid=${item.uid}`,
				imageUrl: item.form_share_icon || custom.share_icon,
			}
		} else {
			return {
				title: custom.share_title,
				path: '/pages/home/index',
				imageUrl: custom.share_icon,
			}
		}
	},
})
