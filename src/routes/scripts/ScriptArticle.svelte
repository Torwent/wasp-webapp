<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"
	let { content = "" } = $props()
</script>

<header class="my-8 text-center text-secondary-500">
	<span class="text-2xl">Description:</span>
</header>

<div
	class="mx-auto my-8 max-h-[50rem] max-w-4xl overflow-auto rounded-md p-8 preset-outlined-surface-500"
>
	<article class="text-md prose m-8 mb-12 max-w-lg dark:prose-invert md:max-w-7xl md:text-xl">
		<Markdown src={content} />
	</article>
</div>
