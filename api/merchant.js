import request from '../utils/request'

export function getTotal(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getTotal', data)
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
export function getMerchantDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getMerchantDetail', data)
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
export function saveMyMerchant(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/saveMyMerchant', data)
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
export function getMyMerchantList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getMyMerchantList', data)
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
export function deleteMyMerchant(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/deleteMyMerchant', data)
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
export function getBindCode(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getBindCode', data)
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

export function getMerchantBanner(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getMerchantBanner', data)
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

export function updateMerchantBanner(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/updateMerchantBanner', data)
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

export function getNearbyMerchant(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/getNearbyMerchant', data)
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

export function lingquCoupon(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/merchant/lingquCoupon', data)
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
