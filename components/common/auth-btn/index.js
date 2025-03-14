import UserStore from '../../../store/user'
import CustomStore from '../../../store/custom'
import { updateUserInfo, decodeUserMobile } from '../../../api/user'
import storage from '../../../utils/storage'
import x from '../../../libs/x/index'

const app = getApp()
const getUserMobile = (encryptedData, iv) => {
	return new Promise((resolve, reject) => {
		x.checkSession()
			.then(() => {
				const openid = UserStore.data.userInfo.openid
				const session_key = storage.getItem('key')
				decodeUserMobile({
					openid,
					session_key,
					iv,
					encrypted: encryptedData,
				}).then(({ data }) => {
					UserStore.data.userInfo.mobile = data
					UserStore.update()
					resolve(data)
				})
			})
			.catch(e => {
				reject(e)
				UserStore.login().then(() => {
					const openid = UserStore.data.userInfo.openid
					const session_key = storage.getItem('key')
					decodeUserMobile({
						openid,
						session_key,
						iv,
						encrypted: encryptedData,
					})
						.then(data => {
							const { mobile } = data
							UserStore.data.userInfo.mobile = mobile
							UserStore.update()
							resolve(mobile)
						})
						.catch(reject)
				})
			})
	})
}
Component({
	options: {
		virtualHost: true,
	},
	externalClasses: ['x-class'],
	properties: {
		mobile: Boolean,
		authorized: {
			type: Boolean,
			value: false,
		},
		style: String,
		writePhotosAlbum: Boolean,
	},
	data: { userInfo: null, loading: false, custom: null, mobileError: false },
	attached() {
		UserStore.subscribe(() => {
			this.setData({ userInfo: UserStore.data.userInfo })
		})
		CustomStore.subscribe(() => {
			this.setData({ custom: CustomStore.data.custom })
		})
	},
	pageLifetimes: {
		show: function () {
			if (this.data.writePhotosAlbum) {
				this.checkSettingAuth('scope.writePhotosAlbum', false).then(() => {
					this.setData({ showSettingPopup: false })
				})
			}
		},
	},
	methods: {
		checkSettingAuth(scope, hasPopup = true) {
			return new Promise((resolve, reject) => {
				wx.getSetting({
					success: res => {
						if (res.authSetting[scope] === undefined) {
							if (hasPopup) {
								wx.authorize({
									scope,
									success: () => {
										resolve(true)
									},
									fail: () => {
										reject(false)
									},
								})
							} else {
								resolve(true)
							}
						} else if (res.authSetting[scope]) {
							resolve(true)
						} else {
							reject(false)
						}
					},
					fail: e => {
						console.log('fail: ', e)
						reject(false)
					},
				})
			})
		},
		handleCloseMask() {
			this.setData({ showSettingPopup: false })
		},
		showLoading() {
			this.setData({ loading: true })
			this.loading = true
		},
		hideLoading() {
			this.setData({ loading: false })
			this.loading = false
		},
		onGetPhoneNumber(e) {
			if (this.loading) {
				return
			}
			this.showLoading()
			const { errMsg, iv, encryptedData } = e.detail
			const userInfo = UserStore.data.userInfo
			if (errMsg === 'getPhoneNumber:ok') {
				getUserMobile(encryptedData, iv)
					.then(mobile => {
						UserStore.data.userInfo.mobile = mobile
						this.setData({ userInfo: UserStore.data.userInfo })
						UserStore.inform()
						this.hideLoading()
						if (userInfo.avatar && userInfo.nickname) {
							this.triggerEvent('click')
						}
					})
					.catch(e => {
						this.hideLoading()
						console.log('ERROR:', e)
						app.utils.modalText('暂无权限，获取手机号失败！')
					})
			} else if (errMsg === 'getPhoneNumber:fail user deny') {
				this.hideLoading()
				console.error('onGetPhoneNumber ERROR: ', e)
			} else {
				this.hideLoading()
				console.error('onGetPhoneNumber ERROR: ', e)
				app.setTempData('mobileError', true)
				this.setData({ mobileError: true })
				this.triggerEvent('mobileError')
				// app.utils.toastText('非企业认证的小程序没有获取手机号的权限哦 ~')
			}
		},
		handleClick() {
			if (this.loading) {
				return
			}
			const userInfo = UserStore.data.userInfo || {}
			if (this.data.writePhotosAlbum) {
				this.loading = true
				this.checkSettingAuth('scope.writePhotosAlbum')
					.then(() => {
						this.loading = false
						if (this.data.mobile && !userInfo.mobile) {
							return
						}
						this.triggerEvent('click')
					})
					.catch(e => {
						console.log('ERROR: ', e)
						this.loading = false
						this.setData({ showSettingPopup: true })
					})
				return
			}
			const mobileError = app.getTempData('mobileError', false)
			if (!mobileError && this.data.mobile && !userInfo.mobile) {
				return
			}
			this.triggerEvent('click')
		},
		_getUserInfo() {
			const userInfo = UserStore.data.userInfo
			const openid = userInfo.openid
			this.showLoading()
			// 获取用户信息
			wx.getUserProfile({
				lang: 'zh_CN',
				desc: '获取您的头像昵称信息仅用于注册',
				success: ({ userInfo: user }) => {
					const updateData = {
						nickname: user.nickName,
						avatar: user.avatarUrl,
						openid,
					}
					wx.showLoading()
					return updateUserInfo(updateData)
						.then(() => {
							UserStore.data.userInfo = Object.assign({}, userInfo, updateData)
							this.setData({ userInfo: UserStore.data.userInfo })
							UserStore.inform()
							this.hideLoading()
							wx.hideLoading()
							if (this.data.mobile && !userInfo.mobile) {
								return
							}
							this.triggerEvent('click', UserStore.data.userInfo)
						})
						.catch(e => {
							app.utils.modalText(e)
							this.hideLoading()
							wx.hideLoading()
						})
				},
				fail: res => {
					this.hideLoading()
				},
			})
		},
	},
})
