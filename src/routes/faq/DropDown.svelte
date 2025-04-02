<script lang="ts">
	import { slide } from "svelte/transition"
	import DropDownEntry from "./DropDownEntry.svelte"
	import ChevronsDownUp from "svelte-lucide/ChevronsDownUp.svelte"
	import ChevronsUpDown from "svelte-lucide/ChevronsUpDown.svelte"
	import type { FAQEntry } from "$lib/types/collection"
	const { title, entries }: { title: string; entries: FAQEntry[] } = $props()

	let show = $state(false)
	let searchQuery = $state("")
	let filteredEntries: FAQEntry[] = $state([])
	let placeholderText = $state("Search...")

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

	function handleSearch(e: SubmitEvent) {
		e.preventDefault()
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
		class="preset-outlined-surface-500 hover:preset-outlined-primary-500 inline-flex w-full justify-between px-4 py-2 text-sm font-medium"
		aria-expanded={show}
		aria-haspopup="true"
		onclick={() => (show = !show)}
	>
		{title}
		{#if show}<ChevronsDownUp class="h-5" />{:else}<ChevronsUpDown class="h-5" />{/if}
	</button>
	{#if show}
		<div in:slide={{ duration: 200 }} out:slide={{ duration: 150 }}>
			<form onsubmit={handleSearch} onchange={(e) => e.currentTarget.requestSubmit()}>
				<input
					name="search"
					placeholder={placeholderText}
					autocomplete="off"
					class="input hover:preset-outlined-primary-500 my-1 rounded-none font-semibold"
					bind:value={searchQuery}
				/>
			</form>
			{#if filteredEntries.length !== 0}
				{#each filteredEntries as entry (entry.title)}
					<DropDownEntry {entry} />
				{/each}
			{:else}
				{#each entries as entry (entry.title)}
					<DropDownEntry {entry} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
