<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import type { FAQEntry } from "$lib/backend/types"
	import { slide } from "svelte/transition"

	let show = false
	export let entry: FAQEntry
</script>

<button
	type="button"
	class="inline-flex text-left justify-between w-full border shadow-sm px-4 py-2 text-sm font-medium
		border-stone-100 bg-stone-50 hover:bg-stone-100 hover:border-stone-200
		dark:border-stone-600 dark:bg-stone-700
		dark:hover:bg-stone-600 dark:hover:border-stone-700"
	aria-expanded={show}
	aria-haspopup="true"
	on:click={() => (show = !show)}
>
	{entry.title}
	<svg
		class="mr-1 ml-2 h-5 w-5"
		class:rotate-180={show}
		xmlns="http://www.w3.org/2000/svg"
		fill="currentColor"
		aria-hidden="true"
	>
		<path
			fill-rule="evenodd"
			d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
			clip-rule="evenodd"
		/>
	</svg>
</button>
{#if show}
	<article
		in:slide={{ duration: 300 }}
		out:slide={{ duration: 300 }}
		class="prose dark:prose-invert p-6 bg-stone-300 dark:bg-surface-800 max-w-full"
	>
		<Markdown src={entry.content} />
	</article>
{/if}
