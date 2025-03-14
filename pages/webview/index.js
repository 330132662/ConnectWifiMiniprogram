const app = getApp();

Page({
  data: {
    src: "",
  },
  onLoad(options) {
    if (options.title) {
    }
    if (options.src) {
      const src = decodeURIComponent(options.src);
      this.setData({
        src,
      });
    } else {
      app.utils.alwaysBack();
    }
  },
});
