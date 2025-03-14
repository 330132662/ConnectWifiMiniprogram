import { getTotal, getMerchantDetail } from '../../api/merchant'
import { checkImgIsValid } from '../../api/service'
import {
	updateMyRelation,
	getWifiCode,
	clearMerchantRelated,
} from '../../api/wifi'

class Model {
	constructor() {
		this.wifi = null
	}
	async clearMerchantRelated(data) {
		const { data: result } = await clearMerchantRelated(data)
		return result
	}
	async getTotal(data) {
		const { data: result } = await getTotal(data)
		return result
	}
	async getMerchantDetail(data) {
		const { data: result } = await getMerchantDetail(data)
		return result
	}
	async getWifiCode(data) {
		const { data: result } = await getWifiCode(data)
		return result
	}
	async updateMyRelation(data) {
		const { data: result } = await updateMyRelation(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
