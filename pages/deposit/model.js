import { checkImgIsValid } from '../../api/service'
import { generateDeposit } from '../../api/deposit'
import { getAgentInfo } from '../../api/agent'

class Model {
	constructor() {
		this.wifi = null
	}
	async generateDeposit(data) {
		const { data: result } = await generateDeposit(data)
		return result
	}
	async getAgentInfo(data) {
		const { data: result } = await getAgentInfo(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
