import { checkImgIsValid } from '../../api/service'
import { getMerchantBanner, updateMerchantBanner } from '../../api/merchant'

class Model {
	constructor() {}
	async updateMerchantBanner(data) {
		const { data: result } = await updateMerchantBanner(data)
		return result
	}
	async getMerchantBanner(data) {
		const { data: merchant } = await getMerchantBanner(data)
		return merchant
	}

	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
