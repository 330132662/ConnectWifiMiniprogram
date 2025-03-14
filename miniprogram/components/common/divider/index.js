Component({
	properties: {
		type: {
			type: [String, null],
			value: 'text',
		},
		desc: {
			type: [String, null],
			value: '',
		},
		url: {
			type: [String, null],
			value: '',
		},
		size: {
			type: null,
			value: '26',
		},
		color: {
			type: String,
			value: '#ccc',
		},
	},
	methods: {
		onClick() {
			const url = this.data.url
			if (url) {
				wx.navigateTo({
					url: `/pages/webview/index?src=${url}`,
				})
			}
		},
	},
})
