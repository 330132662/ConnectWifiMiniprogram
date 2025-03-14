Page({
	data: {
		tip: '',
	},
	onLoad(options) {
		const tip = options.tip
		if (tip) {
			this.setData({ tip })
		}
	},
})
