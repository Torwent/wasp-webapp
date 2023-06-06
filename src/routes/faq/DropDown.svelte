<script lang="ts">
	import { slide } from "svelte/transition"
	import DropDownEntry from "./DropDownEntry.svelte"
	import { search } from "$lib/utils"
	import type { FAQEntry } from "$lib/backend/types"
	import { ChevronsDownUp, ChevronsUpDown } from "lucide-svelte"
	export let title: string
	export let entries: FAQEntry[]

	let show = false

	let searchQuery = "",
		filteredEntries: FAQEntry[] = [],
		placeholderText = "Search..."

	const handleSearch = () => {
		filteredEntries = entries
		placeholderText = "Search..."
		if (searchQuery === "" || entries == null) return

		filteredEntries = entries.filter((entry: FAQEntry) => search(entry.title, searchQuery))
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
		aria-expanded={show}
		aria-haspopup="true"
		on:click={() => (show = !show)}
	>
		{title}
		{#if show}
			<ChevronsDownUp class="h-5" />
		{:else}
			<ChevronsUpDown class="h-5" />
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
							bg-stone-50 hover:bg-stone-100 dark:bg-stone-700 dark:hover:bg-stone-600
							placeholder-secondary-500 text-primary-500"
						/>
					</div>
				</form>
			</div>
			{#if filteredEntries.length !== 0}
				{#each filteredEntries as entry}
					<DropDownEntry {entry} />
				{/each}
			{:else}
				{#each entries as entry}
					<DropDownEntry {entry} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
