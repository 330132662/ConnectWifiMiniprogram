import { getWifiCode, saveWifiCode } from '../../api/wifi'
import { checkImgIsValid } from '../../api/service'

class Model {
	constructor() {
		this.wifi = null
	}
	async getWifiCode(data) {
		const { data: wifi } = await getWifiCode(data)
		this.wifi = wifi
		return wifi
	}
	async saveWifiCode(data) {
		const { data: result } = await saveWifiCode(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
