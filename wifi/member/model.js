import { getMyAgentList, toggleStatus } from '../../api/agent'
import { checkImgIsValid } from '../../api/service'

class Model {
	constructor() {
		this.wifi = null
	}
	async getMyAgentList(data) {
		const { data: result } = await getMyAgentList(data)
		return result
	}
	async toggleStatus(data) {
		return await toggleStatus(data)
	}
}

module.exports = Model
