<script>
	import { writable } from "svelte/store"
	import { fade, fly } from "svelte/transition"
	import { scripts, categories, subcategories, loadData } from "$lib/stores/stores.js"
	import Card from "$lib/components/Card.svelte"

	loadData("scripts", scripts)
	loadData("categories", categories)
	loadData("subcategories", subcategories)

	let searchQuery = ""
	let filteredScripts = []
	let placeholderText = "Search posts..."
	const checkboxes = writable([])

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
		filteredScripts = $scripts
		placeholderText = "Search scripts..."
		if (searchQuery === "") return

		filteredScripts = $scripts.filter((script) => script.title.fuzzy(searchQuery))
		if (filteredScripts.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}

	const handleFilters = () => {
		searchQuery = ""
		filteredScripts = []
		filteredScripts = $scripts
		let checked = $checkboxes
			.filter((checkbox) => checkbox.checked)
			.map((checkbox) => checkbox.name)

		if (checked.length === 0) return

		filteredScripts = $scripts.filter((script) => {
			let allCat = [...script.categories, ...script.subcategories]

			return allCat.some((c) => checked.includes(c))
		})
	}

	$: {
		checkboxes.update(() => [])
		let id = 0
		for (let category of $categories) {
			id++
			checkboxes.update((value) => [
				...value,
				{ id: id, name: category.name, emoji: category.emoji, main: true, checked: false }
			])

			for (let subcategory of $subcategories) {
				if (category.name === subcategory.category) {
					id++
					checkboxes.update((value) => [
						...value,
						{
							id: id,
							name: subcategory.name,
							emoji: subcategory.emoji,
							main: false,
							checked: false
						}
					])
				}
			}
		}
	}
</script>

<svelte:head>
	<title>OSRS bot scripts - Waspscripts</title>
	<meta
		name="description"
		content="Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	/>
</svelte:head>

<div class="flex max-h-screen" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div
		class="w-64 border-r dark:border-stone-800 sticky bottom-0 min-h-full overflow-y-scroll no-scrollbar"
		in:fly={{ duration: 600, delay: 600, x: -100 }}
		out:fly={{ duration: 300, x: -100 }}
	>
		<h4 class="text-center py-6">Categories</h4>
		<div class="flex justify-center font-semibold text-sm">
			<div>
				{#each $checkboxes as checkbox}
					<div class="flex py-0.5">
						{#if !checkbox.main}
							<div class="w-4 h-2 " />
						{/if}
						<div
							id={"checkboxdiv" + checkbox.id}
							class:font-thin={!checkbox.main}
							on:change={() => handleFilters()}
						>
							<input
								class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-amber-500"
								type="checkbox"
								id={"checkbox" + checkbox.id}
								bind:checked={checkbox.checked}
							/>
							<label
								class="form-check-label inline-block cursor-pointer dark:hover:text-amber-100 hover:text-orange-400"
								for={"checkbox" + checkbox.id}
								class:text-amber-500={checkbox.checked}
							>
								{checkbox.name + checkbox.emoji}
							</label>
						</div>
					</div>
					{#if checkbox.id === 2}
						<br />
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<div class="overflow-y-scroll no-scrollbar max-h-full">
		<form class="form my-6 place-items-center" on:submit|preventDefault={handleSearch}>
			<div class="flex flex-col text-sm mb-2 max-w-2xl m-auto">
				<input
					type="text"
					bind:value={searchQuery}
					name="search"
					placeholder={placeholderText}
					class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				/>
			</div>
		</form>

		<div
			class="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 sm:px-20 container gap-6 mx-auto xl:max-w-full lg:max-w-6xl md:max-w-4xl sm:max-w-xl content-start pt-10 xl:px-12"
		>
			{#if filteredScripts.length !== 0}
				{#each filteredScripts as script}
					<Card {script} />
				{/each}
			{:else if $scripts}
				{#each $scripts as script}
					<Card {script} />
				{/each}
			{:else}
				Loading scripts...
			{/if}
		</div>
		<div class="h-24 w-72" />
	</div>
</div>
