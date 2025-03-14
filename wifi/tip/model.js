import { checkImgIsValid } from '../../api/service'

class Model {
	constructor() {}

	async checkImgIsValid(file, save = false) {
		const { data: result } = await checkImgIsValid(file, save)
		return result
	}
}

module.exports = Model
