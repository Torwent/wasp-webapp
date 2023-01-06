<script lang="ts">
	import { profile } from "$lib/stores/authStore"
	import { fly } from "svelte/transition"
	import Card from "./ScriptCard.svelte"
	import LinkButton from "$lib/components/LinkButton.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import type { Category, ScriptCard, SubCategory } from "$lib/database/types"
	import type { PageData } from "./$types"
	import { createSearchStore, searchHandler } from "$lib/stores/search"
	import { onDestroy } from "svelte"

	export let data: PageData

	interface CheckboxType {
		id: number
		name: string
		emoji: string
		main: boolean
		checked: boolean
	}

	//sets up checkboxes to what's available from the database
	let checkboxes: CheckboxType[] = []
	const loadCheckboxes = async () => {
		const categories: Category[] = data.categories
		const subcategories: SubCategory[] = data.subcategories

		let id = 0

		for (let category of categories) {
			checkboxes.push({
				id: id++,
				name: category.name,
				emoji: category.emoji,
				main: true,
				checked: false
			})

			for (let subcategory of subcategories) {
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

	function handleFilters() {
		let filters = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked)
			.map((checkbox: CheckboxType) => checkbox.name)

		$searchStore.filters = filters
	}

	const searchStats: ScriptCard[] = data.scripts.map((script: ScriptCard) => ({
		...script,
		searchTerms: `${script.title} ${script.description} ${script.categories} ${script.subcategories} ${script.author}`,
		filters: `${script.categories} ${script.subcategories}`
	}))

	const searchStore = createSearchStore(searchStats)
	const unsubscribe = searchStore.subscribe((model) => searchHandler(model))

	onDestroy(() => unsubscribe())
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
		{#await loadCheckboxes()}
			<span class="px-4">Loading...</span>
		{:then}
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
		{/await}
	</div>

	<div
		class="w-full overflow-y-scroll no-scrollbar max-h-full pt-16"
		in:fly={{ duration: 600, delay: 600, x: 100 }}
		out:fly={{ duration: 300, x: 100 }}
	>
		{#if $profile.developer}
			<LinkButton text="Add Script" url="/scripts/add" arrow={false} />
		{/if}

		<div class="flex flex-col text-sm mb-2 max-w-2xl m-auto">
			<input
				type="search"
				placeholder="Search script, categories, author,..."
				class="appearance-none shadow-sm border border-amber-200 p-2 focus:outline-none focus:border-amber-500 rounded-lg"
				bind:value={$searchStore.search}
			/>
		</div>

		<div
			class="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 sm:px-20 container gap-6 mx-auto xl:max-w-full lg:max-w-6xl md:max-w-4xl sm:max-w-xl content-start pt-10 xl:px-12"
		>
			{#each $searchStore.filtered as script}
				<Card {script} />
			{/each}
		</div>
		<div class="h-24 w-full place-items-center" />
	</div>
</div>
