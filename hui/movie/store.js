const { Store } = require("../../libs/westore");
const Model = require("./model");
const UserStore = require("../../store/user");
const CustomStore = require("../../store/custom");

class ModelStore extends Store {
  constructor() {
    super();
    this.data = {
      options: {
        pub_id: 43423,
        sid: "plugin",
        relation_flag_name: "yuanxiaokeji"
      },
      singlePage: false,
      customLoading: true,
      custom: null,
      userInfo: null,
      fullLoading: false
    };
    this.model = new Model();
  }
  async _init(userCb = () => {}, customCb = () => {}) {
    UserStore.subscribe(() => {
      this.data.userInfo = UserStore.data.userInfo;
      this.update();
      typeof userCb == "function" && userCb();
    });
    CustomStore.subscribe(() => {
      const options = this.data.options;
      const custom = CustomStore.data.custom;
      this.data.custom = custom;
      this.data.customLoading = CustomStore.data.customLoading;
      this.data.options = Object.assign({}, options, {
        pub_id: custom.jtk_id || 43423
      });
      this.update();
      typeof customCb == "function" && customCb();
    });
  }
  async getActDetail(data) {
    return await this.model.getActDetail(data);
  }
  setItem(name, value) {
    const arr = name.split(".");
    if (arr && arr.length == 2) {
      if (!this.data[arr[0]]) {
        this.data[arr[0]] = {};
      }
      this.data[arr[0]][arr[1]] = value;
    } else {
      this.data[name] = value;
    }
    this.update();
  }
}

module.exports = new ModelStore();
