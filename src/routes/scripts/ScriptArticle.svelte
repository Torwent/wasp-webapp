<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"
	let { content = "" } = $props()
</script>

<header class="text-secondary-500 my-8 text-center">
	<span class="text-2xl">Description:</span>
</header>

<div
	class="preset-outlined-surface-500 mx-auto my-8 max-h-[50rem] w-full max-w-4xl overflow-auto rounded-md p-8"
>
	<article class="text-md prose dark:prose-invert m-8 mb-12 max-w-lg md:max-w-7xl md:text-xl">
		<Markdown src={content} />
	</article>
</div>
