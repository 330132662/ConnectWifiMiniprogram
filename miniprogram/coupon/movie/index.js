const Store = require("./store");
const app = getApp();
let timeoutId = null;

Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this);
    Store._init(null, () => {
      wx.nextTick(() => {
        const options = this.data.options;
        wx.redirectTo({
          url: `/coupon/__plugin__/wx89752980e795bfde/pages/index/index?title=${options.title}sid=plugin&pub_id=${options.pub_id}`
          // fail: () => {
          //   app.utils.alwaysBack();
          // }
        });
      });
    });
  }
});
