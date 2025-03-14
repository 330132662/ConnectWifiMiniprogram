const Store = require('./store')
const app = getApp()

let timeoutId = null
Page({
	data: Store.data,
	async onLoad(options) {
		Store.bind(this)
		Store._init(() => {
			if (!this.data.form || !this.data.form.id) {
				return app.utils.alwaysBack()
			}
		})
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
	onGenderChange({ detail }) {
		Store.setItem('form.gender', detail)
	},
	onInputChange(e) {
		const name = e.currentTarget.dataset.name
		const value = e.detail.value
		Store.setItem(`form.${name}`, value)
	},
	onClearClick(e) {
		const name = e.currentTarget.dataset.name
		Store.setItem(`form.${name}`, '')
	},
	handleUpload(e) {
		if (this.data.loading) {
			return
		}
		const name = e.currentTarget.dataset.name
		wx.chooseImage({
			count: 1,
			success: async res => {
				const tempFilePaths = res.tempFilePaths
				if (tempFilePaths && tempFilePaths.length) {
					this.showLoading('图片检测中')
					try {
						const url = await Store.checkImgIsValid(tempFilePaths[0], true)
						if (url) {
							Store.setItem(`form.${name}`, url)
						}
						this.hideLoading()
					} catch (e) {
						console.error('ERROR: ', e)
						this.hideLoading()
						app.utils.toastText(e.msg || e.message || '图片上传失败')
					}
				}
			},
			fail: e => {
				console.error('fail', e)
			},
		})
	},
	handlePreviewImage(e) {
		const current = e.currentTarget.dataset.url
		wx.previewImage({
			current,
			urls: [current],
		})
	},
	handleDeleteImage(e) {
		const name = e.currentTarget.dataset.name
		wx.showModal({
			content: '是否删除该图片？',
			showCancel: true,
			cancelText: '取消',
			cancelColor: '#111',
			confirmText: '确定',
			confirmColor: '#aaa',
			success: result => {
				if (result.confirm) {
					Store.setItem(`form.${name}`, '')
				}
			},
		})
	},
	async handleConfirm() {
		if (this.data.loading) {
			return
		}
		const postData = Object.assign({}, this.data.form)
		this.showLoading()
		try {
			await Store.updateMyAgentInfo(postData)
			this.hideLoading()
			app.utils.toastText('保存成功', 'success').then(() => {
				app.utils.alwaysBack(500)
			})
		} catch (e) {
			console.error(e)
			this.hideLoading()
		}
	},
})
