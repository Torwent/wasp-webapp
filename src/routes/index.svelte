<script>
	import Discord from "$lib/components/Discord.svelte"
	import { fade } from "svelte/transition"
</script>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
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
		For more information, help and/or questions look through the <a href="/faq">FAQ</a> or join the discord
		community!
	</h2>
	<Discord />
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
