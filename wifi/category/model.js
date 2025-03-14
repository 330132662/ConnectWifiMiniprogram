import { getNearbyMerchant } from '../../api/merchant'

class Model {
	constructor() {}
	async getNearbyMerchant(data) {
		const { data: list } = await getNearbyMerchant(data)
		return list
	}
}

module.exports = Model
