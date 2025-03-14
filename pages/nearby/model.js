import { getGroupList } from '../../api/mgroup'
import { getNearbyMerchant } from '../../api/merchant'

class Model {
	constructor() {}
	async getGroupList(data) {
		const { data: result } = await getGroupList(data)
		return result
	}
	async getNearbyMerchant(data) {
		const { data: list } = await getNearbyMerchant(data)
		return list
	}
}

module.exports = Model
