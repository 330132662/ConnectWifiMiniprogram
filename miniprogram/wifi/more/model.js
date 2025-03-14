import { getNearbyWifi } from '../../api/wifi'

class Model {
	constructor() {}
	async getNearbyWifi(data) {
		const { data: list } = await getNearbyWifi(data)
		return list
	}
}

module.exports = Model
