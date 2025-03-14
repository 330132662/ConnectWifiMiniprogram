let timeoutId = null;

const showLoading = (title = '', mask = false, ms = 200) => {
	timeoutId = setTimeout(() => {
		timeoutId = null;
		wx.showLoading({
			title,
			mask
		});
	}, ms);

	const callback = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		wx.hideLoading();
	};

	return callback;
};

module.exports = showLoading;
