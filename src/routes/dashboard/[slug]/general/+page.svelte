<script lang="ts">
	import TableHeader from "$lib/components/TableHeader.svelte"
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
		class="xl:mx-w-7xl table-wrap preset-outlined-surface-500 mx-auto max-w-md rounded-md md:max-w-3xl lg:max-w-6xl"
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

			<tbody class="preset-filled-surface-200-800 [&>tr]:hover:preset-tonal">
				<tr class="table-row">
					<td class="text-center">{stats.total_user_scripts} / {stats.total_scripts}</td>
					<td class="text-center"
						>{stats.total_user_premium_scripts} / {stats.total_premium_scripts}</td
					>
					<td class="text-center">{stats.month_user_downloads} / {stats.month_downloads}</td>
					<td class="text-center">
						{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
					</td>

					<td class="text-center">{subscriptions.subscribers}</td>
					<td class="text-center">{subscriptions.cancelling}</td>
					<td class="text-center">{subscriptions.free_access}</td>
				</tr>
			</tbody>
		</table>
	</div>

	{#if roles?.administrator}
		<div class="my-16 text-center">
			<h1>Admin Powers</h1>

			<h1>View other scripters dashboard</h1>
			<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
				{#await fetchcripters()}
					Loading...
				{:then scripters}
					{#each scripters as scripter (scripter.id)}
						<a
							href="/dashboard/{scripter.id}/general"
							class="btn preset-outlined-tertiary-300-700 hover:border-secondary-500 m-2 mx-auto w-full font-bold"
						>
							{scripter.profiles.username}
						</a>
					{/each}
				{/await}
			</div>
		</div>
	{/if}
</main>
