const { Store } = require('../../libs/westore')
const Model = require('./model')
const UserStore = require('../../store/user')
const CustomStore = require('../../store/custom')
const { host } = require('../../siteinfo')
class ModelStore extends Store {
  constructor() {
    super()
    this.data = {
      host,
      customLoading: true,
      custom: null,
      userInfo: null,

      loading: true,
      currentColor: '#1890ff',
      wifi: {},
      current: 0,
      posterList: [],
      showPickerColor: false,

      showPopup: false,
      popupForm: {},
      showMiniPopup: false,
    }
    this.model = new Model()
  }
  async _init() {
    UserStore.subscribe(() => {
      this.data.userInfo = UserStore.data.userInfo
      this.update()
    })
    CustomStore.subscribe(() => {
      const custom = CustomStore.data.custom
      this.data.custom = custom
      this.data.customLoading = CustomStore.data.customLoading
      this.data.currentColor = custom.color || '#1890ff'
      this.update()
    })
  }
  async getWifiCode(data) {
    const wifi = await this.model.getWifiCode(data)
    this.data.wifi = wifi
    this.data.loading = false
    this.update()
  }
  async checkTextIsValid(content) {
    return await this.model.checkTextIsValid(content)
  }
  setItem(name, value) {
    const arr = name.split('.')
    if (arr && arr.length == 2) {
      this.data[arr[0]][arr[1]] = value
    } else {
      this.data[name] = value
    }
    this.update()
  }
}

module.exports = new ModelStore()
