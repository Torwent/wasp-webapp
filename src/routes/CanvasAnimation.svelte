<script lang="ts">
	import { onMount } from "svelte"
	import { rowp, type TBox, type TPoint, type TRectangle } from "$lib/simba/srl"
	import { drawInterface } from "$lib/simba/interface"

	let mouse: TPoint = { x: 0, y: 0 }
	let canvas: HTMLCanvasElement
	let context: CanvasRenderingContext2D
	let canvasData: ImageData
	const box: TBox = {
		x1: 106,
		y1: 2,
		x2: 135,
		y2: 34
	}
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
			const pixel = getNextCycleColor(data[i], data[i + 1], data[i + 2], 255)

			data[i] = pixel[0]
			data[i + 1] = pixel[1]
			data[i + 2] = pixel[2]
			data[i + 3] = 255
			context.putImageData(canvasData, 0, 0)
		}

		setPixel((p.x + p.y * canvas.width) * 4)
	}

	let lastFrameTime = 0
	let tpa: TPoint[] = []

	async function getNextTPA(iterations: number) {
		for (let i = 0; i < iterations; i++) {
			tpa.push(rowp(mouse, rect))
		}
	}

	async function drawHeatMap(elapsedTime: number) {
		let delta = elapsedTime - (lastFrameTime || 0)

		if (tpa.length === 0) getNextTPA(800)
		requestAnimationFrame(drawHeatMap)

		if (lastFrameTime && delta < 33) return

		lastFrameTime = elapsedTime

		context.clearRect(106, 2, 29, 32)
		canvasData = context.getImageData(0, 0, canvas.width, canvas.height)

		tpa.forEach(async (p) => drawPixel(p))

		tpa = []
	}

	function resizeCanvas() {
		canvas.width = 241
		canvas.height = 335

		// Redraw everything after resizing the window
		drawInterface(canvas, context)
	}

	onMount(async () => {
		canvas = document.getElementById("canvas") as HTMLCanvasElement
		context = canvas.getContext("2d", {
			willReadFrequently: true
		}) as CanvasRenderingContext2D
		context.strokeStyle = "rgba(255, 0, 0, 1)"

		window.addEventListener("resize", resizeCanvas, false)
		window.onmousemove = async (e: MouseEvent) => {
			const page = document.getElementById("page")
			const appShell = document.getElementById("appShell")
			if (!appShell || !page) return

			mouse = {
				x: e.pageX - Math.round(appShell.clientWidth / 2) + 80,
				y: e.pageY - Math.round(page.clientHeight / 2) - 115
			}
		}

		resizeCanvas()
		drawHeatMap(lastFrameTime)
	})
</script>

<canvas id="canvas" class="m-auto" />
