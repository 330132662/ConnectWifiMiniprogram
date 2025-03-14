const siteInfo = require('../siteinfo')

const fillPath = path => {
	const isHttp = /https?:\/\//.test(path)
	const isFlag = /^\/\//.test(path)
	if (isFlag) {
		return path
	}
	if (isHttp) {
		return path
	} else {
		const origin = /https?:\/\/[a-z0-9.]+\//.exec(siteInfo.siteroot)[0]
		return origin + path
	}
}
const cache = [
	'',
	' ',
	'  ',
	'   ',
	'    ',
	'     ',
	'      ',
	'       ',
	'        ',
	'         ',
]
const leftPad = (str, len, ch) => {
	str = str + ''
	len = len - str.length
	if (len <= 0) {
		return str
	}
	if (!ch && ch !== 0) {
		ch = ' '
	}
	ch = ch + ''
	if (ch === ' ' && len < 10) {
		return cache[len] + str
	}
	let pad = ''
	while ((len >>= 1)) {
		if (len & 1) {
			pad += ch
		}
		len >>= 1
		if (len) {
			ch += ch
		} else {
			break
		}
	}
	return pad + str
}
const toastText = (title, icon = 'none', duration = 1800) => {
	return new Promise((success, fail) => {
		wx.showToast({
			title: title,
			icon,
			duration,
			success,
			fail,
		})
	})
}
const modalText = (content, confirmText = '我知道了', options = {}) => {
	return new Promise((resolve, reject) => {
		if (typeof content !== 'string') {
			content = JSON.stringify(content)
		}
		wx.showModal({
			content,
			showCancel: false,
			confirmText,
			...options,
			success: result => {
				resolve(result)
			},
			fail: e => {
				reject(e)
			},
		})
	})
}
const alwaysBack = (
	timeout = 0,
	type = 'reLaunch',
	url = '/pages/home/index'
) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			wx.navigateBack({
				delta: 1,
				success: resolve,
				fail: e => {
					wx[type]({
						url,
					})
					reject(e)
				},
			})
		}, timeout)
	})
}
const showLoading = (title, mask = true) => {
	return new Promise((success, fail) => {
		wx.showLoading({
			title,
			mask,
			success,
			fail,
		})
	})
}
const hideLoading = () => {
	return wx.hideLoading()
}

const utils = {
	fillPath,
	leftPad,
	toastText,
	modalText,
	alwaysBack,
	showLoading,
	hideLoading,
}

module.exports = utils
