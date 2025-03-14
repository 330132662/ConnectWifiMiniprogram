import request from '../utils/request'

export function getMyAgentList(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/getMyAgentList', data)
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
export function toggleStatus(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/toggleStatus', data)
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

export function generateAgentOrder(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/generateAgentOrder', data)
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

export function applyAgent(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/applyAgent', data)
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

export function getDetail(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/getDetail', data)
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
export function updateMyAgentInfo(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/updateMyAgentInfo', data)
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
export function getAgentInfo(data) {
	return new Promise((resolve, reject) => {
		return request
			.post('/agent/getAgentInfo', data)
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
