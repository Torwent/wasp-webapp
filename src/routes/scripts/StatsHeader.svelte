<script lang="ts">
	import { page } from "$app/stores"
	import { formatTime, formatNumber } from "$lib/utils"
	export let id: string | null = null

	const { supabaseClient } = $page.data

	interface Stats {
		experience: number
		gold: number
		runtime: number
	}

	let stats: Stats | null = null

	async function getStats(id: string | null) {
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

	$: getStats(id).then((result) => (stats = result))
</script>

{#if stats}
	<header class="text-center">
		<h4>Total Experience Gained: {formatNumber(stats.experience)}</h4>
		<h4>Total Gold Gained: {formatNumber(stats.gold)}</h4>
		<h4>Total Runtime: {formatTime(stats.runtime)}</h4>
	</header>
{:else if id}
	<header class="text-center">
		<h4>Total Experience Gained: Loading...</h4>
		<h4>Total Gold Gained: Loading...</h4>
		<h4>Total Runtime: Loading...</h4>
	</header>
{/if}
