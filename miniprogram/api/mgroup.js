import request from '../utils/request'

export function getGroupList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/mgroup/getGroupList', data)
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
