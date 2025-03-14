import { checkImgIsValid } from '../../api/service'
import { getDepositList } from '../../api/deposit'

class Model {
	constructor() {
		this.wifi = null
	}

	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
	async getDepositList(data) {
		const { data: result } = await getDepositList(data)
		return result
	}
}

module.exports = Model
