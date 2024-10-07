<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"

	export let content: string = ""
</script>

<header class="text-center my-8 text-secondary-500">
	<span class="text-2xl">Description:</span>
</header>

<div class="variant-ghost-surface max-h-[50rem] overflow-auto rounded-md max-w-4xl mx-auto">
	<article class="py-6 m-auto prose dark:prose-invert">
		<Markdown src={content} />
	</article>
</div>
