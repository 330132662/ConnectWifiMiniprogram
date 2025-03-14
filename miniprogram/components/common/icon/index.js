Component({
	externalClasses: ['x-class'],
	properties: {
		mode: {
			type: String,
			value: 'aspectFill',
		},
		bold: {
			type: Boolean,
			value: false,
		},
		size: {
			type: String,
			value: '',
		},
		color: {
			type: String,
			value: '',
		},
		classPrefix: {
			type: String,
			value: 'x',
		},
		name: {
			type: String,
			observer(val) {
				this.setData({
					isImageName: val.indexOf('/') !== -1,
				})
			},
		},
	},
	methods: {
		onClick() {
			this.triggerEvent('click')
		},
	},
})
