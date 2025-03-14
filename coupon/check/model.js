import { checkedCouponlog } from '../../api/coupon'

class Model {
	constructor() {}
	async checkedCouponlog(data) {
		const { data: result } = await checkedCouponlog(data)
		return result
	}
}

module.exports = Model
