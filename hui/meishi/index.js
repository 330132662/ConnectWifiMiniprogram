const Store = require("./store");
const app = getApp();
let timeoutId = null;

Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this);
    Store._init(null, () => {
      const options = this.data.options;
      console.log(`plugin://meishi/home?pub_id=${options.pub_id}&sid=plugin`);
      // wx.redirectTo({
      //   url: `plugin://meishi/home?pub_id=${options.pub_id}&sid=plugin`
      // });
    });
  },
  handleBack() {
    return app.utils.alwaysBack();
  }
});
