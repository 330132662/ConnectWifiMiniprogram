import request from '../utils/request'

export function getMerchantCouponDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/getMerchantCouponDetail', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function saveMerchantCouponDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/saveMerchantCouponDetail', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function getCouponList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/getCouponList', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function deleteCoupon(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/deleteCoupon', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function getMyCouponList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/getMyCouponList', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function generateCheckedCode(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/generateCheckedCode', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
export function toggleCouponlogStatus(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/toggleCouponlogStatus', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}

export function checkedCouponlog(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/coupon/checkedCouponlog', data)
			.then(res => {
				const status = res.status
				if (status == 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			})
			.catch(reject)
	})
}
