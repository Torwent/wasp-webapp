<script lang="ts">
	import { onMount } from "svelte"
	import { rowp, type TPoint, type TRectangle } from "$lib/math"

	function strokeRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
		x = Math.round(x) + 0.5
		y = Math.round(y) + 0.5
		ctx.strokeRect(x, y, w, h)
	}

	function drawGametabs(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		const tabsX1 = canvas.width - 241
		const tabsY1 = canvas.height - 335
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

	let mouse: TPoint = { x: 0, y: 0 }
	let canvas: HTMLCanvasElement
	let context: CanvasRenderingContext2D
	let canvasData: ImageData
	let frameReady = false

	const rect: TRectangle = {
		Top: { x: 106, y: 2 },
		Right: { x: 135, y: 2 },
		Btm: { x: 135, y: 34 },
		Left: { x: 106, y: 34 }
	}

	function getNextCycleColor(r: number, g: number, b: number, step: number) {
		if (r === 0 && g === 0 && b === 0) b = 255
		else if (r === 255 && g === 0 && b < 255) b += step
		else if (r > 0 && g === 0 && b === 255) r -= step
		else if (r === 0 && g < 255 && b === 255) g += step
		else if (r === 0 && g === 255 && b > 0) b -= step
		else if (r < 255 && g === 255 && b === 0) r += step
		else if (r === 255 && g > 0 && b === 0) g -= step

		if (r < 0) r = 0
		if (r > 255) r = 255

		if (g < 0) g = 0
		if (g > 255) g = 255

		if (b < 0) b = 0
		if (b > 255) b = 255

		return [r, g, b]
	}

	async function drawPixel(p: TPoint) {
		const setPixel = async (i: number) => {
			const { data } = canvasData
			const pixel = getNextCycleColor(data[i], data[i + 1], data[i + 2], 25)

			data[i] = pixel[0]
			data[i + 1] = pixel[1]
			data[i + 2] = pixel[2]
			data[i + 3] = 255
		}

		setPixel((p.x + p.y * canvas.width) * 4)
	}

	async function getNextFrame(iterations: number) {
		for (let i = 0; i < iterations; i++) {
			drawPixel(rowp(mouse, rect))
		}
		frameReady = true
	}

	async function drawHeatMap() {
		if (!canvas) return
		if (!frameReady) {
			context.clearRect(106, 2, 29, 32)
			canvasData = context.getImageData(0, 0, canvas.width, canvas.height)
			getNextFrame(10000)
		}

		requestAnimationFrame(drawHeatMap)
		context.putImageData(canvasData, 0, 0)
		frameReady = false
	}

	function resizeCanvas() {
		canvas.width = 241
		canvas.height = 335

		// Redraw everything after resizing the window
		drawInterface(canvas, context)
	}

	onMount(() => {
		canvas = document.getElementById("canvas") as HTMLCanvasElement
		context = canvas.getContext("2d", {
			willReadFrequently: true
		}) as CanvasRenderingContext2D
		context.strokeStyle = "rgba(255, 0, 0, 1)"

		window.onresize = resizeCanvas
		window.onmousemove = async (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect()
			const scaleX = canvas.width / rect.width
			const scaleY = canvas.height / rect.height

			mouse = {
				x: (event.clientX - rect.left) * scaleX,
				y: (event.clientY - rect.top) * scaleY
			}
		}

		resizeCanvas()
		drawHeatMap()
	})
</script>

<canvas id="canvas" class="m-auto"></canvas>
