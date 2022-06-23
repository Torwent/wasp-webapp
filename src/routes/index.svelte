<script>
	import { onMount } from "svelte"
	import Discord from "$lib/components/Discord.svelte"
	import { fade } from "svelte/transition"
	import { Rowp } from "$lib/simbacode/srl.js"
	import {
		drawChatbox,
		drawChatButtons,
		drawGametabs,
		drawMinimap,
		drawXPBarnUpText
	} from "$lib/simbacode/interface.js"

	const clearPixel = (context, i, canvasData) => {
		canvasData.data[i + 0] = 0
		canvasData.data[i + 1] = 0
		canvasData.data[i + 2] = 0
		canvasData.data[i + 3] = 0
		context.putImageData(canvasData, 0, 0)
	}

	const clearPixel2 = (context, i, canvasData) => {
		if (canvasData.data[i + 0] == 0 && canvasData.data[i + 1] == 0) {
			canvasData.data[i + 2] = 0
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
			canvasData.data[i + 0] -= 15
		} else if (
			canvasData.data[i + 0] <= 255 &&
			canvasData.data[i + 1] > 255 &&
			canvasData.data[i + 1] >= 0
		) {
			canvasData.data[i + 1] += 15
		}
		context.putImageData(canvasData, 0, 0)
	}

	const drawPixel = (context, canvas, canvasData, x, y) => {
		const setPixel = (i) => {
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
				canvasData.data[i + 0] += 15
			} else if (
				canvasData.data[i + 0] == 255 &&
				canvasData.data[i + 1] <= 255 &&
				canvasData.data[i + 1] > 0
			) {
				canvasData.data[i + 1] -= 15
			}

			canvasData.data[i + 2] = 0
			canvasData.data[i + 3] = 255
			context.putImageData(canvasData, 0, 0)
			setTimeout(
				clearPixel2,
				1500,
				context,
				i,
				context.getImageData(0, 0, canvas.width, canvas.height)
			) //something wrong with this? it's clearing all dots every 1500 instead of the timed out ones.
		}

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				setPixel((x - 1 + i + (y - 1 + j) * canvas.width) * 4)
			}
		}
	}

	const drawInvTab = (canvas, context, MouseX, MouseY) => {
		context.strokeStyle = "rgba(255, 0, 0, 1)"
		let canvasData = context.getImageData(0, 0, canvas.width, canvas.height)

		let BX1 = canvas.width - 240 + 6 + 3 * 33
		let BY1 = canvas.height - 333
		let BX2 = BX1 + 30
		let BY2 = BY1 + 33

		context.strokeRect(BX1, BY1, 30, 33)

		let rect = { Top: {}, Right: {}, Btm: {}, Left: {} }
		rect.Top.x = BX1
		rect.Top.y = BY1
		rect.Right.x = BX2
		rect.Right.y = BY1
		rect.Btm.x = BX2
		rect.Btm.y = BY2
		rect.Left.x = BX1
		rect.Left.y = BY2

		let p = Rowp({ x: MouseX, y: MouseY }, rect)
		drawPixel(context, canvas, canvasData, p.x, p.y)
	}

	onMount(() => {
		let canvas = document.getElementById("canvas"),
			context = canvas.getContext("2d")

		let x
		let y

		window.addEventListener("resize", resizeCanvas, false)
		window.onmousemove = (e) => {
			x = e.clientX
			y = e.clientY
		}

		function drawHitBox() {
			drawInvTab(canvas, context, x, y)
			requestAnimationFrame(drawHitBox)
		}

		drawHitBox()

		function resizeCanvas() {
			canvas.width = canvas.parentElement.clientWidth
			canvas.height = window.innerHeight - 100

			// Redraw everything after resizing the window
			drawChatbox(canvas, context)
			drawChatButtons(canvas, context)
			drawGametabs(canvas, context)
			drawMinimap(canvas, context)
			drawXPBarnUpText(canvas, context)
			//2 passes to remove all transparency.... there has to be a bette solution...
			drawChatbox(canvas, context)
			drawChatButtons(canvas, context)
			drawGametabs(canvas, context)
			drawMinimap(canvas, context)
			drawXPBarnUpText(canvas, context)
		}
		resizeCanvas()
	})
</script>

<svelte:head>
	<title>Wasp Scripts</title>
	<meta
		name="description"
		content="OldSchool RuneScape Color botting at it's best. Color only and fully open-source Simba scripts for OSRS."
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
					100% <span class="bg-clip-border animate-character pl-1">color</span>, 100% open source.
				</div>
			</h1>
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
		<a href="https://discord.com/invite/YMYUahmww9">
			<Discord />
		</a>
	</div>
	<div class="py-6">
		<header>
			<h2 class="text-2xl font-bold text-center md:text-3xl py-12">
				<span> Advanced mouse movements and click patterns </span>
			</h2>
		</header>

		<canvas id="canvas" />
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
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: textclip 10s linear infinite;
		display: inline-block;
	}

	@keyframes textclip {
		to {
			background-position: 200% center;
		}
	}
</style>
