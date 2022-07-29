<script lang="ts">
	import { slide } from "svelte/transition"
	import DropDownEntry from "./DropDownEntry.svelte"
	export let title
	export let entries

	let show = false

	let searchQuery = ""
	let filteredEntries = []
	let placeholderText = "Search..."

	String.prototype.fuzzy = function (s) {
		var hay = this.toLowerCase(),
			i = 0,
			n = -1,
			l
		s = s.toLowerCase()
		for (; (l = s[i++]); ) if (!~(n = hay.indexOf(l, n + 1))) return false
		return true
	}

	const handleSearch = () => {
		filteredEntries = $entries
		placeholderText = "Search..."
		if (searchQuery === "") return

		filteredEntries = $entries.filter((e) => e.title.fuzzy(searchQuery))
		if (filteredEntries.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}
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
			<div>
				<form class="form" on:submit|preventDefault={handleSearch}>
					<div class="flex flex-col text-sm">
						<input
							type="text"
							bind:value={searchQuery}
							name="search"
							placeholder={placeholderText}
							autocomplete="off"
							class="appearance-none border px-4 py-2 focus:outline-none font-semibold 
							border-stone-100 hover:border-stone-200
							dark:border-stone-600 dark:hover:border-stone-700
							bg-stone-50 hover:bg-stone-100  dark:bg-stone-700 dark:hover:bg-stone-600
							placeholder-amber-600 dark:placeholder-amber-200
							text-amber-500 dark:text-amber-400
							focus:text-amber-600 dark:focus:text-amber-300"
						/>
					</div>
				</form>
			</div>
			{#if filteredEntries.length !== 0}
				{#each filteredEntries as entry}
					<DropDownEntry {entry} />
				{/each}
			{:else}
				{#each $entries as entry}
					<DropDownEntry {entry} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
