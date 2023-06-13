<script lang="ts">
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import DevCard from "./DevCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	export let data

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search: string

	function replaceQuery(values: Record<string, string>) {
		const currentURL = window.location.toString()

		const url = new URL(currentURL)
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else url.searchParams.delete(k)
		}
		history.replaceState({}, "", url)
		invalidate("developers:devs")
	}

	const { range } = data
	let count = 0
	$: count = (data.count as number) || 0

	onMount(() => replaceQuery({ search: search }))

	$: if (browser) replaceQuery({ page: currentPage.toString() })
	$: if (browser) replaceQuery({ search: search })
</script>

<svelte:head>
	<MetaTags
		title="Developers"
		description="List of developers that are behind the project directly and/or indirerectly."
	/>
</svelte:head>

<main>
	<header class="text-center py-8">
		<h3>Welcome to the DevBlog.</h3>
		<p>Here you can find guides, tutorials and feature annoucements.</p>
	</header>

	<div class="py-6">
		<div class="text-center form my-6">
			<header class="py-4"><h4>Search:</h4></header>
			<div class="max-w-2xl mx-auto justify-center md:flex md:space-x-5 mb-2">
				<div class="w-full flex flex-col text-sm mb-2">
					<input
						type="search"
						placeholder="Search username, name, info, ..."
						class="input"
						bind:value={search}
					/>
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-2xl flex-grow">
		{#if data.devs}
			{#each data.devs as developer}
				<DevCard bind:developer />
			{/each}
		{/if}
	</div>

	<Paginator srcData={"developers:devs"} bind:currentPage {range} bind:count />
</main>
