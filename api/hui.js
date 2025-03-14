import request from '../utils/request'

export function getGasList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/hui/getGasList', data)
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
export function getActList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/hui/getActList', data)
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
export function getActDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/hui/getActDetail', data)
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
