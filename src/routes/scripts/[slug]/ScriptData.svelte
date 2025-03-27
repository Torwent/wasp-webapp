<script lang="ts">
	import { page } from "$app/state"
	import { formatNumber } from "$lib/utils"
	const { id } = $props()

	const authorButtons = ["none", "Currently Online", "All Downloads", "Downloads this month"]
	let selectedBtn = $state("none")

	async function getScriptStats() {
		const { data, error: err } = await page.data.supabaseClient
			.schema("scripts")
			.from("stats_simba")
			.select(
				"experience, gold, runtime, levels, unique_users, unique_users_total, online_users, online_users_total"
			)
			.eq("id", id)
			.single()

		if (err) {
			console.error(err)
			return {
				experience: 0,
				gold: 0,
				runtime: 0,
				levels: 0,
				unique_users: [],
				unique_users_total: 0,
				online_users: [],
				online_users_total: 0
			}
		}

		return data
	}

	async function getScriptData() {
		const { data, error: err } = await page.data.supabaseClient
			.schema("scripts")
			.from("stats_site")
			.select(
				"unique_downloads, unique_downloads_total, month_downloads, month_downloads_total, previous_months"
			)
			.eq("id", id)
			.single()

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

		return data
	}

	const scriptStats = getScriptStats()
	const scriptData = getScriptData()
</script>

<header class="text-center">
	<div class="btn-group flex-col p-2 preset-outlined-surface-200-800 md:flex-row">
		{#each authorButtons as btn, idx}
			{#if idx > 0}
				<button
					class="btn w-full {selectedBtn === btn ? 'preset-filled' : 'hover:preset-tonal'} "
					onclick={() => {
						if (selectedBtn === btn) selectedBtn = authorButtons[0]
						else selectedBtn = btn
					}}
				>
					{btn}
				</button>
			{/if}
		{/each}
	</div>

	{#if selectedBtn === authorButtons[1]}
		<h4>
			Currently Online:
			{#await scriptStats}
				Loading...
			{:then data}
				{formatNumber(data.online_users_total)}
			{/await}
		</h4>

		<div class="text-small max-h-[10rem] overflow-auto preset-outlined-surface-500">
			{#await scriptStats}
				Loading...
			{:then data}
				{#each data.online_users as user}
					{#if user && Object.values(user).length > 0}
						{Object.values(user)[0]}
						<br />
					{/if}
				{/each}
			{/await}
		</div>
	{:else if selectedBtn === authorButtons[2]}
		<h4>
			Total downloads:
			{#await scriptData}
				Loading...
			{:then data}
				{formatNumber(data.unique_downloads_total)}
			{/await}
		</h4>

		<div class="text-small max-h-[10rem] overflow-auto preset-outlined-surface-500">
			{#await scriptData}
				Loading...
			{:then data}
				{#each data.unique_downloads as user}
					{user}
					<br />
				{/each}
			{/await}
		</div>
	{:else if selectedBtn === authorButtons[3]}
		<h4>
			Total downloads/month:
			{#await scriptData}
				Loading...
			{:then data}
				{formatNumber(data.month_downloads_total)}
			{/await}
		</h4>

		<div class="text-small max-h-[10rem] overflow-auto preset-outlined-surface-500">
			{#await scriptData}
				Loading...
			{:then data}
				{#each data.month_downloads as user}
					{user}
					<br />
				{/each}
			{/await}
		</div>
	{/if}
</header>
