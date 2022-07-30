<script lang="ts">
	import { fade } from "svelte/transition"
	import { profile } from "$lib/stores/authStore"
	import { posts, loadData } from "$lib/stores/stores"
	import PostCard from "$lib/components/PostCard.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	loadData("posts", posts)

	let searchQuery = ""
	let filteredPosts = []
	let placeholderText = "Search posts..."
	let basicEnabled = false
	let intermediateEnabled = false
	let advancedEnabled = false

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
		filteredPosts = $posts
		placeholderText = "Search posts..."
		if (searchQuery === "") return

		filteredPosts = $posts.filter((post) => post.title.fuzzy(searchQuery))
		if (filteredPosts.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}

	const handleFilters = () => {
		filteredPosts = $posts
		if (!basicEnabled && !intermediateEnabled && !advancedEnabled) return

		filteredPosts = $posts.filter(
			(post: { level: number }) =>
				(basicEnabled && post.level === 0) ||
				(intermediateEnabled && post.level === 1) ||
				(advancedEnabled && post.level === 2)
		)
	}
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
					bind={basicEnabled}
					on:click={() => (basicEnabled = !basicEnabled)}
				>
					Basic tutorial
				</button>
				<button
					type="submit"
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-full bg-orange-400 dark:bg-orange-500 border-orange-600 dark:border-orange-300 text-white"
					class:border-r-8={intermediateEnabled}
					class:pr-6={intermediateEnabled}
					bind={intermediateEnabled}
					on:click={() => (intermediateEnabled = !intermediateEnabled)}
				>
					Intermidiate tutorial
				</button>
				<button
					type="submit"
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-full bg-red-400 dark:bg-red-500 border-red-600 dark:border-red-300 text-white"
					class:border-r-8={advancedEnabled}
					class:pr-6={advancedEnabled}
					bind={advancedEnabled}
					on:click={() => (advancedEnabled = !advancedEnabled)}
				>
					Advanced tutorial
				</button>
			</div>
		</form>

		<form class="form my-6" on:submit|preventDefault={handleSearch}>
			<div class="flex flex-col text-sm mb-2">
				<input
					type="text"
					bind:value={searchQuery}
					name="search"
					placeholder={placeholderText}
					class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				/>
			</div>
		</form>
	</div>

	{#if $profile.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
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
		{#if filteredPosts.length !== 0}
			{#each filteredPosts as p}
				<PostCard post={p} />
			{/each}
		{:else if $posts}
			{#each $posts as p}
				<PostCard post={p} />
			{/each}
		{:else}
			Loading posts...
		{/if}
	</div>
</div>
