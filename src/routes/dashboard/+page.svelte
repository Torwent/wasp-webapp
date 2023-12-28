<script lang="ts">
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"

	import { onMount } from "svelte"
	import { invalidate } from "$app/navigation"
	import {
		bundleArraySchema,
		newBundleSchema,
		newScriptArraySchema,
		scriptArraySchema
	} from "$lib/backend/schemas.js"
	import Table from "./Table.svelte"

	export let data
	let { supabaseClient, profile, scripter, stats } = data

	onMount(() => {
		const subscription = supabaseClient
			.channel("products-subscription-changes")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "scripts",
					table: "prices",
					filter: "active=eq.true"
				},
				() => invalidate("dashboard")
			)
			.subscribe()

		return () => subscription.unsubscribe()
	})
</script>

<main class="m-4">
	<h3 class="text-center">
		Current user: {profile.username}
		<small>({profile.id})</small>
	</h3>

	<div class="my-8 grid place-items-center">
		<a href="/developers/{scripter.url}" class="btn variant-filled-secondary">Developer profile</a>
	</div>

	<form method="POST" class="my-8 grid place-items-center" action="?/linkStripe">
		<button class="btn variant-filled-secondary">
			{#if !scripter.stripe}
				Create stripe connected account
			{:else}
				Update stripe connected account
			{/if}
		</button>
	</form>

	<h3 class="justify-center text-center my-12">General stats</h3>

	<div class="table-container max-w-7xl mx-auto my-8">
		<table class="table table-hover border-separate space-y-6 text-sm">
			<TableHeader
				headers={[
					"Scripts",
					"Premium scripts",
					"Monthly downloads",
					"Premium monthly downloads",
					"Weekly subscribers",
					"Monthly subscribers",
					"Yearly subscribers"
				]}
			/>
			<tr class="table-row">
				<TableCell>{stats.total_user_scripts} / {stats.total_scripts}</TableCell>
				<TableCell>{stats.total_user_premium_scripts} / {stats.total_premium_scripts}</TableCell>
				<TableCell>{stats.month_user_downloads} / {stats.month_downloads}</TableCell>
				<TableCell>
					{stats.month_premium_user_downloads} / {stats.month_premium_downloads}
				</TableCell>
				<TableCell>0</TableCell>
				<TableCell>0</TableCell>
				<TableCell>0</TableCell>
			</tr>
			<tbody />
		</table>
	</div>

	<h5 class="my-24 text-center">
		By making premium scripts you automatically accept the
		<a href="/legal/scripter_terms_of_service">scripter terms or service</a>
		.
	</h5>

	{#if scripter.stripe}
		<h3 class="justify-center text-center my-12">Bundles</h3>

		<Table
			id="bundleEdit"
			schema={bundleArraySchema}
			data={data.bundlesForm}
			headers={[
				"Title",
				"Price (Week/Month/Year)",
				"Subscribers (Week/Month/Year)",
				"Scripts",
				"Action"
			]}
			subscriptions={[0, 5, 10]}
			action={"bundleEdit&product"}
		/>

		<Table
			id="bundleAdd"
			schema={newBundleSchema}
			data={data.newBundleForm}
			headers={["New Bundle", "Price (Week/Month/Year)", "Scripts", "Action"]}
			action={"bundleAdd"}
		/>

		<h3 class="justify-center text-center mt-32 my-12">Premium scripts</h3>

		<Table
			id="scriptEdit"
			schema={scriptArraySchema}
			data={data.scriptsForm}
			headers={["Title", "Price (Week/Month/Year)", "Subscribers (Week/Month/Year)", "Action"]}
			subscriptions={[0, 5, 10]}
			action={"scriptEdit&product"}
		/>

		<Table
			id="scriptAdd"
			schema={newScriptArraySchema}
			data={data.newScriptForm}
			headers={["New Premium Script", "Price (Week/Month/Year)", "Action"]}
			action={"scriptAdd&script"}
		/>
	{/if}
</main>
