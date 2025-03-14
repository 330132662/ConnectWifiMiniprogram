import { getMyWifiList, deleteMyWifi } from '../../api/wifi'

class Model {
	constructor() {
		this.list = []
		this.total = 0
	}
	async getMyWifiList(data) {
		const { data: result } = await getMyWifiList(data)
		const { list, total } = result
		this.list = list
		this.total = total
		return result
	}
	async deleteMyWifi(data) {
		const { data: result } = await deleteMyWifi(data)
		return result
	}
}

module.exports = Model
