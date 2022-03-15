<script>
	import { slide } from "svelte/transition"
	import Markdown from "$lib/Markdown.svelte"
	let show = false
	export let entry
</script>

<div on:click={() => (show = !show)}>
	<button
		type="button"
		class="inline-flex justify-between w-full border shadow-sm px-4 py-2 text-sm font-medium
		border-stone-100 bg-stone-50 hover:bg-stone-100 hover:border-stone-200
		dark:border-stone-600 dark:bg-stone-700
		dark:hover:bg-stone-600 dark:hover:border-stone-700"
		id="menu-button"
		aria-expanded="true"
		aria-haspopup="true"
	>
		{entry.title}
		{#if show}
			<svg
				class="-mr-1 ml-2 h-5 w-5 rotate-180"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		{:else}
			<svg
				class="-mr-1 ml-2 h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
	</button>
	{#if show}
		<article
			in:slide={{ duration: 300 }}
			out:slide={{ duration: 300 }}
			class="markdown-body border-t-2 border-stone-100 dark:border-stone-800"
		>
			<Markdown src={entry.content} />
		</article>
	{/if}
</div>

<style>
	.markdown-body {
		padding-top: 1rem;
		padding-bottom: 1rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		--tw-bg-opacity: 1;
		--color-accent-fg: orange;
	}

	@media (prefers-color-scheme: light) {
		.markdown-body {
			background-color: rgb(225 225 224);
		}
		.markdown-body:hover {
			background-color: rgb(240 240 240);
		}
	}
	@media (prefers-color-scheme: dark) {
		.markdown-body {
			background-color: rgb(43 38 38);
		}
		.markdown-body:hover {
			background-color: rgb(38 34 33);
		}
	}
</style>
