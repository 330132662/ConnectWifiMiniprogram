import { getMyMerchantList, deleteMyMerchant } from '../../api/merchant'

class Model {
	constructor() {
		this.list = []
		this.total = 0
	}
	async getMyMerchantList(data) {
		const { data: result } = await getMyMerchantList(data)
		const { list, total } = result
		this.list = list
		this.total = total
		return result
	}
	async deleteMyMerchant(data) {
		const { data: result } = await deleteMyMerchant(data)
		return result
	}
}

module.exports = Model
