<script lang="ts">
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	const { data } = $props()
	const { supabaseClient, roles, stats, subscriptions } = $derived(data)

	async function fetchcripters() {
		const start = performance.now()
		const { data, error: err } = await supabaseClient
			.schema("profiles")
			.from("scripters")
			.select(`id, profiles!inner (username)`)
			.limit(1, { foreignTable: "profiles" })

		console.log(`└──💻 fetch all scripters loaded in ${(performance.now() - start).toFixed(2)} ms!`)
		if (err) {
			console.error(err)
			return []
		}

		return data.toSorted((a, b) => {
			const usernameA = a?.profiles?.username
			const usernameB = b?.profiles?.username

			if (usernameA == null && usernameB == null) return 0
			if (usernameA == null) return 1
			if (usernameB == null) return -1

			return usernameA.localeCompare(usernameB)
		})
	}
</script>

<main class="m-4 min-h-96">
	<h1 class="my-12 justify-center text-center">General stats</h1>

	<div
		class="xl:mx-w-7xl table-wrap mx-auto max-w-md rounded-md preset-outlined-surface-500 md:max-w-3xl lg:max-w-6xl"
	>
		<table class="table border-separate space-y-6 text-xs">
			<TableHeader
				headers={[
					"Scripts",
					"Premium scripts",
					"Monthly downloads",
					"Premium monthly downloads",
					"Subscribers",
					"Cancelling",
					"Free access"
				]}
			/>

			<tbody class="preset-filled-surface-200-800 hover:[&>tr]:preset-tonal">
				<tr class="table-row">
					<TableCell>{stats.total_user_scripts} / {stats.total_scripts}</TableCell>
					<TableCell>{stats.total_user_premium_scripts} / {stats.total_premium_scripts}</TableCell>
					<TableCell>{stats.month_user_downloads} / {stats.month_downloads}</TableCell>
					<TableCell>
						{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
					</TableCell>

					<TableCell>{subscriptions.subscribers}</TableCell>
					<TableCell>{subscriptions.cancelling}</TableCell>
					<TableCell>{subscriptions.free_access}</TableCell>
				</tr>
			</tbody>
		</table>
	</div>

	{#if roles?.administrator}
		<div class="my-16 text-center">
			<h1>Admin Powers</h1>

			<h1>View other scripters dashboard</h1>
			<div class="grid grid-cols-5 gap-4">
				{#await fetchcripters()}
					Loading...
				{:then scripters}
					{#each scripters as scripter}
						<a
							href="/dashboard/{scripter.id}/general"
							class="btn m-2 mx-auto w-full font-bold preset-outlined-tertiary-100-900"
						>
							{scripter.profiles.username}
						</a>
					{/each}
				{/await}
			</div>
		</div>
	{/if}
</main>
