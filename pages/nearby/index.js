const storage = require("../../utils/storage");
const Store = require("./store");
const app = getApp();

Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this);
    Store._init();
    const groupList = await Store.getGroupList();
    Store.setItem("groupList", groupList);
    Store.setItem("finished", false);
    Store.setItem("list", []);
    Store.setItem("page", 1);
    this.location = {};
    // modify: getLocation/getFuzzyLocation
    wx.getLocation({
      success: async ({ latitude, longitude }) => {
        this.location = { latitude, longitude };
        await this._initFechNearby();
      },
      fail: async (e) => {
        await this._initFechNearby();
        console.log("error: ", e);
        Store.setItem("fullLoading", false);
      }
    });
  },
  onShow() {
    if (this.getTabBar()) {
      this.getTabBar().init();
    }
  },
  async _initFechNearby() {
    try {
      const list = await Store.getNearbyMerchant(this.location);
      Store.setItem("list", list);
      Store.setItem("fullLoading", false);
    } catch (e) {
      Store.setItem("fullLoading", false);
      console.error(e);
    }
  },
  handleBannerItemClick(e) {
    const item = e.currentTarget.dataset.item;
    switch (item.type) {
      case "h5":
        if (item.url) {
          wx.navigateTo({
            url: `/pages/webview/index?src=${item.url}`
          });
        }
        break;
      case "mini":
        wx.navigateToMiniProgram({
          appId: item.appid,
          path: decodeURIComponent(item.url),
          fail: (res) => {
            const msg = res.errMsg;
            if (msg === "navigateToMiniProgram:fail invalid appid") {
              app.utils.modalText("跳转失败，可能是小程序路径或appid填写错误");
            } else if (msg === "navigateToMiniProgram:fail can't navigate to myself") {
              wx.reLaunch({
                url: decodeURIComponent(item.url)
              });
            }
          }
        });
        break;
      default:
        break;
    }
  },
  async onReachBottom() {
    if (this.data.finished || this.data.loading) {
      return;
    }
    await Store.getNearbyMerchant(this.location);
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
  handleCategoryClick(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/wifi/category/index?gid=${item.id}&title=${item.name}`
    });
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
