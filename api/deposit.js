import request from '../utils/request'

export function generateDeposit(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/deposit/generateDeposit', data)
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
export function getDepositList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/deposit/getDepositList', data)
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
