import { getBindCode } from '../../api/merchant'

class Model {
	constructor() {}
	async getBindCode(data) {
		return await getBindCode(data)
	}
}

module.exports = Model
