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
        // wx.redirectTo({
        //   url: `__plugin__/wx3451c23b62c65d8a/pages/periphery/periphery?sid=plugin&pub_id=${options.pub_id}`,
        //   fail: () => {
        //     app.utils.alwaysBack();
        //   }
        // });
      });
    });
  }
});
