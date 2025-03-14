import { getActList, getActDetail } from '../../api/hui'

class Model {
	constructor() {}
	async getActList(data) {
		const { data: result } = await getActList(data)
		return result
	}
	async getActDetail(data) {
		const { data: result } = await getActDetail(data)
		return result
	}
}

module.exports = Model
