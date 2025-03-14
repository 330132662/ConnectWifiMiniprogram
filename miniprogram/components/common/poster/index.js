Component({
	properties: {
		config: {
			type: Object,
			value: {}
		},
		preload: {
			type: Boolean,
			value: false
		},
		hideLoading: {
			type: Boolean,
			value: true
		}
	},
	ready() {
		if (this.data.preload) {
			const poster = this.selectComponent('#poster');
			this.downloadStatus = 'doing';
			poster
				.downloadResource(this.config)
				.then(() => {
					this.downloadStatus = 'success';
					this.trigger('downloadSuccess');
				})
				.catch((e) => {
					this.downloadStatus = 'fail';
					this.trigger('downloadFail', e);
				});
		}
	},
	methods: {
		trigger(event, data) {
			if (this.listener && typeof this.listener[event] === 'function') {
				this.listener[event](data);
			}
		},
		once(event, fun) {
			if (typeof this.listener === 'undefined') {
				this.listener = {};
			}
			this.listener[event] = fun;
		},
		downloadResource(reset, config) {
			return new Promise((resolve, reject) => {
				if (reset) {
					this.downloadStatus = null;
				}
				const poster = this.selectComponent('#poster');
				if (this.downloadStatus && this.downloadStatus !== 'fail') {
					if (this.downloadStatus === 'success') {
						resolve();
					} else {
						this.once('downloadSuccess', () => resolve());
						this.once('downloadFail', (e) => reject(e));
					}
				} else {
					poster
						.downloadResource(config)
						.then(() => {
							this.downloadStatus = 'success';
							resolve();
						})
						.catch((e) => reject(e));
				}
			});
		},
		onCreate(reset = false, config = {}) {
			this.config = config;
			return new Promise((resolve, reject) => {
				!this.data.hideLoading && wx.showLoading({ mask: true, title: '生成中' });
				return this.downloadResource(typeof reset === 'boolean' && reset, config)
					.then(() => {
						!this.data.hideLoading && wx.hideLoading();
						const poster = this.selectComponent('#poster');
						poster
							.create(config)
							.then((result) => {
								resolve(result);
							})
							.catch((e) => {
								reject(e);
							});
					})
					.catch((err) => {
						!this.data.hideLoading && wx.hideLoading();
						reject(err);
						console.error(err);
						this.triggerEvent('fail', err);
					});
			});
		},
		onCreateSuccess(e) {
			const { detail } = e;
			this.triggerEvent('success', detail);
		},
		onCreateFail(err) {
			console.error(err);
			this.triggerEvent('fail', err);
		}
	}
});
