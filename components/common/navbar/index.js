import storage from '../../../utils/storage'
let globalScrollTop = 0
Component({
	options: {
		multipleSlots: true,
	},
	properties: {
		// 是否占位
		placeholder: {
			type: Boolean,
			value: false,
		},
		// 导航栏背景颜色
		bgColor: {
			type: String,
			value: 'transparent',
			observer: '_showChange',
		},
		// 导航栏标题文字颜色
		textColor: {
			type: String,
			value: 'rgba(0, 0, 0, 1)',
			observer: '_showChange',
		},
		title: {
			type: String,
			value: '',
		},
		fixed: {
			type: Boolean,
			value: false,
		},
		boxShadow: Boolean,
		customStyle: String,
	},
	data: {
		showNav: false,
		opacityDiff: 0,
		pagesLength: 0,
	},
	created() {
		this.getSystemInfo()
	},
	attached() {
		this.setStyle()
		const pagesLength = getCurrentPages().length
		this.setData({
			pagesLength,
		})
	},
	pageLifetimes: {
		show() {
			if (getApp().globalSystemInfo.ios) {
				this.getSystemInfo()
				this.setStyle()
			}
		},
	},
	methods: {
		setStyle(isTransparent = false) {
			const {
				statusBarHeight,
				navBarHeight,
				capsulePosition,
				navBarExtendHeight,
				ios,
				windowWidth,
			} = getApp().globalSystemInfo
			const { title, bgColor, color } = this.data
			const rightDistance = windowWidth - capsulePosition.right //胶囊按钮右侧到屏幕右侧的边距
			const leftWidth = windowWidth - capsulePosition.left //胶囊按钮左侧到屏幕右侧的边距

			storage.setItem('navHeight', navBarHeight)
			let navigationbarinnerStyle = [
				`color: ${color}`,
				`background: ${bgColor}`,
				`height:${navBarHeight + navBarExtendHeight}px`,
				`padding-top:${statusBarHeight}px`,
				`padding-right:${leftWidth}px`,
				`padding-bottom:${navBarExtendHeight}px`,
			].join(';')

			let navBarLeft = []
			if (title) {
				navBarLeft = [
					`width:${capsulePosition.width}px`,
					`margin-left:${rightDistance}px`,
				].join(';')
			} else {
				navBarLeft = [
					`width:${capsulePosition.width}px`,
					`margin-left:${rightDistance}px`,
				].join(';')
			}
			this.setData({
				navigationbarinnerStyle,
				navBarLeft,
				navBarHeight,
				capsulePosition,
				navBarExtendHeight,
				ios,
			})
		},
		_showChange: function (value) {
			this.setStyle()
		},
		getSystemInfo() {
			const app = getApp()
			const systemInfo = wx.getSystemInfoSync()
			const ios = !!(systemInfo.system.toLowerCase().search('ios') + 1)
			let rect
			if (app.globalSystemInfo && !app.globalSystemInfo.ios) {
				return app.globalSystemInfo
			} else {
				try {
					rect = wx.getMenuButtonBoundingClientRect
						? wx.getMenuButtonBoundingClientRect()
						: null
					if (rect === null) {
						throw 'getMenuButtonBoundingClientRect error'
					}
					//取值为0的情况  有可能width不为0 top为0的情况
					if (!rect.width || !rect.top || !rect.left || !rect.height) {
						throw 'getMenuButtonBoundingClientRect error'
					}
				} catch (error) {
					let gap = '' //胶囊按钮上下间距 使导航内容居中
					let width = 96 //胶囊的宽度
					if (systemInfo.platform === 'android') {
						gap = 8
						width = 96
					} else if (systemInfo.platform === 'devtools') {
						if (ios) {
							gap = 5.5 //开发工具中ios手机
						} else {
							gap = 7.5 //开发工具中android和其他手机
						}
					} else {
						gap = 4
						width = 88
					}
					if (!systemInfo.statusBarHeight) {
						//开启wifi的情况下修复statusBarHeight值获取不到
						systemInfo.statusBarHeight =
							systemInfo.screenHeight - systemInfo.windowHeight - 20
					}
					//获取不到胶囊信息就自定义重置一个
					rect = {
						bottom: systemInfo.statusBarHeight + gap + 32,
						height: 32,
						left: systemInfo.windowWidth - width - 10,
						right: systemInfo.windowWidth - 10,
						top: systemInfo.statusBarHeight + gap,
						width: width,
					}
				}

				let navBarHeight = ''
				if (!systemInfo.statusBarHeight) {
					systemInfo.statusBarHeight =
						systemInfo.screenHeight - systemInfo.windowHeight - 20
					navBarHeight = (() => {
						const gap = rect.top - systemInfo.statusBarHeight
						return 2 * gap + rect.height
					})()
					systemInfo.statusBarHeight = 0
					systemInfo.navBarExtendHeight = 0 //下方扩展4像素高度 防止下方边距太小
				} else {
					navBarHeight = (function () {
						rect = rect || {}
						let gap = rect.top - systemInfo.statusBarHeight
						return systemInfo.statusBarHeight + 2 * gap + rect.height
					})()
					if (ios) {
						systemInfo.navBarExtendHeight = 4 //下方扩展4像素高度 防止下方边距太小
					} else {
						systemInfo.navBarExtendHeight = 0
					}
				}
				systemInfo.navBarHeight = navBarHeight //导航栏高度不包括statusBarHeight
				systemInfo.capsulePosition = rect //右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
				systemInfo.ios = ios //是否ios

				app.globalSystemInfo = systemInfo //将信息保存到全局变量中,后边再用就不用重新异步获取了
				return systemInfo
			}
		},
	},
})
