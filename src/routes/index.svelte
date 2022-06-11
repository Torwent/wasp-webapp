<script>
	import { onMount } from "svelte"
	import Discord from "$lib/components/Discord.svelte"
	import { fade } from "svelte/transition"

	const drawChatbox = (canvas, context) => {
		context.strokeStyle = "rgba(255, 255, 0, 1)"

		let chatY1 = canvas.height - 164
		context.strokeRect(0, chatY1, 518, 141)

		for (let i = 0; i < 8; i++) {
			context.strokeRect(10, chatY1 + 14 * i + 8, 483, 13)
		}

		context.strokeRect(10, chatY1 + 120, 508, 15)

		context.strokeRect(498, chatY1 + 8, 16, 112)
	}

	const drawChatButtons = (canvas, context) => {
		context.strokeStyle = "rgba(255, 255, 0, 1)"

		let buttonsY1 = canvas.height - 22
		//context.strokeRect(0, buttonsY1, 518, 22)

		for (let i = 0; i < 7; i++) {
			context.strokeRect(3 + i * 62, buttonsY1, 58, 21)
		}

		context.strokeRect(436, buttonsY1, 79, 21)
	}

	const drawGametabs = (canvas, context) => {
		context.strokeStyle = "rgba(255, 255, 0, 1)"

		let tabsX1 = canvas.width - 240
		let tabsY1 = canvas.height - 334
		context.strokeRect(tabsX1, tabsY1, 240, 334)

		for (let i = 0; i < 7; i++) {
			context.strokeRect(tabsX1 + 6 + i * 33, tabsY1 + 1, 30, 33)
		}

		for (let i = 0; i < 7; i++) {
			context.strokeRect(tabsX1 + 6 + i * 33, tabsY1 + 298, 30, 33)
		}
	}

	const drawMinimap = (canvas, context) => {
		context.strokeStyle = "rgba(255, 255, 0, 1)"

		let mmX1 = canvas.width - 157
		let mmY1 = 8
		context.strokeRect(mmX1, mmY1, 151, 151)

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

		let finalArr = offSetPoly(coords, [mmX1 + 151 / 2, mmY1 + 151 / 2])

		for (let i = 0; i < 7; i++) {
			//context.strokeRect(tabsX1 + 6 + i * 33, tabsY1 + 1, 30, 33)
		}
	}

	onMount(() => {
		let canvas = document.getElementById("canvas"),
			context = canvas.getContext("2d")

		window.addEventListener("resize", resizeCanvas, false)

		function resizeCanvas() {
			canvas.width = canvas.parentElement.clientWidth
			canvas.height = window.innerHeight - 100

			// Redraw everything after resizing the window
			drawChatbox(canvas, context)
			drawChatButtons(canvas, context)
			drawGametabs(canvas, context)
			drawMinimap(canvas, context)
			//2 passes to remove all transparency.... there has to be a bette solution...
			drawChatbox(canvas, context)
			drawChatButtons(canvas, context)
			drawGametabs(canvas, context)
			drawMinimap(canvas, context)
		}
		resizeCanvas()
	})
</script>

<svelte:head>
	<title>Wasp Scripts</title>
	<meta
		name="description"
		content="OldSchool RuneScape Color botting at it's best. Color only and fully open-source Simba scripts."
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
