<script lang="ts">
	import { onMount } from "svelte"
	import { Rowp, type TBox, type TPoint, type TRectangle } from "$lib/simba/srl"
	import { drawInterface } from "$lib/simba/interface"

	let mouse: TPoint = { x: 0, y: 0 }
	let canvas: HTMLCanvasElement
	let context: CanvasRenderingContext2D
	let canvasData: ImageData
	let box: TBox
	let rect: TRectangle
	let mouseP: TPoint

	async function drawPixel(p: TPoint) {
		const setPixel = async (i: number) => {
			if (
				canvasData.data[i + 0] == 0 &&
				canvasData.data[i + 1] >= 0 &&
				canvasData.data[i + 1] < 255
			) {
				canvasData.data[i + 1] = 255
			} else if (
				canvasData.data[i + 0] >= 0 &&
				canvasData.data[i + 0] < 255 &&
				canvasData.data[i + 1] == 255
			) {
				canvasData.data[i + 0] = 255
			} else if (
				canvasData.data[i + 0] == 255 &&
				canvasData.data[i + 1] <= 255 &&
				canvasData.data[i + 1] > 0
			) {
				canvasData.data[i + 1] = 0
			}

			canvasData.data[i + 2] = 0
			canvasData.data[i + 3] = 255
			context.putImageData(canvasData, 0, 0)
		}

		setPixel((p.x + p.y * canvas.width) * 4)
	}

	async function drawHeatMap() {
		context.clearRect(box.x1, box.y1, 29, 32)

		mouseP = mouse
		canvasData = context.getImageData(0, 0, canvas.width, canvas.height)

		for (let i = 0; i < 100; i++) {
			const p = Rowp(mouseP, rect)
			await drawPixel(p)
		}

		requestAnimationFrame(() => drawHeatMap())
	}

	function resizeCanvas() {
		canvas.width = 241
		canvas.height = 335

		// Redraw everything after resizing the window
		drawInterface(canvas, context)
		box = {
			x1: canvas.width - 240 + 6 + 3 * 33,
			y1: canvas.height - 333,
			x2: canvas.width - 245 + 6 + 3 * 33 + 30,
			y2: canvas.height - 333 + 33
		}

		rect = {
			Top: { x: box.x1, y: box.y1 },
			Right: { x: box.x2, y: box.y1 },
			Btm: { x: box.x2, y: box.y2 },
			Left: { x: box.x1, y: box.y2 }
		}
	}

	onMount(async () => {
		canvas = document.getElementById("canvas") as HTMLCanvasElement
		context = canvas.getContext("2d", {
			willReadFrequently: true
		}) as CanvasRenderingContext2D
		context.strokeStyle = "rgba(255, 0, 0, 1)"

		window.addEventListener("resize", resizeCanvas, false)
		window.onmousemove = async (e: MouseEvent) => {
			mouse.x = e.pageX
			mouse.y = e.pageY - document.documentElement.scrollTop
		}

		resizeCanvas()
		drawHeatMap()
	})
</script>

<canvas id="canvas" class="m-auto" />
