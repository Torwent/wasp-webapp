<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import { fade } from "svelte/transition"
	import Markdown from "$lib/Markdown.svelte"
	export let post
</script>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>
	<article class="markdown-body py-6 border-t-2 border-stone-300 dark:border-stone-800">
		<Markdown src={post.content} />
	</article>
</div>

<style>
	.markdown-body {
		background-color: transparent;
	}

	.markdown-body {
		--color-accent-fg: orange;
	}
</style>
