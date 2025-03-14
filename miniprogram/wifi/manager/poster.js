module.exports = (
	url = '',
	color = '',
	line_1 = '',
	line_2 = '',
	line_3 = '',
	line_4 = '',
	wifi_uid = ''
) => {
	if (!url) {
		return
	}
	line_1 = line_1 || '微信扫码连WiFi'
	line_2 = line_2 || '一键快速连接 · 无需密码 · 安全防蹭网'
	line_3 = line_3 || '品牌定制WiFi'
	line_4 = line_4 || '无需密码，扫码就能连'
	color = color || '#1890ff'
	const ratio = 2
	const width = 750
	const height = 1100
	// theme_1
	const titleSize = 60
	const imageSize = 520
	const bottomSize = 180
	return {
		theme_1: {
			width: width,
			height: height,
			backgroundColor: '#fff',
			pixelRatio: ratio,
			texts: [
				{
					x: width / 2,
					y: 100,
					text: line_1,
					fontSize: titleSize,
					lineHeight: 1,
					baseLine: 'middle',
					textAlign: 'center',
					fontWeight: '500',
				},
				{
					x: width / 2,
					y: 190,
					width: (width - 60) * ratio,
					fontSize: 35,
					text: line_2,
					color: '#666',
					lineNum: 1,
					textAlign: 'center',
				},
				{
					x: width / 2,
					y: height - bottomSize - 50,
					width: (width - 150) * ratio,
					fontSize: 30,
					text: wifi_uid,
					color: '#666',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
				// bottom
				{
					x: width / 2,
					y: height - bottomSize + 80,
					width: (width - 150) * ratio,
					fontSize: 55,
					text: line_3,
					color: '#fff',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
				{
					x: width / 2,
					y: height - bottomSize + 140,
					width: (width - 90) * ratio,
					fontSize: 35,
					text: line_4,
					color: '#eee',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
			],
			images: [
				{
					x: (width - imageSize) / 2,
					y: 255,
					url,
					width: imageSize,
					height: imageSize,
					borderRadius: 20,
				},
			],
			blocks: [
				{
					x: 0,
					y: height - bottomSize,
					backgroundColor: color,
					width,
					height: bottomSize,
				},
			],
		},
		theme_2: {
			width: width,
			height: height,
			backgroundColor: '#fff',
			pixelRatio: ratio,
			blocks: [
				{
					x: 0,
					y: 0,
					width,
					height: height - bottomSize,
					backgroundColor: color,
					zIndex: -1,
				},
				{
					x: (width - imageSize - 110) / 2,
					y: 250,
					backgroundColor: '#fff',
					width: imageSize + 110,
					height: imageSize + 110,
					borderRadius: 20,
				},
			],
			texts: [
				{
					x: width / 2,
					y: 100,
					text: line_1,
					fontSize: titleSize,
					lineHeight: 1,
					baseLine: 'middle',
					textAlign: 'center',
					fontWeight: '500',
					color: '#fff',
				},
				{
					x: width / 2,
					y: 190,
					width: (width - 60) * ratio,
					fontSize: 35,
					text: line_2,
					color: '#f8f8f8',
					lineNum: 1,
					textAlign: 'center',
				},
				{
					x: width / 2,
					y: height - bottomSize - 65,
					width: (width - 150) * ratio,
					fontSize: 30,
					text: wifi_uid,
					color: '#666',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
				// bottom
				{
					x: width / 2,
					y: height - bottomSize + 80,
					width: (width - 150) * ratio,
					fontSize: 55,
					text: line_3,
					color: '#111',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
				{
					x: width / 2,
					y: height - bottomSize + 140,
					width: (width - 90) * ratio,
					fontSize: 35,
					text: line_4,
					color: '#555',
					lineNum: 1,
					textAlign: 'center',
					zIndex: 10,
				},
			],
			images: [
				{
					x: (width - imageSize) / 2,
					y: 275,
					url,
					width: imageSize,
					height: imageSize,
					borderRadius: 20,
					zIndex: 10,
				},
			],
		},
	}
}
