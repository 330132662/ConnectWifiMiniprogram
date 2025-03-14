const Store = require("./store");
const UserStore = require("../../store/user");
const CustomStore = require("../../store/custom");
const app = getApp();

let timeoutId = null;
Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this);
    Store._init();
    const gid = options.gid;
    const title = options.title;
    if (title) {
      wx.setNavigationBarTitle({ title });
    }
    if (!gid) {
      return app.utils.alwaysBack();
    }
    this.gid = gid;
    Store.setItem("finished", false);
    Store.setItem("list", []);
    Store.setItem("page", 1);
    // modify: getLocation/getFuzzyLocation
    wx.getLocation({
      success: async ({ latitude, longitude }) => {
        try {
          this.location = { latitude, longitude };
          const list = await Store.getNearbyMerchant({ ...this.location, gid });
          Store.setItem("list", list);
          Store.setItem("loading", false);
        } catch (e) {
          console.error(e);
        }
      },
      fail: (e) => {
        console.log("error: ", e);
      }
    });
  },
  onShow() {},
  showLoading(title = "", mask = true, timeout = 500) {
    Store.setItem("disabled", true);
    timeoutId = setTimeout(() => {
      if (title) {
        wx.showLoading({ title, mask });
      } else {
        wx.showLoading({ mask });
      }
    }, timeout);
  },
  hideLoading() {
    Store.setItem("disabled", false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    wx.hideLoading();
  },
  async onReachBottom() {
    if (this.data.finished || this.data.loading) {
      return;
    }
    const gid = this.gid;
    await Store.getNearbyMerchant({ ...this.location, gid });
  },
  handle2Locate(e) {
    const data = e.currentTarget.dataset.item;
    if (data.longitude && data.latitude) {
      wx.openLocation({
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        scale: 20,
        fail: () => {
          app.utils.toastText("坐标设置错误");
        }
      });
    } else {
      app.utils.toastText("商家未设置坐标导航");
    }
  },
  handleMerchantClick(e) {
    const item = e.currentTarget.dataset.item;
    if (item.wifi_uid) {
      wx.navigateTo({
        url: `/wifi/linked/index?uid=${item.wifi_uid}`
      });
    } else {
      app.utils.toastText("当前门店没有可关联的WiFi");
    }
  }
});
