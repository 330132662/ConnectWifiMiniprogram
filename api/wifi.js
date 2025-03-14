import request from '../utils/request'

export function saveWifiCode(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/saveWifiCode', data)
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
export function getWifiCode(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/getWifiCode', data)
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
export function getMyWifiList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/getMyWifiList', data)
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
export function getNearbyWifi(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/getNearbyWifi', data)
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
export function deleteMyWifi(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/deleteMyWifi', data)
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
export function updateMyRelation(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/updateMyRelation', data)
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

export function getLinkedWifi(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/getLinkedWifi', data)
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
export function logEveryLink(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/logEveryLink', data)
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

export function logValidLink(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/logValidLink', data)
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
export function clearMerchantRelated(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/wifi/clearMerchantRelated', data)
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
