import { getCouponList, deleteCoupon } from '../../api/coupon'
import { checkImgIsValid } from '../../api/service'

class Model {
	constructor() {}
	async getCouponList(data) {
		const { data: result } = await getCouponList(data)
		return result
	}
	async deleteCoupon(data) {
		const { data: result } = await deleteCoupon(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
