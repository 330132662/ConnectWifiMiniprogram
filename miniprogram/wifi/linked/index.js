const storage = require('../../utils/storage')
const Store = require('./store')
const app = getApp()

let timeoutId = null
let videoAd = null
let videoError = false
let adCurrentType = 'wifi'
let wifiTimeoutId = null
let validLinkTimeoutId = null
Page({
	data: Store.data,
	async onLoad(options) {
		const uid = options.uid || options.scene
		if (!uid) {
			app.utils
				.modalText(
					'缺少WiFi码参数，无法正确获取WiFi码信息，请检查您的WiFi码是否过期或已被删除'
				)
				.then(() => {
					app.utils.alwaysBack()
				})
		}
		validLinkTimeoutId = null
		Store.bind(this)
		Store._init(null, async () => {
			const ad = this.data.custom.form_ad
			if (ad.ad_jili_active && ad.ad_jili && wx.createRewardedVideoAd) {
				videoAd = wx.createRewardedVideoAd({
					adUnitId: ad.ad_jili,
				})
				videoAd.onLoad(() => {
					videoError = false
				})
				videoAd.onError(err => {
					videoError = true
					app.utils.toastText('激励视频广告加载失败')
				})
				videoAd.onClose(res => {
					if (res && res.isEnded) {
						if (adCurrentType === 'coupon') {
							this._lingquCoupon()
						} else if (adCurrentType == 'wifi') {
							this._connectWifi()
						}
					} else {
						if (this.data.hasAdMust) {
							if (adCurrentType == 'coupon') {
								wx.showModal({
									content:
										'领取优惠券前必须认真看完广告哦，否则无法正常领取优惠券。',
									showCancel: true,
									cancelText: '不要券',
									cancelColor: '#bbb',
									confirmText: '继续看',
									confirmColor: '#222',
									success: result => {
										if (result.confirm) {
											videoAd.show()
										}
									},
									complete: () => {
										this.lingquLoading = false
									},
								})
							} else if (adCurrentType == 'wifi') {
								wx.showModal({
									content:
										'连接WiFi前必须认真看完广告哦，否则无法正常连接WiFi。',
									showCancel: true,
									cancelText: '暂时不连',
									cancelColor: '#bbb',
									confirmText: '连接WiFi',
									confirmColor: '#222',
									success: result => {
										if (result.confirm) {
											videoAd.show()
										}
									},
								})
							}
						} else if (this.data.hasAd) {
							if (adCurrentType == 'coupon') {
								wx.showModal({
									content:
										'广告太长时间了，选择继续观看广告，然后再领取领取优惠券，还是直接领取优惠券呢？',
									showCancel: true,
									cancelText: '直接领',
									cancelColor: '#bbb',
									confirmText: '继续看',
									confirmColor: '#222',
									success: result => {
										if (result.confirm) {
											videoAd.show()
										} else {
											this._lingquCoupon()
										}
									},
									complete: () => {
										this.lingquLoading = false
									},
								})
							} else if (adCurrentType == 'wifi') {
								wx.showModal({
									content:
										'看完广告后再连WiFi会有意想不到的惊喜哦，是否继续看完广告后再连WiFi？',
									showCancel: true,
									cancelText: '不要惊喜',
									cancelColor: '#bbb',
									confirmText: '连接WiFi',
									confirmColor: '#222',
									success: result => {
										if (result.confirm) {
											videoAd.show()
										} else {
											this._connectWifi()
										}
									},
								})
							}
						}
					}
				})
			}
			if (uid) {
				try {
					const wifi = await Store.getLinkedWifi({ uid })
					wx.setNavigationBarTitle({
						title: wifi.ssid || '',
					})
					this._cuttoffWifiContent()
					// 设置wifi连接回调
					this._wifiCallBack()
					let formBeforeList = wifi.form_before_type
					if (formBeforeList) {
						formBeforeList = formBeforeList.split(',')
					} else {
						formBeforeList = []
					}
					const hasAdMust = formBeforeList.indexOf('admust') > -1
					const hasAd = formBeforeList.indexOf('ad') > -1
					const hasMobile = formBeforeList.indexOf('mobile') > -1
					const hasInfo = formBeforeList.indexOf('info') > -1

					Store.setItem('hasAdMust', hasAdMust)
					Store.setItem('hasAd', hasAd)
					Store.setItem('hasMobile', hasMobile)
					Store.setItem('hasInfo', hasInfo)
					Store.setItem('loading', false)
				} catch (e) {
					console.error(e)
					app.utils.modalText(e.msg || '服务器出错').then(() => {
						if (e.data == 1001) {
							wx.redirectTo({
								url: '/wifi/edit/index?uid=' + uid,
							})
						} else {
							app.utils.alwaysBack()
						}
					})
				}
			}
		})
	},
	// wifi截流
	_cuttoffWifiContent() {
		const custom = this.data.custom
		const wifi = this.data.wifi || {}
		if (wifi.dam_content) {
			wx.setClipboardData({
				data: wifi.dam_content,
				complete: () => {
					wx.hideToast()
				},
			})
		} else if (custom.dam_content) {
			wx.setClipboardData({
				data: custom.dam_content,
				complete: () => {
					wx.hideToast()
				},
			})
		}
	},
	_wifiCallBack() {
		wx.onWifiConnected(connectedWifi => {
			if (wifiTimeoutId) {
				clearTimeout(wifiTimeoutId)
				wifiTimeoutId = null
			}
			const wifi = this.data.wifi
			if (connectedWifi && connectedWifi.wifi) {
				if (connectedWifi.wifi.SSID && connectedWifi.wifi.SSID === wifi.ssid) {
					this.onConnectedSuccess()
				}
			}
		})
	},
	showLoading(title = '', mask = true, timeout = 500) {
		Store.setItem('disabled', true)
		timeoutId = setTimeout(() => {
			if (title) {
				wx.showLoading({ title, mask })
			} else {
				wx.showLoading({ mask })
			}
		}, timeout)
	},
	hideLoading() {
		Store.setItem('disabled', false)
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
		wx.hideLoading()
	},
	handle2Locate(e) {
		const data = e.currentTarget.dataset.item
		if (data.longitude && data.latitude) {
			wx.openLocation({
				latitude: Number(data.latitude),
				longitude: Number(data.longitude),
				scale: 20,
				fail: () => {
					app.utils.toastText('坐标设置错误')
				},
			})
		} else {
			app.utils.toastText('商家未设置坐标导航')
		}
	},
	handleBannerItemClick(e) {
		const item = e.currentTarget.dataset.item
		switch (item.type) {
			case 'h5':
				if (item.url) {
					wx.navigateTo({
						url: `/pages/webview/index?src=${item.url}`,
					})
				}
				break
			case 'mini':
				wx.navigateToMiniProgram({
					appId: item.appid,
					path: decodeURIComponent(item.url),
					fail: res => {
						const msg = res.errMsg
						if (msg === 'navigateToMiniProgram:fail invalid appid') {
							app.utils.modalText('跳转失败，可能是小程序路径或appid填写错误')
						} else if (
							msg === "navigateToMiniProgram:fail can't navigate to myself"
						) {
							wx.reLaunch({
								url: decodeURIComponent(item.url),
							})
						}
					},
				})
				break
			default:
				break
		}
	},
	// 菜单点击
	handleItemClick(e) {
		const item = e.currentTarget.dataset.item
		switch (item.type) {
			case 'h5':
				if (item.url) {
					wx.navigateTo({
						url: `/pages/webview/index?src=${item.url}`,
					})
				} else {
					app.utils.modalText('未设置内容')
				}
				break
			case 'image':
				if (item.content) {
					wx.previewImage({
						current: item.content,
						urls: [item.content],
					})
				} else {
					app.utils.modalText('未设置内容')
				}
				break
			case 'text':
				if (item.content) {
					wx.showModal({
						content: item.content,
						showCancel: false,
						confirmText: item.confirm_text || '我知道了',
					})
				} else {
					app.utils.toastText('未设置内容')
				}
				break
			case 'mini':
				if (!item.appid) {
					wx.navigateTo({
						url: item.url,
					})
					return
				}
				wx.navigateToMiniProgram({
					appId: item.appid,
					path: decodeURIComponent(item.url),
					fail: res => {
						const msg = res.errMsg
						if (msg === 'navigateToMiniProgram:fail invalid appid') {
							app.utils.modalText('跳转失败，可能是小程序路径或appid填写错误')
						} else if (
							msg === "navigateToMiniProgram:fail can't navigate to myself"
						) {
							wx.reLaunch({
								url: decodeURIComponent(item.url),
							})
						}
					},
				})
				break
			case 'video':
				wx.previewMedia({
					sources: [{ type: 'video', url: item.content }],
				})
				break
			default:
				break
		}
	},
	_couponBefore() {
		return new Promise((resolve, reject) => {
			if (this.data.hasAdMust || this.data.hasAd) {
				if (videoError) {
					resolve()
				}
				if (videoAd) {
					videoAd
						.show()
						.then(() => reject)
						.catch(() => {
							videoAd
								.load()
								.then(() => {
									videoAd.show()
									reject()
								})
								.catch(err => {
									console.error(err)
									videoError = true
									resolve()
								})
						})
				} else {
					resolve()
				}
			} else {
				resolve()
			}
		})
	},
	async _lingquCoupon() {
		this.showLoading('正在领取')
		const coupon = this.coupon
		try {
			const userInfo = this.data.userInfo
			const openid = userInfo.openid
			await Store.lingquCoupon({ id: coupon.id, openid })
			let list = this.data.wifi.list_coupon
			list = list.map(item => {
				if (item.id == coupon.id) {
					item.total = +item.total + 1
					item.disabled = true
				}
				return item
			})
			Store.setItem('wifi.list_coupon', list)
			this.hideLoading()
			app.utils.toastText('已领取', 'success')
			this.lingquLoading = false
			this.coupon = null
		} catch (e) {
			if (e.data == 699) {
				let list = this.data.wifi.list_coupon
				list = list.map(item => {
					if (item.id == coupon.id) {
						item.disabled = true
						item.forbid = true
					}
					return item
				})
				Store.setItem('wifi.list_coupon', list)
			}
			this.lingquLoading = false
			this.hideLoading()
		}
	},
	// 拨打电话
	handle2Contact() {
		const wifi = this.data.wifi
		if (wifi.contact) {
			wx.makePhoneCall({ phoneNumber: wifi.contact })
		}
	},
	// 领取优惠券
	handleLingqu(e) {
		const coupon = e.currentTarget.dataset.coupon
		if (coupon.disabled) {
			return
		}
		this.coupon = coupon
		adCurrentType = 'coupon'
		if (this.lingquLoading) {
			return app.utils.toastText('正在领取...')
		}
		this.lingquLoading = true
		this._couponBefore()
			.then(() => {
				this._lingquCoupon()
			})
			.catch(() => {
				this.lingquLoading = false
			})
	},
	handle2Coupon() {
		const mid = this.data.wifi.mid
		wx.navigateTo({
			url: `/coupon/mine/index?mid=${mid}`,
		})
	},
	handleCopyPassword() {
		const wifi = this.data.wifi
		if (!wifi.password) {
			return app.utils.modalText(
				`该【WiFi：${wifi.ssid}】无需密码，请打开手机系统->无线网络设置列表，直接手动连接`
			)
		} else {
			wx.setClipboardData({
				data: wifi.password,
				complete: () => {
					app.utils.toastText('已复制WiFi密码')
				},
			})
		}
	},
	_beforeConnect() {
		return new Promise((resolve, reject) => {
			if (this.data.hasAdMust || this.data.hasAd) {
				if (videoError) {
					resolve()
				}
				if (videoAd) {
					videoAd
						.show()
						.then(() => reject)
						.catch(() => {
							videoAd
								.load()
								.then(() => {
									videoAd.show()
									reject()
								})
								.catch(err => {
									console.error(err)
									videoError = true
									resolve()
								})
						})
				} else {
					resolve()
				}
			} else {
				resolve()
			}
		})
	},
	_connectWifi() {
		const platform = storage.getItem('platform')
		const wifi = this.data.wifi
		if (wifi.wifi_status == 0) {
			return this.onConnectedFail(
				'当前WiFi已被冻结，连接失败，请联系管理员开启WiFi。'
			)
		} else if (wifi.wifi_status == 1) {
			Store.setItem('linkStatus', 2)
			wx.connectWifi({
				ssid: wifi.ssid,
				SSID: wifi.ssid,
				password: wifi.password,
				success: res => {
					const { errMsg, wifiMsg, errCode, errno } = res
					if (platform === 'ios') {
						if (/connectWifi:ok/gi.test(errMsg)) {
							if (/target wifi is already connected/gi.test(wifiMsg)) {
								return this.onConnectedSuccess()
							} else {
								return (wifiTimeoutId = setTimeout(() => {
									this.onConnectedFail(
										'WiFi连接超时，请检查是否是WiFi账号密码错误或是WiFi信号不好。'
									)
								}, 12000))
							}
						}
					} else {
						if (/connectWifi:ok/gi.test(errMsg)) {
							if (errCode == 0 || errno == 0) {
								return this.onConnectedSuccess()
							}
						}
					}
				},
				fail: e => {
					switch (e.errCode) {
						case 12007:
							Store.setItem('linkStatus', 0)
							break
						case 12001:
							return this.onConnectedFail(
								`您当前的系统不支持自动连WiFi能力，请手动连接WiFi: 【${this.data.wifi.ssid}】，点击下方按钮复制密码后立刻连WiFi。`,
								'copy',
								'复制密码',
								this.data.wifi.password
							)
						case 12002:
							return this.onConnectedFail(
								`WiFi密码错误，请联系管理员重新配置WiFi密码`
							)
						case 12003:
							return this.onConnectedFail(
								`WiFi连接超时，请检查是否网络出现了问题或WiFi信号太弱`
							)
						case 12004:
							return this.onConnectedFail(`WiFi已连接，请不要重复连接WiFi`)
						case 12005:
							return this.onConnectedFail(
								`受系统能力限制，请您手动打开【WiFi】开关后再重新连接。`
							)
						case 12006:
							return this.onConnectedFail(
								`受系统能力限制，请您手动打开【GPS定位】开关后再重新连接。`
							)
						case 12008:
							return this.onConnectedFail(
								`无效的WiFi账号，请检查WiFi账号是否存在多个特殊字符。`
							)
						case 12009:
							return this.onConnectedFail(
								`受系统能力限制，运营商配置拒绝一键连接WiFi。`
							)
						case 12011:
							return this.onConnectedFail(`应用在后台无法配置 Wi-Fi`)
						case 12013:
							return this.onConnectedFail(
								`系统保存的 Wi-Fi 配置过期，建议忘记 Wi-Fi 后重试`
							)
						case 12014:
							return this.onConnectedFail(`无效的 WEP / WPA 密码`)

						default:
							console.error(e)
							return this.onConnectedFail(
								`您当前手机系统保存的 Wi-Fi 配置过期了，您可以打开手机系统设置->无线网络设置，尝试点击移除或忘记【WiFi】后再重新扫码连接`
							)
					}
				},
			})
		}
	},
	_afterConnect() {
		const wifi = this.data.wifi
		if (wifi.form_after_type == 'none') {
			return
		}
		switch (wifi.form_after_type) {
			case 'text':
				if (wifi.form_after_content) {
					app.utils.modalText(wifi.form_after_content)
				}
				break
			case 'image':
				if (wifi.form_after_content) {
					wx.previewImage({
						current: wifi.form_after_content,
						urls: [wifi.form_after_content],
					})
				}
				break
			case 'mini':
				app.utils
					.modalText('即将跳转小程序，是否继续？', '立即跳转')
					.then(() => {
						wx.navigateToMiniProgram({
							appId: wifi.form_after_appid,
							path: decodeURIComponent(wifi.form_after_content),
							fail: res => {
								const msg = res.errMsg
								if (msg === 'navigateToMiniProgram:fail invalid appid') {
									app.utils.modalText(
										'跳转失败，可能是小程序路径或appid填写错误'
									)
								} else if (
									msg === "navigateToMiniProgram:fail can't navigate to myself"
								) {
									wx.reLaunch({
										url: decodeURIComponent(wifi.form_after_content),
									})
								} else {
									console.error('ERROR: ', res)
									app.utils.toastText(JSON.stringify(msg || '跳转失败'))
								}
							},
						})
					})
				break
			case 'h5':
				if (wifi.form_after_content) {
					wx.navigateTo({
						url: `/pages/webview/index?src=${wifi.form_after_content}`,
					})
				} else {
					app.utils.modalText('未设置跳转内容，操作失败')
				}
				break
			default:
				break
		}
	},
	onConnectedFail(
		errMsg = 'WiFi连接失败，请检查是否是账号密码错误。',
		btnType = 'back',
		btnText = '确定',
		copy = ''
	) {
		Store.setItem('linkStatus', 3)
		wx.navigateTo({
			url: `/wifi/tip/index?tipText=${errMsg}&btnType=${btnType}&btnText=${btnText}&copy=${copy}`,
		})
	},
	onConnectedSuccess() {
		if (validLinkTimeoutId) {
			return
		}
		wx.getLocalIPAddress({
			success: ({ localip }) => {
				Store.setItem('wifi.localip', localip)
			},
		})
		Store.setItem('linkStatus', 1)
		app.utils.toastText('连接成功', 'success')
		// 缓冲 localip
		validLinkTimeoutId = setTimeout(async () => {
			await this.handleEveryLink()
			await this.handleValidLink()
		}, 2000)
		setTimeout(() => {
			this._afterConnect()
		}, 1500)
	},
	async handleEveryLink() {
		const wifi = this.data.wifi
		const postData = {
			merchant_id: wifi.mid,
			wifi_uid: wifi.uid,
			wifi_form_title: wifi.form_title,
			ssid: wifi.ssid,
			password: wifi.password,
			localip: wifi.localip || '未知IP',
		}
		const logId = await Store.logEveryLink(postData)
		this.logId = logId
		return logId
	},
	async handleValidLink() {
		const log_id = this.logId
		const uid = this.data.wifi.uid
		return await Store.logValidLink({ log_id, uid })
	},
	handleConnectWifi() {
		// 测试
		// this.onConnectedSuccess()
		// return
		if (this.data.linkStatus == 2) {
			return
		}
		adCurrentType = 'wifi'
		this._beforeConnect().then(() => {
			// 正常连接WiFi
			this._connectWifi()
		})
	},
	handleMoreWifi() {
		const wifi = this.data.wifi
		const mid = wifi.mid || ''
		wx.navigateTo({
			url: `/wifi/more/index?mid=${mid}&title=${wifi.name}的WiFi列表`,
		})
	},
	onShareAppMessage({ from, target }) {
		const custom = this.data.custom
		const wifi = this.data.wifi
		if (from == 'button') {
			return {
				title: wifi.form_share_title || custom.share_title,
				path: `/wifi/linked/index?uid=${wifi.uid}`,
				imageUrl: wifi.form_share_icon || custom.share_icon,
			}
		} else {
			return {
				title: wifi.form_share_title || custom.share_title,
				path: `/wifi/linked/index?uid=${wifi.uid}`,
				imageUrl: wifi.form_share_icon || custom.share_icon,
			}
		}
	},
})
