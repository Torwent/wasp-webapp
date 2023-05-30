<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import type { PageData } from "./$types"
	import { browser } from "$app/environment"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import PostCard from "./PostCard.svelte"
	export let data: PageData

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search: string
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"

	const levelStr = $page.url.searchParams.get("level") || "-1"
	let level =
		Number(levelStr) < -1 || Number(levelStr) > 2 || Number.isNaN(Number(levelStr))
			? -1
			: Number(levelStr)

	function replaceQuery(values: Record<string, string>) {
		const currentURL = window.location.toString()

		const url = new URL(currentURL)
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else url.searchParams.delete(k)
		}
		history.replaceState({}, "", url)
		invalidate("tutorials:posts")
	}

	function sort() {
		search = ""
		ascending = !ascending
		replaceQuery({
			ascending: ascending ? "true" : "false"
		})
	}

	const range = data.range
	const count = (data.count as number) || 0
	const totalPages = Math.ceil(count / range)

	onMount(() => replaceQuery({ search: search }))

	$: if (browser) replaceQuery({ page: currentPage.toString() })
	$: if (browser) replaceQuery({ search: search })
	$: if (browser) replaceQuery({ level: level.toString() })
</script>

<svelte:head>
	<MetaTags
		title="Tutorials"
		description="Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	/>
</svelte:head>

<main>
	<header class="text-center py-8">
		<h3>Welcome to the DevBlog.</h3>
		<p>Here you can find guides, tutorials and feature annoucements.</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h3>Filter by level or search the a blog post:</h3></header>
			<div class="justify-center md:flex md:space-x-5 mb-2">
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-sky-400 dark:bg-sky-500 border-sky-600 dark:border-sky-300 text-white"
					class:border-r-8={level === 0}
					class:pr-6={level === 0}
					on:click={() => (level === 0 ? (level = -1) : (level = 0))}
				>
					Basic tutorial
				</button>
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-orange-400 dark:bg-orange-500 border-orange-600 dark:border-orange-300 text-white"
					class:border-r-8={level === 1}
					class:pr-6={level === 1}
					on:click={() => (level === 1 ? (level = -1) : (level = 1))}
				>
					Intermidiate tutorial
				</button>
				<button
					class="w-full my-2 md:w-auto text-xs py-1 px-8 font-bold rounded-md bg-red-400 dark:bg-red-500 border-red-600 dark:border-red-300 text-white"
					class:border-r-8={level === 2}
					class:pr-6={level === 2}
					on:click={() => (level === 2 ? (level = -1) : (level = 2))}
				>
					Advanced tutorial
				</button>
				<button on:click={sort}>
					<svg
						class="stroke-primary-500"
						class:rotate-180={!ascending}
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path stroke-width="2" d="M12 5v14m6-8l-6-6m-6 6l6-6" />
					</svg>
				</button>
			</div>
			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="search"
						placeholder="Search script id, name, categories, author,..."
						class="input"
						bind:value={search}
					/>
				</div>
			</div>
		</div>
		{#if data.profile && data.profile.profiles_protected.administrator}
			<a href="/tutorials/add" class="flex mx-auto">
				<button class="btn variant-filled-secondary flex mx-auto">Add Post</button>
			</a>
		{/if}
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#if data.posts}
			{#each data.posts as post}
				<PostCard bind:post />
			{/each}
		{/if}
	</div>

	<nav class="flex justify-between items-center pt-4" aria-label="Table navigation">
		<span class="text-sm font-normal text-stone-500 dark:text-stone-400">
			Showing
			<span class="font-semibold text-stone-900 dark:text-white">
				{(currentPage - 1) * range + 1}-{(currentPage - 1) * range + range + 1}
			</span>
			of
			<span class="font-semibold text-stone-900 dark:text-white">{count}</span>
		</span>
		<ul class="inline-flex items-center -space-x-px">
			<li>
				<button
					class="block py-2 px-3 ml-0 leading-tight text-stone-500 bg-white rounded-l-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					on:click={() =>
						replaceQuery({ page: (currentPage - 1 > 0 ? currentPage - 1 : 1).toString() })}
				>
					<span class="sr-only">Previous</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</li>

			{#each Array(totalPages) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
						on:click={() => replaceQuery({ page: Number(idx + 1).toString() })}
						class:text-primary-500={currentPage === idx + 1}
						class:dark:text-primary-400={currentPage === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}

			<li>
				<button
					class="block py-2 px-3 leading-tight text-stone-500 bg-white rounded-r-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
					on:click={() =>
						replaceQuery({
							page: (currentPage + 1 < totalPages ? currentPage + 1 : totalPages).toString()
						})}
				>
					<span class="sr-only">Next</span>
					<svg
						class="w-5 h-5"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</li>
		</ul>
	</nav>
</main>
