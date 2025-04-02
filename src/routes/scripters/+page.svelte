<script lang="ts">
	import { page } from "$app/state"
	import Paginator from "$lib/components/Paginator.svelte"
	import { replaceQuery } from "$lib/client/utils"
	import Head from "$lib/components/Head.svelte"
	import ScripterCard from "./ScripterCard.svelte"

	let { data } = $props()

	let { scripters, count, amount } = $derived(data)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())
</script>

<Head
	title="Scripters"
	description="List of scripters and developers that are behind the project directly and/or indirerectly."
	keywords="Scripters, Developers"
/>

<main class="min-h-screen max-w-screen">
	<header class="py-8 text-center">
		<h3>Welcome to the Developers section.</h3>
		<p>
			Here you can find information about the developers involved directly or indirectly with
			WaspScripts.
		</p>
	</header>

	<input
		type="text"
		placeholder="🔍 Search username, name, info, ..."
		class="input mx-auto my-8 max-w-3xl"
		bind:value={search}
		oninput={() =>
			replaceQuery(page.url, {
				page: "1",
				search: search
			})}
	/>

	<div class="grid-cols-auto m-auto grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
		{#each scripters as scripter (scripter.url)}
			<ScripterCard {scripter} />
		{/each}
	</div>

	<Paginator data={scripters} {currentPage} bind:pageSize={amount} {count} />
</main>
