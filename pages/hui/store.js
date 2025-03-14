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
        channel: "plugin",
        sid: "plugin",
        title: "热门电影",
        btnColor: "#409EFF",
        relation_flag_name: "yuanxiaokeji"
      },
      singlePage: false,
      customLoading: true,
      custom: null,
      userInfo: null,

      page: 1,
      finished: false,
      loading: false,
      list: []
    };
    this.model = new Model();
  }
  async _init(userCb = null, customCb = null) {
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
        pub_id: custom.jtk_id || 43423,
        btnColor: custom.color || "#409EFF"
      });
      this.update();
      typeof customCb == "function" && customCb();
    });
  }
  async getActList(data = {}) {
    const page = this.data.page;
    const loading = this.data.loading;
    const finished = this.data.finished;

    if (loading || finished) {
      return [];
    }
    const userInfo = this.data.userInfo;
    data.sid = userInfo.id || "";
    data.mobile = userInfo.mobile || "";
    this.data.loading = true;
    this.update();
    try {
      const newList = await this.model.getActList({ page, ...data });
      if (newList && newList.length) {
        const oldList = this.data.list;
        this.data.list = oldList.concat(newList);
        this.data.finished = false;
        if (page == 1) {
          this.data.list = newList;
        }
      } else {
        this.data.finished = true;
      }
      this.data.loading = false;
      this.data.page = page + 1;
      this.update();
    } catch (e) {
      console.error(e);
      this.data.loading = false;
      this.update();
    }
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
