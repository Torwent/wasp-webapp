<script lang="ts">
	import { page } from "$app/stores"
	import { formatTime, formatNumber } from "$lib/utils"
	export let id: string | undefined

	let { supabaseClient } = $page.data
	$: ({ supabaseClient } = $page.data)

	async function getStats() {
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
	{#await getStats()}
		<h4>Total Experience Gained: Loading...</h4>
		<h4>Total Gold Gained: Loading...</h4>
		<h4>Total Runtime: Loading...</h4>
	{:then stats}
		<h4>Total Experience Gained: {stats ? formatNumber(stats.experience) : "Loading..."}</h4>
		<h4>Total Gold Gained: {stats ? formatNumber(stats.gold) : "Loading..."}</h4>
		<h4>Total Runtime: {stats ? formatTime(stats.runtime) : "Loading..."}</h4>
	{/await}
</header>
