import { checkImgIsValid } from '../../api/service'
import { getMerchantDetail, saveMyMerchant } from '../../api/merchant'

class Model {
	constructor() {
		this.merchant = null
	}
	async getMerchantDetail(data) {
		const { data: merchant } = await getMerchantDetail(data)
		this.merchant = merchant
		return merchant
	}
	async saveMyMerchant(data) {
		const result = await saveMyMerchant(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
