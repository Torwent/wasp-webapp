<script context="module">
	import { load } from "./_slug"
	import { marked } from "marked"
	export { load }
</script>

<script>
	import { fade } from "svelte/transition"
	export let currentScript
</script>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>
	<article class="prose py-6 border-t-2 border-stone-300 dark:border-stone-800">
		{@html marked.parse(currentScript.content)}
	</article>
</div>
