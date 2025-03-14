const Store = require("./store");
const app = getApp();

Page({
  data: Store.data,
  async onLoad(options) {
    Store.bind(this);
  },
  onShow() {
    wx.getSetting({
      success: (res) => {
        const authSetting = res.authSetting;
        if (authSetting["scope.userFuzzyLocation"] != undefined && !authSetting["scope.userFuzzyLocation"]) {
          wx.showModal({
            content: "请先授权地理位置",
            showCancel: true,
            cancelText: "取消",
            cancelColor: "#888",
            confirmText: "立即授权",
            confirmColor: "#111",
            success: (result) => {
              if (result.confirm) {
                wx.openSetting();
              } else {
                app.utils.alwaysBack();
              }
            }
          });
        } else {
          Store._init(() => {
            // modify: getLocation/getFuzzyLocation
            wx.getLocation({
              success: ({ latitude, longitude }) => {
                const location = { lat: latitude, lon: longitude };
                this.location = location;
                Store.setItem("page", 1);
                Store.setItem("list", []);
                Store.setItem("finished", false);
                Store.getGasList(location);
              }
            });
          });
        }
      }
    });
  },
  // 获取油站列表
  async getGasList(location) {
    return await Store.getGasList(location);
  },
  async onReachBottom() {
    return await Store.getGasList(this.location);
  },
  handle2Location(e) {
    const { lat, lon, storeName, address } = e.currentTarget.dataset.item;
    wx.openLocation({
      latitude: Number(lat),
      longitude: Number(lon),
      scale: 25,
      name: storeName,
      address
    });
  },
  handle2Gas(e) {
    const { lat, lon, storeName, address } = e.currentTarget.dataset.item;
  }
});
