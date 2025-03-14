const PREFIX = 'yx_'
module.exports = {
	setItem(key, data) {
		try {
			wx.setStorageSync(PREFIX + key, data)
		} catch (e) {
			wx.setStorage({
				key: PREFIX + key,
				data,
			})
		}
	},
	getItem(key, defaultValue = null) {
		return wx.getStorageSync(PREFIX + key) || defaultValue
	},
	clear(key) {
		if (key) {
			try {
				return wx.removeStorageSync(PREFIX + key)
			} catch (e) {
				console.error('removeStorage ERROR: ', e)
				wx.removeStorage({
					key: PREFIX + key,
				})
			}
		}
	},
}
