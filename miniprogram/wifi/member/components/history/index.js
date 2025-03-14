import { getHistory } from '../../../../api/log'

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
		begin: '',
		end: '',
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
		onDateChange(e) {
			const name = e.currentTarget.dataset.name
			const value = e.detail.value
			const begin = this.data.begin
			const end = this.data.end
			if (name === 'begin') {
				if (end && end < value) {
					this.setData({ begin: value, end: value })
					return
				}
			} else if (name === 'end') {
				if (begin && begin > value) {
					this.setData({ begin: value, end: value })
					return
				}
			}
			this.setData({ [name]: value })
		},
		onSearch() {
			this.setData({ page: 1, finished: false, list: [] })
			const begin = this.data.begin
			const end = this.data.end
			if ((begin && end) || (!begin && !end)) {
				this._fetch()
			} else {
				this.setData({ begin: '', end: '' })
				this._fetch()
			}
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
				let begin = this.data.begin
				let end = this.data.end
				if (begin) {
					begin = begin.replace(/-/gi, '/')
					begin = new Date(`${begin} 00:00:00`).getTime() / 1000
				}
				if (end) {
					end = end.replace(/-/gi, '/')
					end = new Date(`${end} 23:59:59`).getTime() / 1000
				}
				this.setData({ loading: true })
				getHistory({ openid, role, page, begin, end })
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
