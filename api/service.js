import request from '../utils/request'
const siteinfo = require('../siteinfo')

export function checkTextIsValid(content = '') {
	return new Promise((resolve, reject) => {
		return request
			.http('/service/checkTextIsValid', { content}, true, true)
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

export function checkImgIsValid(file, save = false) {
	return new Promise((resolve, reject) => {
		wx.uploadFile({
			url: siteinfo.baseUrl + `/service/checkImgIsValid?save=${Number(save)}`,
			name: 'file',
			filePath: file,
			header: {
				'content-type': 'multipart/form-data',
				'x-wid': siteinfo.wid,
				'x-openid': 'mini',
			},
			success: e => {
				const res = JSON.parse(e.data)
				if (res.status === 'success') {
					resolve(res)
				} else {
					reject(res)
				}
			},
			fail: e => {
				console.error('checkImgUploadIsValid ERROR:', e)
				reject(e)
			},
		})
	})
}
