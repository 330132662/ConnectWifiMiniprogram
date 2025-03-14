import request from '../utils/request'

export function loginWithCode(code, system = '') {
	return new Promise((resolve, reject) => {
		return request
			.http('/user/login', { code, system: JSON.stringify(system) }, true, true)
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
export function updateUserInfo(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/user/updateUserInfo', data)
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
export function decodeUserMobile(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/user/decodeUserMobile', data)
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
