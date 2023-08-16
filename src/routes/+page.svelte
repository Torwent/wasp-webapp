<script lang="ts">
	import Discord from "$lib/components/Discord.svelte"
	import CanvasAnimation from "./CanvasAnimation.svelte"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	export let data

	const { supabaseClient } = data
	let { total } = data
	$: ({ total } = data)

	onMount(() => {
		const subscription = supabaseClient
			.channel("home-stats-changed")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "stats"
				},
				() => invalidate("supabase:home_stats_total")
			)
			.subscribe()

		return () => subscription.unsubscribe()
	})

	const headTitle = "WaspScripts"
	const headDescription =
		"OldSchool RuneScape Color botting at it's best. Color only and fully open-source Simba scripts for OSRS."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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
	<meta property="og:url" content={$page.url.href} />
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

<main class="container my-6 mx-auto flex-grow max-w-2xl">
	<header>
		<h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-center py-12">
			<div class="py-4">WaspScripts</div>
			<div>
				100%
				<span class="bg-clip-text animate-character text-transparent inline-block">color</span>
				100% open source.
			</div>
		</h1>
	</header>

	<header class="text-lg sm:text-xl md:text-2xl">
		<h2 class="mt-6 mx-6 font-bold whitespace-nowrap text-center">
			Total Experience Earned: {formatRSNumber(total.experience)}
		</h2>
		<h2 class="mx-6 font-bold whitespace-nowrap text-center">
			Total Gold Earned: {formatRSNumber(total.gold)}
		</h2>
		<h2 class="mx-6 font-bold whitespace-nowrap text-center">
			Total Levels Earned: {total.levels}
		</h2>
		<h2 class="mb-4 mx-6 font-bold whitespace-nowrap text-center">
			Total Runtime: {convertTime(total.runtime)}
		</h2>
	</header>

	<p class="my-12 text-center">
		WaspScripts is a collection of open source color scripts written for Simba on top of SRL and
		WaspLib.
		<br />
		If you are new to Simba and don't know what it is, Simba is just the oldest color botting program
		still around, it's ancestor, SCAR dates back to RuneScape Classic.
	</p>
	<p class="text-center my-6">
		For more information, help and/or questions look through the
		<a href="/faq" class="decoration-transparent" aria-label="Open frequently asked questions page">
			FAQ
		</a>
		or join the discord community!
	</p>

	<Discord />

	<div class="my-6">
		<header>
			<h2 class="text-2xl font-bold text-center md:text-3xl py-16">
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
