<script lang="ts">
	import { page } from "$app/state"
	import { formatTime, formatNumber } from "$lib/utils"

	let { id = undefined } = $props()

	const { supabaseClient } = $derived(page.data)

	async function getStats(id: string | undefined) {
		if (!id) {
			return {
				experience: Math.random() * 1000000,
				gold: Math.random() * 1000000,
				runtime: Math.random() * 1000000000
			}
		}

		const { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("stats_simba")
			.select("experience, gold, runtime")
			.eq("id", id)
			.single()

		if (err) {
			console.error(err)
			return null
		}

		return data
	}
</script>

<header class="text-center">
	{#await getStats(id) then stats}
		{#if stats}
			{#if stats.experience > 0 || stats.gold > 0 || stats.runtime > 0}
				<h4>Total Experience Gained: {formatNumber(stats.experience)}</h4>
				<h4>Total Gold Gained: {formatNumber(stats.gold)}</h4>
				<h4>Total Runtime: {formatTime(stats.runtime)}</h4>
			{/if}
		{:else}
			<h4>Total Experience Gained: Loading...</h4>
			<h4>Total Gold Gained: Loading...</h4>
			<h4>Total Runtime: Loading...</h4>
		{/if}
	{/await}
</header>
