import { promisify } from './promisify';
export default {
	login: (obj) => promisify(wx.login, obj),
	checkSession: (obj) => promisify(wx.checkSession, obj),
	getUserInfo: (obj) => promisify(wx.getUserInfo, obj),
	getImageInfo: (obj) => promisify(wx.getImageInfo, obj),
	compressImage: (obj) => promisify(wx.compressImage, obj),
	// 界面交互
	showToast: (obj) => {
		if (typeof obj === 'string') {
			promisify(wx.showToast, { title: obj });
		} else {
			promisify(wx.showToast, obj);
		}
	}
};
