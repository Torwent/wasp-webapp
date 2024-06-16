<script lang="ts">
	import { page } from "$app/stores"
	import { formatNumber } from "$lib/utils"
	export let id: string

	const authorButtons = ["none", "Currently Online", "All Downloads", "Downloads this month"]
	let selectedBtn = "none"

	async function getScriptStats() {
		const { data, error: err } = await $page.data.supabaseClient
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
		const { data, error: err } = await $page.data.supabaseClient
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

		<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
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

		<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
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

		<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
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
