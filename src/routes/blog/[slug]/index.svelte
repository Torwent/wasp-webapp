<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	import { fade } from "svelte/transition"
	export let post
</script>

<svelte:head>
	<title>Wasp Scripts post: {post.title}</title>
	<meta name="description" content={post.description} />
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>
	<article class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800">
		<Markdown src={post.content} />
	</article>
</div>
