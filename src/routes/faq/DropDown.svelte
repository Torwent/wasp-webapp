<script lang="ts">
	import { slide } from "svelte/transition"
	import DropDownEntry from "./DropDownEntry.svelte"
	import { ChevronsDownUp, ChevronsUpDown } from "lucide-svelte"
	import type { FAQEntry } from "$lib/types/collection"
	export let title: string
	export let entries: FAQEntry[]

	let show = false
	let searchQuery = ""
	let filteredEntries: FAQEntry[] = []
	let placeholderText = "Search..."

	let form: HTMLFormElement

	function search(content: string, search: string) {
		content = content.toLowerCase()
		search = search.toLowerCase()
		let i = 0,
			n = -1,
			l: string

		for (; (l = search[i++]); ) {
			if (!~(n = content.indexOf(l, n + 1))) {
				return false
			}
		}
		return true
	}

	function handleSearch() {
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
		class="inline-flex justify-between w-full rounded-t px-4 py-2 text-sm font-medium variant-ringed-surface hover:variant-ringed-primary"
		aria-expanded={show}
		aria-haspopup="true"
		on:click={() => (show = !show)}
	>
		{title}
		{#if show}<ChevronsDownUp class="h-5" />{:else}<ChevronsUpDown class="h-5" />{/if}
	</button>
	{#if show}
		<div in:slide={{ duration: 200 }} out:slide={{ duration: 150 }}>
			<form on:submit|preventDefault={handleSearch} bind:this={form}>
				<input
					name="search"
					placeholder={placeholderText}
					autocomplete="off"
					class="input font-semibold rounded-none"
					bind:value={searchQuery}
					on:input={() => form.requestSubmit()}
				/>
			</form>
			{#if filteredEntries.length !== 0}
				{#each filteredEntries as entry}
					<DropDownEntry {entry} />
				{/each}
			{:else}
				{#await entries}
					{#each Array(5) as entry}
						<DropDownEntry {entry} />
					{/each}
				{:then entries}
					{#each entries as entry}
						<DropDownEntry {entry} />
					{/each}
				{/await}
			{/if}
		</div>
	{/if}
</div>
