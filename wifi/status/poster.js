module.exports = (
	url = '',
	color = '',
	line_1 = '',
	line_2 = '',
	line_3 = '',
	line_4 = ''
) => {
	if (!url) {
		return
	}
	line_1 = line_1 || '连WiFi 赚大钱'
	line_2 = line_2 || '分销拓客 · 赚取佣金 · 连接流量'
	line_3 = line_3 || '每一次连接都有「钱」'
	line_4 = line_4 || '加入我们，扫一扫，连WiFi赚大钱'
	const ratio = 2

	const width = 750
	const height = 1100
	const titleSize = 60
	const imageSize = 580
	const bottomSize = 180
	return {
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
				color: '#fff',
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
	}
}
