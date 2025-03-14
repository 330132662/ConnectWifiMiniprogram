import { getCustomDetail } from '../api/custom'

class Model {
	constructor() {
		this.custom = {}
	}
	async getCustomDetail(data) {
		const custom = await getCustomDetail(data)
		this.custom = custom
		return custom
	}
}
module.exports = Model
