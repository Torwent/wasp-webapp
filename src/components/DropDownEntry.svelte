<script>
	import Markdown from "$lib/Markdown.svelte"
	let show = false
	export let entry
</script>

<div
	class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
	on:click={() => (show = !show)}
>
	<button
		type="button"
		class="inline-flex justify-between w-full border border-gray-500 shadow-sm px-4 py-2 bg-gray-600 text-sm font-medium text-gray-300 hover:bg-gray-500"
		id="menu-button"
		aria-expanded="true"
		aria-haspopup="true"
	>
		{entry.title}
		{#if show}
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
		{:else}
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
		{/if}
	</button>
	{#if show}
		<article class="markdown-body border-t-2 border-gray-800">
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
		background-color: rgb(31 41 55);
	}
	.markdown-body:hover {
		background-color: rgb(55 65 81);
	}
</style>
