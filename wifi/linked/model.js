import { getLinkedWifi, logEveryLink, logValidLink } from '../../api/wifi'
import { lingquCoupon } from '../../api/merchant'

class Model {
	constructor() {}
	async getLinkedWifi(data) {
		const { data: wifi } = await getLinkedWifi(data)
		return wifi
	}
	async lingquCoupon(data) {
		const { data: result } = await lingquCoupon(data)
		return result
	}
	async logEveryLink(data) {
		const { data: result } = await logEveryLink(data)
		return result
	}
	async logValidLink(data) {
		const { data: result } = await logValidLink(data)
		return result
	}
}

module.exports = Model
