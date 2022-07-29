const drawChatbox = (canvas, context) => {
	let chatY1 = canvas.height - 165
	context.sRect(0, chatY1, 518, 141)

	for (let i = 0; i < 8; i++) {
		context.sRect(10, chatY1 + 14 * i + 8, 483, 13)
	}

	context.sRect(10, chatY1 + 120, 508, 15)

	context.sRect(498, chatY1 + 8, 16, 112)
}

const drawChatButtons = (canvas, context) => {
	let buttonsY1 = canvas.height - 23
	context.sRect(0, buttonsY1, 518, 22)

	for (let i = 0; i < 7; i++) {
		context.sRect(3 + i * 62, buttonsY1, 58, 21)
	}

	context.sRect(436, buttonsY1, 79, 21)
}

const drawGametabs = (canvas, context) => {
	let tabsX1 = canvas.width - 241
	let tabsY1 = canvas.height - 335
	context.sRect(tabsX1, tabsY1, 240, 334)

	for (let i = 0; i < 7; i++) {
		context.sRect(tabsX1 + 6 + i * 33, tabsY1 + 1, 30, 33)
	}

	for (let i = 0; i < 7; i++) {
		context.sRect(tabsX1 + 6 + i * 33, tabsY1 + 298, 30, 33)
	}
}

const drawMinimap = (canvas, context) => {
	let mmX1 = canvas.width - 158
	let mmY1 = 8
	//context.sRect(mmX1, mmY1, 151, 151)

	let coords = [
		[0, -76],
		[21, -73],
		[40, -64],
		[56, -51],
		[68, -33],
		[75, -1],
		[68, 31],
		[50, 43],
		[40, 62],
		[21, 71],
		[0, 74],
		[-21, 71],
		[-40, 62],
		[-56, 49],
		[-68, 31],
		[-75, -1],
		[-68, -33],
		[-56, -51],
		[-40, -64],
		[-21, -73]
	]

	const offSetPoly = (pointArray, offset) => {
		let result = []
		pointArray.forEach((e) => result.push([e[0] + offset[0], e[1] + offset[1]]))
		return result
	}

	let mmCenter = [mmX1 + 151 / 2, mmY1 + 151 / 2]

	let finalArr = offSetPoly(coords, mmCenter)

	context.beginPath()
	for (let i = 0; i < finalArr.length; i++) {
		context.moveTo(finalArr[i][0], finalArr[i][1])
		if (i < finalArr.length - 1) {
			context.lineTo(finalArr[i + 1][0], finalArr[i + 1][1])
		} else {
			context.lineTo(finalArr[0][0], finalArr[0][1])
		}
	}
	context.stroke()

	//Compass
	context.beginPath()
	context.arc(mmX1 - 2, mmY1 + 14, 17, 0, 2 * Math.PI)
	context.stroke()

	//xp
	context.beginPath()
	context.arc(mmX1 - 50, mmY1 + 32, 17, 0, 2 * Math.PI)
	context.stroke()

	//hp
	context.beginPath()
	context.arc(mmX1 - 13, mmY1 + 55, 17, 0, 2 * Math.PI)
	context.stroke()

	//prayer
	context.beginPath()
	context.arc(mmX1 - 13, mmY1 + 90, 17, 0, 2 * Math.PI)
	context.stroke()

	//Run
	context.beginPath()
	context.arc(mmX1 - 3, mmY1 + 121, 17, 0, 2 * Math.PI)
	context.stroke()

	//spec
	context.beginPath()
	context.arc(mmX1 + 19, mmY1 + 148, 17, 0, 2 * Math.PI)
	context.stroke()
}

const drawXPBarnUpText = (canvas, context) => {
	context.sRect(canvas.width - 359 - 15, 0, 118, 28)
	let w
	if (canvas.width > 900) w = 497
	else w = canvas.width - 359 - 20

	context.sRect(3, 3, w, 18)
}

export const drawInterface = (canvas, context, mediaquery) => {
	context.sRect = function (x, y, w, h) {
		x = parseInt(x) + 0.5
		y = parseInt(y) + 0.5
		this.strokeRect(x, y, w, h)
	}

	context.strokeStyle = "rgb(249 115 22)"
	context.fillStyle = "rgb(249 115 22)"

	if (mediaquery) {
		context.sRect(0, 0, canvas.width - 1, canvas.height - 1)

		drawChatbox(canvas, context)
		drawChatButtons(canvas, context)
		drawXPBarnUpText(canvas, context)
	}
	drawGametabs(canvas, context)
	drawMinimap(canvas, context)

	if (mediaquery) {
		context.font = "20px sans-serif"
		let textString = "The click pattern generated is in relation to your mouse position.",
			textWidth = context.measureText(textString).width
		context.fillText(textString, canvas.width / 2 - textWidth / 2, 230)
	}
}
