<script lang="ts">
	import ChevronsDownUp from "svelte-lucide/ChevronsDownUp.svelte"
	import ChevronsUpDown from "svelte-lucide/ChevronsUpDown.svelte"
	import { slide } from "svelte/transition"

	const data = $props()
	const entry = $state(data.entry)
	let show = $state(false)
</script>

<button
	type="button"
	class="inline-flex w-full justify-between border px-4 py-2 text-left text-sm font-medium shadow-sm
		text-surface-900-100 border-surface-200-800 hover:preset-outlined-primary-500"
	aria-expanded={show}
	aria-haspopup="true"
	onclick={() => (show = !show)}
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
		class="prose max-w-full p-6 preset-outlined-surface-500 dark:prose-invert"
	>
		<!-- {@html entry.content.code
			.replace(/>{@html `<code class="language-/g, '><code class="language-')
			.replace(/<\/code>`}<\/pre>/g, "</code></pre>")} -->
		{@html entry.content.code}
	</article>
{/if}
