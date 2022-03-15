<script>
	import { slide } from "svelte/transition"
	import DropDownEntry from "./DropDownEntry.svelte"
	export let title
	export let entries

	let show = false
</script>

<div>
	<button
		type="button"
		class="inline-flex justify-between w-full rounded-t border shadow-sm px-4 py-2 text-sm font-medium 
		border-stone-200 bg-stone-100 hover:bg-stone-50
		dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-900"
		id="menu-button"
		aria-expanded="true"
		aria-haspopup="true"
		on:click={() => (show = !show)}
	>
		{title}
		<!-- Heroicon name: solid/chevron-down -->
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
		<div in:slide={{ duration: 700 }} out:slide={{ duration: 300 }}>
			{#each $entries as entry}
				<DropDownEntry {entry} />
			{/each}
		</div>
	{/if}
</div>
