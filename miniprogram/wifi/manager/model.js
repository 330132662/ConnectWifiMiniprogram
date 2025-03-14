import { getWifiCode } from '../../api/wifi'
import { checkTextIsValid } from '../../api/service'

class Model {
  constructor() {
    this.wifi = null
  }
  async getWifiCode(data) {
    const { data: wifi } = await getWifiCode(data)
    this.wifi = wifi
    return wifi
  }
  async checkTextIsValid(content) {
    const { data: result } = await checkTextIsValid(content)
    return result
  }
}

module.exports = Model
