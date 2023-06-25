<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import type { ErrorEntry, FAQEntry } from "$lib/types/collection"
	import { ChevronsDownUp, ChevronsUpDown } from "lucide-svelte"
	import { slide } from "svelte/transition"

	let show = false
	export let entry: FAQEntry | ErrorEntry
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
	{#if show}
		<ChevronsDownUp class="h-4" />
	{:else}
		<ChevronsUpDown class="h-4" />
	{/if}
</button>
{#if show}
	<article
		in:slide={{ duration: 200 }}
		out:slide={{ duration: 150 }}
		class="prose dark:prose-invert p-6 bg-stone-300 dark:bg-surface-800 max-w-full"
	>
		<Markdown src={entry.content} />
	</article>
{/if}
