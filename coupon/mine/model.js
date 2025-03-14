import {
	getMyCouponList,
	generateCheckedCode,
	toggleCouponlogStatus,
} from '../../api/coupon'

class Model {
	constructor() {}
	async getMyCouponList(data) {
		const { data: result } = await getMyCouponList(data)
		return result
	}
	async generateCheckedCode(data) {
		const { data: result } = await generateCheckedCode(data)
		return result
	}
	async toggleCouponlogStatus(data) {
		const { data: result } = await toggleCouponlogStatus(data)
		return result
	}
}

module.exports = Model
