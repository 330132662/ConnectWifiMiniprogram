const CustomStore = require("../store/custom");
const app = getApp();
const defaultList = [
  {
    type: "switchTab",
    index: 10,
    name: "首页",
    url: "/pages/home/index",
    icon: "home"
  },
  {
    type: "switchTab",
    index: 20,
    name: "附近门店",
    url: "/pages/nearby/index",
    icon: "merchant"
  },
  {
    type: "switchTab",
    index: 30,
    name: "我的",
    url: "/pages/mine/index",
    icon: "mine"
  }
];
Component({
  data: {
    list: defaultList
  },
  attached() {
    CustomStore.subscribe(() => {
      const custom = CustomStore.data.custom;
      if (custom.jtk_active == 1) {
        let newList = defaultList.slice();
        newList.push({
          type: "switchTab",
          index: 25,
          name: "天天领券",
          url: "/pages/hui/index",
          icon: "coupon"
        });
        newList.push({
          type: "navigateTo",
          index: 26,
          name: "热门电影",
          url: "/coupon/movie/index",
          icon: "movie"
        });
        newList = newList.sort((a, b) => a.index - b.index);
        this.setData({ list: newList });
      }
    });
  },
  methods: {
    onChange({ detail }) {
      const item = this.data.list.find((_, index) => index == detail);
      this.setData({ active: detail });
      wx[item.type || "switchTab"]({
        url: this.data.list[detail].url
      });
    },

    init() {
      const page = getCurrentPages().pop();
      this.setData({
        active: +this.data.list.findIndex((item) => {
          return item.url === `/${page.route}`;
        })
      });
    }
  }
});
