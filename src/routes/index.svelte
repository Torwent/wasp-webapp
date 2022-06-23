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
		//context.strokeRect(mmX1, mmY1, 151, 151)

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
		context.strokeStyle = "rgba(255, 255, 0, 1)"
		context.strokeRect(canvas.width - 358 - 15, 0, 118, 28)

		context.strokeRect(3, 3, 497, 18)
	}

	const DistToLineEx = (p, sA, sB) => {
		let dx, dy, d
		let f
		let result = { nearest: {}, result: 0 }

		result.nearest.x = sA.x
		result.nearest.y = sA.y
		dx = sB.x - sA.x
		dy = sB.y - sA.y
		d = dx * dx + dy * dy

		if (d === 0) {
			result.result = Math.hypot(p.x - sA.x, p.y - sA.y)
			return result
		}

		f = ((p.x - sA.x) * dx + (p.y - sA.y) * dy) / d

		if (f < 0) {
			result.result = Math.hypot(p.x - sA.x, p.y - sA.y)
		} else if (f === 0) {
			result.nearest.x = Math.round(sA.x + f * dx)
			result.nearest.y = Math.round(sA.y + f * dy)
			result.result = Math.hypot(p.x - result.nearest.x, p.y - result.nearest.y)
		} else if (f > 1) {
			result.nearest = sB
			result.result = Math.hypot(p.x - sB.x, p.y - sB.y)
		}

		return result
	}

	const NearestEdgeTo = (p, Rect) => {
		let best, dist
		let x
		let result = DistToLineEx(p, Rect.Top, Rect.Left)
		let tempResult = { nearest: {}, result: 0 }
		let fResult = { nearest: {}, result: 0 }

		fResult = result.nearest
		best = result.result

		tempResult = DistToLineEx(p, Rect.Left, Rect.Btm)
		x = tempResult.nearest
		dist = tempResult.result

		if (dist < best) {
			fResult = x
			best = dist
		}

		tempResult = DistToLineEx(p, Rect.Btm, Rect.Right)
		x = tempResult.nearest
		dist = tempResult.result

		if (dist < best) {
			fResult = x
			best = dist
		}

		tempResult = DistToLineEx(p, Rect.Right, Rect.Top)
		x = tempResult.nearest
		dist = tempResult.result

		if (dist < best) {
			fResult = x
			best = dist
		}

		return fResult
	}

	const TruncatedGauss = (Left = 0, Right = 1, CUTOFF = 0) => {
		if (CUTOFF <= 0) CUTOFF = 4.0

		let Result = CUTOFF + 1
		while (Result >= CUTOFF) {
			//need to implement nzRandom
			Result = Math.abs(
				Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
			)
		}

		return (Result / CUTOFF) * (Right - Left) + Left
	}

	const NormalRange = (Min, Max, CUTOFF = 0) => {
		if (CUTOFF <= 0) CUTOFF = 4.0

		let Result

		if (Math.random() < 0.5) {
			Result = Math.round((Max + Min) / 2.0 + TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
		} else {
			Result = Math.round((Max + Min) / 2.0 - TruncatedGauss(0, (Max - Min) / 2, CUTOFF))
		}

		return Result
	}

	const rotatePoint = (point, angle, center) => {
		angle = angle * (Math.PI / 180) // Convert to radians
		let rotatedX = Math.round(
			Math.cos(angle) * (point.x - center.x) - Math.sin(angle) * (point.y - center.y) + center.x
		)
		let rotatedY = Math.round(
			Math.sin(angle) * (point.x - center.x) + Math.cos(angle) * (point.y - center.y) + center.y
		)
		return { x: rotatedX, y: rotatedY }
	}

	const RandomPoint = (Rect, CUTOFF = 0) => {
		let Result = {}
		let a = Math.atan2(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.y)
		let x = (Rect.Top.x + Rect.Right.x + Rect.Btm.x + Rect.Left.x) / 4
		let y = (Rect.Top.y + Rect.Right.y + Rect.Btm.y + Rect.Left.y) / 4
		let x1 = x - Math.hypot(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.x) / 2
		let y1 = y - Math.hypot(Rect.Left.y - Rect.Btm.y, Rect.Left.x - Rect.Btm.x) / 2
		let x2 = x + Math.hypot(Rect.Left.y - Rect.Top.y, Rect.Left.x - Rect.Top.x) / 2
		let y2 = y + Math.hypot(Rect.Left.y - Rect.Btm.y, Rect.Left.x - Rect.Btm.x) / 2

		Result.x = Math.round(NormalRange(x1 + 1, x2 - 1, CUTOFF))
		Result.y = Math.round(NormalRange(y1 + 1, y2 - 1, CUTOFF))

		let center = {}
		center.x = (x2 + x1) / 2 + Math.random() - 0.5
		center.y = (y2 + y1) / 2 + Math.random() - 0.5
		return rotatePoint(Result, a, center)
	}

	const SkewedRand = (Mode, Lo, Hi, CUTOFF = 0) => {
		let top = Lo

		if (CUTOFF <= 0) CUTOFF = 4.0

		if (Math.random() * (Hi - Lo) > Mode - Lo) top = Hi

		let Result = CUTOFF + 1

		while (Result >= CUTOFF) {
			//todo: implement nzRandom
			Result = Math.abs(
				Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
			)
		}

		return (Result / CUTOFF) * (top - Mode) + Mode
	}

	const Rowp = (from, rect, force = -0.9, Smoothness = Math.PI / 12) => {
		let p = {}
		let e = {}
		let t, dist
		let Result = {}

		p = RandomPoint(rect, 4.0 / 1.5)

		e = NearestEdgeTo(p, rect)

		dist = Math.hypot(p.x - e.x, p.y - e.y)

		t = Math.atan2(p.y - from.y, p.x - from.x) + (Math.random() - 0.5) * Smoothness
		Result.x = Math.round(p.x + Math.cos(t) * SkewedRand(dist * force, 0, dist))
		Result.y = Math.round(p.y + Math.sin(t) * SkewedRand(dist * force, 0, dist))

		return Result
	}

	const clearPixel = (context, i, canvasData) => {
		canvasData.data[i + 0] = 0
		canvasData.data[i + 1] = 0
		canvasData.data[i + 2] = 0
		canvasData.data[i + 3] = 0
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
			//setTimeout(clearPixel, 1500, context, i, canvasData) //something wrong with this? it's clearing all dots every 1500 instead of the timed out ones.
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
