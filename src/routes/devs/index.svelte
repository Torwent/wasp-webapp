<script lang="ts">
	import { fade } from "svelte/transition"
	import { devs, loadData } from "$lib/stores/stores"
	import DevCard from "$lib/components/DevCard.svelte"
	loadData("devs", devs)

	let searchQuery = ""
	let filteredDevs = []
	let placeholderText = "Search devs..."

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
		filteredDevs = $devs
		placeholderText = "Search devs..."
		if (searchQuery === "") return

		filteredDevs = $devs.filter((post) => post.title.fuzzy(searchQuery))
		if (filteredDevs.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}
</script>

<svelte:head>
	<title>Developers - Waspscripts</title>
	<meta
		name="description"
		content="List of developers that are behind the project directly and/or indirerectly."
	/>
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="text-center py-8">
		<h3>Welcome to the Devs setion.</h3>
		<p>
			Here you can find information about the developers that made <b>WaspScripts</b> possible.
		</p>
		<p>
			Only <b>Torwent</b> works for <b>WaspScripts</b> but without their work none of this would be possible.
		</p>
	</header>
	<div class="py-6">
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

	<div class="overflow-hidden">
		{#if filteredDevs.length !== 0}
			{#each filteredDevs as d}
				<DevCard dev={d} />
			{/each}
		{:else if $devs}
			{#each $devs as d}
				<DevCard dev={d} />
			{/each}
		{:else}
			Loading devs...
		{/if}
	</div>
</div>
