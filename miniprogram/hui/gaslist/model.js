import { getGasList } from '../../api/hui'

class Model {
	constructor() {}
	async getGasList(data) {
		const { data: result } = await getGasList(data)
		return result
	}
}

module.exports = Model
