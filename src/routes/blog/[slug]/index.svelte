<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import { profile } from "$lib/stores/authStore"
	import Markdown from "$lib/Markdown.svelte"
	import { fade } from "svelte/transition"
	export let post
</script>

<svelte:head>
	<title>{post.title} - Waspscripts</title>
	<meta name="description" content={post.description} />
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
	<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>

	{#if $profile.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
		<div class="grid place-items-center">
			<a href="/blog/{encodeURI(post.title)}/edit">
				<button
					data-mdb-ripple="true"
					data-mdb-ripple-color="light"
					class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center justify-between 
			bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
				>
					Edit
				</button>
			</a>
		</div>
	{/if}

	<article class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800">
		<Markdown src={post.content} />
	</article>
</div>
