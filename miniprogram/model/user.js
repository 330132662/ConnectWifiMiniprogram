import { loginWithCode, updateUserInfo } from '../api/user'
import x from '../libs/x/index'
import multiavatar from '../libs/plugins/multiavatar'
import storage from '../utils/storage'

class Model {
	constructor() {
		this.userInfo = {}
	}
	async login() {
		const res = await x.login()
		const code = res.code
		const systemInfo = wx.getSystemInfoSync()
		const system = {
			设备型号: systemInfo.model,
			微信版本号: systemInfo.version,
			操作系统及版本: systemInfo.system,
			客户端平台: systemInfo.platform,
			客户端基础库版本: systemInfo.SDKVersion,
			定位开关: systemInfo.locationAuthorized ? '已打开' : '已关闭',
			WiFi开关: systemInfo.wifiEnabled ? '已打开' : '已关闭',
		}
		const { data } = await loginWithCode(code, system)
		this.userInfo = data
		data.key && storage.setItem('key', data.key)
		return data
	}
	async updateUserInfo(data) {
		const result = await updateUserInfo(data)
		return result
	}
}
module.exports = Model
