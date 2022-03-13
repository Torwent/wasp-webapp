<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	export let currentScript
</script>

<main>
	<h1 class="mb-4 font-bold text-3xl">{currentScript.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{currentScript.description}</h2>
	<article class="markdown-body border-t-2 border-gray-800">
		<Markdown src={currentScript.content} />
	</article>
</main>

<style>
	.markdown-body {
		background-color: transparent;
	}
</style>
