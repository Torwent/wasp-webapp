<script lang="ts">
	import { page } from "$app/stores"
	import type { StatsSimba } from "$lib/types/collection"
	import { formatRSNumber } from "$lib/utils"
	export let id: string
	export let scriptStats: Promise<StatsSimba>

	const authorButtons = ["none", "online list", "all time downloads", "monthly downloads"]
	let selectedBtn = "none"

	async function getScriptsData() {
		const { data, error: err } = await $page.data.supabaseClient
			.schema("scripts")
			.from("stats_site")
			.select(
				"unique_downloads, unique_downloads_total, month_downloads, month_downloads_total, previous_months"
			)
			.eq("id", id)
			.limit(1)

		if (err) {
			console.error(err)
			return {
				unique_downloads: [],
				unique_downloads_total: 0,
				month_downloads: [],
				month_downloads_total: 0,
				previous_months: []
			}
		}

		return data[0]
	}

	const scriptData = getScriptsData()
</script>

<header class="text-center">
	<div class="my-4 btn-group-vertical md:btn-group variant-ghost justify-evenly">
		{#each authorButtons as btn, idx}
			{#if idx > 0}
				<button
					class="w-full"
					class:variant-glass-primary={selectedBtn === btn}
					on:click={() => {
						if (selectedBtn === btn) selectedBtn = authorButtons[0]
						else selectedBtn = btn
					}}
				>
					View {btn}
				</button>
			{/if}
		{/each}
	</div>

	{#if selectedBtn === authorButtons[1]}
		{#await scriptStats}
			<h4>Total downloads: ...</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">Loading...</div>
		{:then data}
			<h4>Currently online (simba uuids): {formatRSNumber(data.online_users_total)}</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
				{#each data.online_users as user}
					{#if user}
						{Object.values(user)[0]}
						<br />
					{/if}
				{/each}
			</div>
		{/await}
	{:else if selectedBtn === authorButtons[2]}
		{#await scriptData}
			<h4>Total downloads: ...</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">Loading...</div>
		{:then data}
			<h4>Total downloads: {formatRSNumber(data.unique_downloads_total)}</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
				{#each data.unique_downloads as user}
					{user}
					<br />
				{/each}
			</div>
		{/await}
	{:else if selectedBtn === authorButtons[3]}
		{#await scriptData}
			<h4>Total monthly downloads: ...</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">Loading...</div>
		{:then data}
			<h4>Total monthly downloads: {formatRSNumber(data.month_downloads_total)}</h4>

			<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
				{#each data.month_downloads as user}
					{user}
					<br />
				{/each}
			</div>
		{/await}
	{/if}
</header>
