<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	export let post
</script>

<main>
	<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>
	<article class="markdown-body border-t-2 border-gray-800">
		<Markdown src={post.content} />
	</article>
</main>

<style>
	.markdown-body {
		background-color: transparent;
	}
</style>
