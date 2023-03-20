<script lang="ts">
	import type { Post } from "$lib/database/types"
	import { fade } from "svelte/transition"
	import { profile, updateProfile } from "$lib/stores/authStore"
	import PostCard from "./PostCard.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import type { PageData } from "./$types"
	import { createSearchStore, searchHandler } from "$lib/stores/search"
	import { onDestroy } from "svelte"

	export let data: PageData

	updateProfile()

	let basicEnabled = false
	let intermediateEnabled = false
	let advancedEnabled = false

	const searchStats: Post[] = data.posts.map((post: Post) => ({
		...post,
		searchTerms: `${post.title} ${post.description} ${post.content} ${post.author}`,
		filters: `${post.level}`
	}))

	const searchStore = createSearchStore(searchStats)

	let filters: number[] = []

	function handleFilters() {
		if (basicEnabled) {
			if (filters.indexOf(0) === -1) filters.push(0)
		} else
			filters = filters.filter((item) => {
				return item !== 0
			})

		if (intermediateEnabled) {
			if (filters.indexOf(1) === -1) filters.push(1)
		} else
			filters = filters.filter((item) => {
				return item !== 1
			})

		if (advancedEnabled) {
			if (filters.indexOf(2) === -1) filters.push(2)
		} else
			filters = filters.filter((item) => {
				return item !== 2
			})

		$searchStore.filters = filters
	}

	const unsubscribe = searchStore.subscribe((model) => searchHandler(model))

	onDestroy(() => unsubscribe())
</script>

<svelte:head>
	<MetaTags
		title="Dev Blog"
		description="Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
		url="/blog"
	/>
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="text-center py-8">
		<h3>Welcome to the DevBlog.</h3>
		<p>Here you can find guides, tutorials and feature annoucements.</p>
	</header>
	<div class="py-6">
		<form class="text-center form my-6" on:submit|preventDefault={handleFilters}>
			<header class="py-4"><h3>Filter by level or search the a blog post:</h3></header>
			<div class="justify-center md:flex md:space-x-5 mb-2">
				<button
					type="submit"
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-full bg-sky-400 dark:bg-sky-500 border-sky-600 dark:border-sky-300 text-white"
					class:border-r-8={basicEnabled}
					class:pr-6={basicEnabled}
					on:click={() => (basicEnabled = !basicEnabled)}
				>
					Basic tutorial
				</button>
				<button
					type="submit"
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-full bg-orange-400 dark:bg-orange-500 border-orange-600 dark:border-orange-300 text-white"
					class:border-r-8={intermediateEnabled}
					class:pr-6={intermediateEnabled}
					on:click={() => (intermediateEnabled = !intermediateEnabled)}
				>
					Intermidiate tutorial
				</button>
				<button
					type="submit"
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-full bg-red-400 dark:bg-red-500 border-red-600 dark:border-red-300 text-white"
					class:border-r-8={advancedEnabled}
					class:pr-6={advancedEnabled}
					on:click={() => (advancedEnabled = !advancedEnabled)}
				>
					Advanced tutorial
				</button>
			</div>
		</form>

		<div class="flex flex-col text-sm mb-2">
			<input
				type="search"
				placeholder="Search..."
				class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				bind:value={$searchStore.search}
			/>
		</div>
	</div>
	{#if $profile && $profile.administrator}
		<div class="grid place-items-center">
			<a href="/blog/add">
				<button
					data-mdb-ripple="true"
					data-mdb-ripple-color="light"
					class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center justify-between 
		bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
				>
					Add
				</button>
			</a>
		</div>
	{/if}
	<div class="overflow-hidden">
		{#each $searchStore.filtered as post}
			<PostCard {post} />
		{/each}
	</div>
</div>
