const Store = require("./store");
const UserStore = require("../../store/user");
const app = getApp();

let timeoutId = null;

Page({
  data: Store.data,
  onLoad(options) {
    Store.bind(this);
    Store._init(() => {
      Store.setItem("loading", false);
      Store.setItem("finished", false);
      Store.setItem("page", 1);
      Store.setItem("list", []);
      Store.getActList();
    });
  },
  onShow() {
    if (this.getTabBar()) {
      this.getTabBar().init();
    }
  },
  nav2Plugin(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },
  showLoading(title = "", mask = true, timeout = 20) {
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
  async handleHuiItemClick(e) {
    if (this.data.disabled) {
      return;
    }
    const act_id = e.currentTarget.dataset.id;
    const userInfo = this.data.userInfo;
    const mobile = userInfo.mobile || "";
    const sid = userInfo.id;
    this.showLoading();
    try {
      let result = app.getItem(`history_${act_id}`);
      if (!result) {
        result = await Store.getActDetail({ act_id, sid, mobile });
      }
      this.hideLoading();
      if (result.we_app_info && result.we_app_info.app_id) {
        app.setItem(`history_${act_id}`, result);
        wx.navigateToMiniProgram({
          appId: result.we_app_info.app_id,
          path: decodeURIComponent(result.we_app_info.page_path),
          fail: (res) => {
            const msg = res.errMsg;
            if (msg === "navigateToMiniProgram:fail invalid appid") {
              app.utils.modalText("跳转失败，可能是小程序路径或appid填写错误");
            } else if (msg === "navigateToMiniProgram:fail can't navigate to myself") {
              wx.reLaunch({
                url: decodeURIComponent(result.we_app_info.page_path)
              });
            }
          }
        });
      } else {
        wx.navigateTo({
          url: `/pages/webview/index?src=${encodeURIComponent(result.h5)}`
        });
      }
    } catch (e) {
      console.error(e);
      this.hideLoading();
      app.utils.toastText("获取小程序信息失败");
    }
  },
  handleNavClick(e) {
    const name = e.currentTarget.dataset.name;
    switch (name) {
      case "meituan":
        wx.navigateTo({ url: "/hui/meituan/index" });
        break;
      case "didi":
        wx.navigateTo({ url: "/hui/didi/index" });
        break;
      case "ele":
        wx.navigateTo({ url: "/hui/ele/index" });
        break;
      default:
        break;
    }
  },
  async onReachBottom() {
    if (this.data.finished || this.data.loading) {
      return;
    }
    await Store.getActList();
  },
  onShareTimeline() {
    const custom = this.data.custom;
    const userInfo = this.data.userInfo;
    return {
      title: "3折优惠券天天领",
      query: `from=${userInfo.openid || ""}`
    };
  },
  onShareAppMessage() {
    const custom = this.data.custom;
    const userInfo = this.data.userInfo;
    return {
      title: "3折优惠券天天领",
      path: `/pages/hui/index?from=${userInfo.openid || ""}`,
      imageUrl: custom.share_icon
    };
  }
});
