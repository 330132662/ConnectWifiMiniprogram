const defaultOptions = {
	selector: '#poster'
};

function Poster(options = {}, that) {
	options = {
		...defaultOptions,
		...options
	};

	const pages = getCurrentPages();
	let ctx = pages[pages.length - 1];
	if (that) ctx = that;
	const poster = ctx.selectComponent(options.selector);
	delete options.selector;

	return poster;
}

Poster.create = (reset = false, config, that) => {
	return new Promise((resolve, reject) => {
		const poster = Poster({}, that);
		if (!poster) {
			reject('请设置组件的id="poster"!!!');
			console.error('请设置组件的id="poster"!!!');
		} else {
			return Poster({}, that)
				.onCreate(reset, config)
				.then((res) => {
					resolve(res);
				})
				.catch((e) => {
					reject(e);
				});
		}
	});
};

export default Poster;
