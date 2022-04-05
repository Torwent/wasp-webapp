<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	import { fade } from "svelte/transition"
	export let script

	console.log(script.categories.includes("Free"))
</script>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div class="group w-full">
		<img class="inset-0 z-0 object-none h-96 w-full" src={script.cover_img} alt="missing img" />

		<div class="text-center w-full h-32 absolute inset-0 z-10 top-80 text-amber-500">
			<h1 class="mb-4 font-bold text-4xl">{script.title}</h1>
			<h2 class="font-semibold leading-normal mb-4">{script.description}</h2>
		</div>
		<!-- Hover Effect -->
		<div
			class="absolute top-96
                    h-16 w-full px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-black/20 via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
		/>
	</div>

	<div class="container mx-auto my-6 max-w-2xl flex-grow">
		{#if script.categories.includes("Free")}
			This is a free script.
		{:else if script.categories.includes("Premium")}{/if}

		<article class="prose dark:prose-invert py-6">
			<Markdown src={script.content} />
		</article>
	</div>
</div>
