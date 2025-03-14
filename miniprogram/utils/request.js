import showLoading from './components/loading'
import utils from './index.js'
import siteInfo from '../siteinfo'
const UserStore = require('../store/user')

class Api {
	constructor(baseURL) {
		this.baseURL = baseURL
	}
	http(path, data, hasLoading = false, showAlert = false) {
		return new Promise((resolve, reject) => {
			this.ajax({ path, data, hasLoading, showAlert })
				.then(resolve)
				.catch(e => {
					reject(e)
				})
		})
	}
	ajax({
		path,
		data,
		header = {},
		method,
		dataType,
		hasLoading = false,
		showAlert = false,
	}) {
		return new Promise((resolve, reject) => {
			let loading = null
			if (hasLoading) {
				loading = showLoading()
			}
			wx.request({
				url: this.baseURL + path,
				data: data || {},
				header: Object.assign(
					{},
					{
						'content-type': 'application/json',
					},
					header,
					{
						'x-wid': siteInfo.wid,
						'x-openid': 'mini',
					}
				),
				method: method || 'POST',
				dataType: dataType || 'json',
				success: res => {
					hasLoading ? loading && loading() : null
					if (res.statusCode === 200) {
						if (res.data && res.data.status == 'success') {
							resolve(res.data)
						} else {
                            console.log("异常",res);  
							showAlert && utils.modalText(res.data.msg || '未知错误')
							reject(res.data)
						}
					} else {
						reject(res)
						showAlert && utils.modalText('服务器出错啦 ~')
					}
				},
				fail: err => {
					hasLoading ? loading && loading() : null
					console.error('REQUESR ERROR: ', err)
					showAlert &&
						utils.modalText(err.errMsg || '服务器出错啦 !').then(() => {
							wx.redirectTo({ url: '/pages/error/index' })
						})
					reject(err)
				},
			})
		})
	}

	publicMethods({
		path,
		data,
		method = 'GET',
		header = {},
		dataType = 'json',
		success,
		error,
	}) {
		data = Object.assign({}, data)
		wx.request({
			url: this.baseURL + path,
			data: data || {},
			header: Object.assign(
				{},
				{
					'content-type': 'application/json',
				},
				header,
				{
					'x-wid': siteInfo.wid,
					'x-openid': 'mini',
				}
			),
			method,
			dataType,
			success: res => {
				if (res.statusCode === 200) {
					if (res.data && res.data.status && res.data.status == 'success') {
						success(res.data)
					} else {
						error(res.data)
						if (res.data) {
							if (res.data.data !== 'noalert') {
								utils.modalText(res.data.msg || '服务器出错')
							}
						}
					}
				} else {
					error(res)
					utils.modalText('服务器出错啦 ~')
				}
			},
			fail: err => {
				error(err)
				console.error(new Error(err))
			},
		})
	}

	get(path, data, header) {
		return new Promise((resolve, reject) => {
			this.publicMethods({
				path,
				data,
				header,
				success: data => resolve(data),
				error: err => reject(err),
			})
		})
	}

	post(path, data, header) {
		return new Promise((resolve, reject) => {
			this.publicMethods({
				path,
				data,
				method: 'POST',
				header,
				success: res => resolve(res),
				error: err => reject(err),
			})
		})
	}
}

module.exports = new Api(siteInfo.baseUrl)
