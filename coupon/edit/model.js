import {
	saveMerchantCouponDetail,
	getMerchantCouponDetail,
} from '../../api/coupon'
import { checkImgIsValid } from '../../api/service'

class Model {
	constructor() {
		this.coupon = null
	}
	async getMerchantCouponDetail(data) {
		const { data: coupon } = await getMerchantCouponDetail(data)
		this.coupon = coupon
		return coupon
	}
	async saveMerchantCouponDetail(data) {
		const { data: result } = await saveMerchantCouponDetail(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
