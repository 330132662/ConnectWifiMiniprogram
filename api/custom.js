import request from '../utils/request'

export function getCustomDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/custom/getDetail', data)
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
