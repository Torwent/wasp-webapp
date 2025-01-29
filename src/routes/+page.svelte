<script lang="ts">
	import { page } from "$app/state"
	import { formatTime, formatNumber } from "$lib/utils"
	import Discord from "$lib/components/Discord.svelte"
	import CanvasAnimation from "./CanvasAnimation.svelte"

	const { data } = $props()
	const { totals } = $derived(data)

	const headTitle = "WaspScripts"
	const headDescription =
		"OldSchool RuneScape Color botting at it's best. Color only and fully open-source Simba scripts for OSRS."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts"
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="container mx-auto my-8 max-w-2xl flex-grow">
	<header>
		<h1 class="py-12 text-center text-xl font-bold sm:text-2xl md:text-3xl">
			<div class="py-4">WaspScripts</div>
			<div>
				100%
				<span class="animate-character inline-block bg-clip-text text-transparent">color</span>
				100% open source.
			</div>
		</h1>
	</header>

	<header class="text-lg sm:text-xl md:text-2xl">
		<h2 class="mx-6 mt-6 whitespace-nowrap text-center font-bold">
			Total Experience Earned: {formatNumber(totals.experience)}
		</h2>
		<h2 class="mx-6 whitespace-nowrap text-center font-bold">
			Total Gold Earned: {formatNumber(totals.gold)}
		</h2>
		<h2 class="mx-6 whitespace-nowrap text-center font-bold">
			Total Levels Earned: {formatNumber(totals.levels)}
		</h2>
		<h2 class="mx-6 mb-4 whitespace-nowrap text-center font-bold">
			Total Runtime: {formatTime(totals.runtime)}
		</h2>
	</header>

	<p class="my-12 text-center">
		WaspScripts is a collection of open source color scripts written for Simba on top of SRL and
		WaspLib.
		<br />
		If you are new to Simba and don't know what it is, Simba is just the oldest color botting program
		still around, it's ancestor, SCAR dates back to RuneScape Classic.
	</p>
	<p class="my-6 text-center">
		For more information, help and/or questions look through the
		<a href="/faq" class="decoration-transparent" aria-label="Open frequently asked questions page">
			FAQ
		</a>
		or join the discord community!
	</p>

	<div class="my-6">
		<header>
			<h2 class="py-16 text-center text-2xl font-bold md:text-3xl">
				<span>Advanced mouse movements and click patterns</span>
			</h2>
		</header>

		<CanvasAnimation />
	</div>
</main>

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
