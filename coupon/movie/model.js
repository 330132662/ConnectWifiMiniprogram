import { getActDetail } from '../../api/hui'

class Model {
	constructor() {}
	async getActDetail(data) {
		const { data: result } = await getActDetail(data)
		return result
	}
}

module.exports = Model
