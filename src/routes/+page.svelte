<script lang="ts">
	import { onMount } from "svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import Discord from "$lib/components/Discord.svelte"
	import { fade } from "svelte/transition"
	import { Rowp, type TBox, type TPoint, type TRectangle } from "$lib/simbacode/srl"
	import { drawInterface } from "$lib/simbacode/interface"
	import type { PageData } from "./$types"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import { invalidateAll } from "$app/navigation"
	import { browser } from "$app/environment"
	export let data: PageData

	let canvasData: ImageData

	const clearPixel = async (context: CanvasRenderingContext2D, i: number) => {
		if (canvasData.data[i + 0] == 0 && canvasData.data[i + 1] == 0) {
			canvasData.data[i + 3] = 0
		} else if (canvasData.data[i + 0] == 0 && canvasData.data[i + 1] > 0) {
			canvasData.data[i + 1] = 0
			canvasData.data[i + 2] = 0
			canvasData.data[i + 3] = 0
		} else if (
			canvasData.data[i + 0] <= 255 &&
			canvasData.data[i + 0] > 0 &&
			canvasData.data[i + 1] <= 255
		) {
			canvasData.data[i + 0] = 0
		} else if (
			canvasData.data[i + 0] <= 255 &&
			canvasData.data[i + 1] > 255 &&
			canvasData.data[i + 1] >= 0
		) {
			canvasData.data[i + 1] = 255
		}

		canvasData.data[i + 2] = 0
		context.putImageData(canvasData, 0, 0)
	}

	const drawPixel = async (
		context: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		p: TPoint
	) => {
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
			setTimeout(clearPixel, 20000, context, i)
		}

		setPixel((p.x + p.y * canvas.width) * 4)
	}

	const drawInvTabHits = async (
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D,
		Mouse: TPoint
	) => {
		context.strokeStyle = "rgba(255, 0, 0, 1)"
		canvasData = context.getImageData(0, 0, canvas.width, canvas.height)

		let Box: TBox = {
			x1: canvas.width - 240 + 6 + 3 * 33,
			y1: canvas.height - 333,
			x2: canvas.width - 240 + 6 + 3 * 33 + 30,
			y2: canvas.height - 333 + 33
		}

		let rect: TRectangle = {
			Top: { x: Box.x1, y: Box.y1 },
			Right: { x: Box.x2, y: Box.y1 },
			Btm: { x: Box.x2, y: Box.y2 },
			Left: { x: Box.x1, y: Box.y2 }
		}

		let p: TPoint = Rowp({ x: Mouse.x, y: Mouse.y }, rect)
		drawPixel(context, canvas, p)
	}

	onMount(async () => {
		let canvas: any = document.getElementById("canvas")
		const context = canvas.getContext("2d", { willReadFrequently: true })

		let Mouse: TPoint = { x: 0, y: 0 }

		window.addEventListener("resize", resizeCanvas, false)
		window.onmousemove = async (e) => {
			Mouse.x = e.pageX
			Mouse.y = e.pageY - document.documentElement.scrollTop
		}

		const drawHitBox = async () => {
			for (let i = 0; i < 5; i++) {
				drawInvTabHits(canvas, context, Mouse)
			}
			requestAnimationFrame(drawHitBox)
		}

		drawHitBox()

		function resizeCanvas() {
			canvas.width = 241
			canvas.height = 335

			// Redraw everything after resizing the window
			drawInterface(canvas, context)
		}
		resizeCanvas()
	})
	
	function rerunLoad() {
		if (browser) invalidateAll()
		setTimeout( rerunLoad, 5000 );
	}
	
	rerunLoad()
	$: data.total
</script>

<svelte:head>
	<MetaTags
		title=""
		description="OldSchool RuneScape Color botting at it's best. Color only and fully open-source Simba scripts for OSRS."
	/>
</svelte:head>

<div
	class="container my-6 mx-auto flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<div class="mx-auto max-w-2xl">
		<header>
			<h1 class="text-2xl font-bold text-center md:text-3xl py-12">
				<div class="py-4">WaspScripts</div>
				<div>
					100% <span class="bg-clip-text animate-character text-transparent pl-1 inline-block"
						>color</span
					>, 100% open source.
				</div>
			</h1>
		</header>

	<header>
		<h2 class="pt-6 px-6 font-bold whitespace-nowrap text-center">
			Total Experience Earned:
			{#await formatRSNumber(data.total.experience)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
		</h2>
		<h2 class="px-6 font-bold whitespace-nowrap text-center">
			Total Gold Earned:
			{#await formatRSNumber(data.total.gold)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
		</h2>
		<h2 class="px-6 font-bold whitespace-nowrap text-center">
			Total Levels Earned:
			<span class="py-4 pr-6"> {data.total.levels} </span>
		</h2>
		<h2 class="pb-4 px-6 font-bold whitespace-nowrap text-center">
			Total Runtime:
			{#await convertTime(data.total.runtime)}
				<span class="py-4 pr-6"> ... </span>
			{:then value}
				<span class="py-4 pr-6"> {value} </span>
			{/await}
		</h2>
	</header>

		<p class="py-12 text-center">
			WaspScripts is a collection of open source color scripts written for Simba on top of SRL and
			WaspLib.
			<br />
			If you are new to Simba and don't know what it is, Simba is just the oldest color botting program
			still around, it's ancestor, SCAR dates back to RuneScape Classic.
		</p>
		<h2 class="text-center py-6">
			For more information, help and/or questions look through the <a href="/faq">FAQ</a> or join the
			discord community!
		</h2>

		<Discord />
	</div>
	<div class="py-6">
		<header>
			<h2 class="text-2xl font-bold text-center md:text-3xl py-16">
				<span> Advanced mouse movements and click patterns </span>
			</h2>
		</header>

		<canvas id="canvas" class="m-auto" />
	</div>
</div>

<style>
	.animate-character {
		background-image: linear-gradient(
			90deg,
			rgba(255, 0, 0, 1) 0%,
			rgba(255, 136, 0, 1) 10%,
			rgba(255, 248, 0, 1) 20%,
			rgba(56, 255, 0, 1) 30%,
			rgba(0, 255, 149, 1) 40%,
			rgba(0, 255, 255, 1) 50%,
			rgba(0, 138, 255, 1) 60%,
			rgba(34, 0, 255, 1) 70%,
			rgba(188, 0, 255, 1) 80%,
			rgba(255, 0, 189, 1) 90%,
			rgba(255, 0, 0, 1) 100%
		);
		background-size: 200% auto;
		animation: textclip 10s linear infinite;
	}

	@keyframes textclip {
		to {
			background-position: 200% center;
		}
	}
</style>
