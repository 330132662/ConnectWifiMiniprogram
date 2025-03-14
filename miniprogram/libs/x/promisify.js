export function promisify(func, obj) {
	return new Promise((resolve, reject) => {
		func({
			...obj,
			success: resolve,
			fail: (e) => {
				console.error('WX PROMISIFY ERROR: ', e);
				reject(e);
			}
		});
	});
}
