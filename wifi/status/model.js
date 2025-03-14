import { getWifiCode, saveWifiCode } from '../../api/wifi'

class Model {
	constructor() {
		this.wifi = null
	}
	async getWifiCode(data) {
		const { data: wifi } = await getWifiCode(data)
		this.wifi = wifi
		return wifi
	}
}

module.exports = Model
