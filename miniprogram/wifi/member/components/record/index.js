import { getTodayLink } from '../../../../api/log'

Component({
	externalClasses: ['x-class'],
	properties: {
		show: {
			type: Boolean,
			value: false,
		},
		detail: {
			type: Object,
			value: () => {},
		},
		prole: {
			type: String,
			value: '',
		},
	},
	data: {
		popupShow: false,
		memberInfo: {},
		list: [],
		page: 1,
		finished: false,
		loading: false,
	},
	observers: {
		'show, detail': function (popupShow = false, memberInfo = {}) {
			this.setData({
				popupShow,
				page: 1,
				list: [],
				finished: false,
				memberInfo,
			})
			if (popupShow) {
				this._fetch()
			}
		},
	},
	methods: {
		onPopupClose() {
			this.triggerEvent('close')
		},
		onScrollBottom() {
			this._fetch()
		},
		_fetch() {
			return new Promise((resolve, reject) => {
				if (this.data.loading || this.data.finished) {
					return resolve([])
				}
				const memberInfo = this.data.memberInfo
				const openid = memberInfo.openid
				const role = memberInfo.role
				const page = this.data.page
				this.setData({ loading: true })
				getTodayLink({ openid, role, page })
					.then(newList => {
						if (newList && newList.length) {
							const oldList = this.data.list
							this.setData({
								list: oldList.concat(newList),
								page: page + 1,
								loading: false,
								finished: false,
							})
						} else {
							if (+page === 1) {
								this.setData({
									list: [],
									finished: true,
									loading: false,
									page: page + 1,
								})
							} else {
								this.setData({ finished: true, loading: false, page: page + 1 })
							}
						}
						resolve(newList)
					})
					.catch(() => {
						this.setData({ loading: false })
						app.utils.toastText('数据加载失败')
					})
			})
		},
	},
})
