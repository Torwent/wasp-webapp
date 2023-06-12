function strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
	x = Math.round(x) + 0.5
	y = Math.round(y) + 0.5
	ctx.strokeRect(x, y, w, h)
}

function drawGametabs(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	let tabsX1 = canvas.width - 241
	let tabsY1 = canvas.height - 335
	strokeRect(context, tabsX1, tabsY1, 240, 334)

	for (let i = 0; i < 7; i++) {
		strokeRect(context, tabsX1 + 6 + i * 33, tabsY1 + 1, 30, 33)
		strokeRect(context, tabsX1 + 6 + i * 33, tabsY1 + 298, 30, 33)
	}
}

export function drawInterface(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	context.strokeStyle = "rgb(249 115 22)"
	context.fillStyle = "rgb(249 115 22)"

	drawGametabs(canvas, context)
}
