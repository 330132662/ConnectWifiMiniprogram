Component({
	externalClasses: ['x-class'],
	properties: {
		type: {
			type: String,
			value: 'video',
		},
		unitId: {
			type: String,
			require: true,
		},
		custom: {
			type: Object,
		},
	},
	data: {
		adMove: false,
	},
	methods: {
		onAdLoad() {
			console.log('ad loaded')
			this.setData({
				adMove: false,
			})
		},
		onAdError(e) {
			console.error('广告加载错误：', e)
			this.setData({
				adMove: true,
			})
		},
		onAdClose() {
			console.log('ad closed')
			this.setData({
				adMove: true,
			})
		},
	},
})
