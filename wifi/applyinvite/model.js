import { generateAgentOrder, applyAgent, getDetail } from '../../api/agent'

class Model {
	constructor() {}
	async generateAgentOrder(data) {
		const { data: result } = await generateAgentOrder(data)
		return result
	}
	async applyAgent(data) {
		const { data: result } = await applyAgent(data)
		return result
	}
	async getDetail(data) {
		const { data: result } = await getDetail(data)
		return result
	}
}

module.exports = Model
