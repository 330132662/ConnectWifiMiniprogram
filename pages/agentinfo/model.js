import { checkImgIsValid } from '../../api/service'
import { updateMyAgentInfo } from '../../api/agent'
class Model {
	constructor() {
		this.wifi = null
	}
	async updateMyAgentInfo(data) {
		const { data: result } = await updateMyAgentInfo(data)
		return result
	}
	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
