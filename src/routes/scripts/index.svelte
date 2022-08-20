<script lang="ts">
	import { profile } from "$lib/stores/authStore"
	import { fly } from "svelte/transition"
	import { scripts, categories, subcategories, loadData, search } from "$lib/stores/stores"
	import Card from "$lib/components/ScriptCard.svelte"
	import LinkButton from "$lib/components/LinkButton.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import type { Script } from "$lib/supabaseStorage"

	interface CheckboxType {
		id: number
		name: string
		emoji: string
		main: boolean
		checked: boolean
	}

	loadData("scripts", scripts)
	loadData("categories", categories)
	loadData("subcategories", subcategories)

	let searchQuery = "",
		placeholderText = "Search posts...",
		filteredScripts: Script[] = [],
		checkboxes: CheckboxType[] = []

	//handles the search field
	const handleSearch = () => {
		filteredScripts = $scripts
		placeholderText = "Search scripts..."
		if (searchQuery === "") return

		filteredScripts = $scripts.filter((script: Script) => search(script.title, searchQuery))
		if (filteredScripts.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}

	//handles checkbox filters
	const handleFilters = () => {
		searchQuery = ""
		filteredScripts = []
		filteredScripts = $scripts
		let checked = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked)
			.map((checkbox: CheckboxType) => checkbox.name)

		if (checked.length === 0) return

		filteredScripts = $scripts.filter((script: Script) => {
			let allCat = [...script.categories, ...script.subcategories]

			return allCat.some((c) => checked.includes(c))
		})
	}

	//sets up checkboxes to what's available from the database
	const loadCheckboxes = () => {
		if (checkboxes.length > 0) return

		let id = 0

		checkboxes = []

		for (let category of $categories) {
			checkboxes.push({
				id: id++,
				name: category.name,
				emoji: category.emoji,
				main: true,
				checked: false
			})

			for (let subcategory of $subcategories) {
				if (category.name === subcategory.category) {
					checkboxes.push({
						id: id++,
						name: subcategory.name,
						emoji: subcategory.emoji,
						main: false,
						checked: false
					})
				}
			}
		}
	}

	// make sure categories and subcategories are both loaded to run loadCheckboxes()
	$: if ($categories.length > 0 && $subcategories.length > 0) loadCheckboxes()

	//this is a svelte hack. since checkboxes.push() in loadCheckboxes() don't trigger checkboxes update we reset it to be equals to itself to force an update
	$: checkboxes = checkboxes
</script>

<svelte:head>
	<meta
		name="description"
		content="Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	/>
	<MetaTags
		title="Scripts"
		description="Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
		url="/scripts"
	/>
</svelte:head>

<div class="flex absolute min-h-screen inset-0 overflow-x-hidden">
	<div
		class="w-64 border-r dark:border-stone-800 sticky bottom-0 min-h-full overflow-y-scroll no-scrollbar pt-16"
		in:fly={{ duration: 600, delay: 600, x: -100 }}
		out:fly={{ duration: 300, x: -100 }}
	>
		<h4 class="text-center py-4">Categories</h4>
		<div class="flex justify-center font-semibold text-sm">
			<div>
				{#each checkboxes as checkbox}
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
					{#if checkbox.id === 3}
						<br />
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<div
		class="overflow-y-scroll no-scrollbar max-h-full pt-16"
		in:fly={{ duration: 600, delay: 600, x: 100 }}
		out:fly={{ duration: 300, x: 100 }}
	>
		{#if $profile.dev}
			<LinkButton text="Add Script" url="/scripts/add" arrow={false} />
		{/if}
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
		<div class="h-24 w-full" />
	</div>
</div>
