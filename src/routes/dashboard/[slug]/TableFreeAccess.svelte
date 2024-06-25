<script lang="ts">
	import { page } from "$app/stores"
	import type { TBundleArraySchema, TScriptArraySchema } from "$lib/client/schemas"
	import TableCell from "$lib/components/tables/TableCell.svelte"

	export let products: TScriptArraySchema["scripts"] | TBundleArraySchema["bundles"]
	export let index: number
	export let action: string

	async function getFreeAccess(id: string) {
		const { data, error } = await $page.data.supabaseClient
			.schema("profiles")
			.from("free_access")
			.select("id, date_start, date_end, profiles(username)")
			.eq("product", id)

		if (error) {
			console.error(error)
			return []
		}

		return data.map((access) => {
			return {
				id: access.id,
				date_start: access.date_start,
				date_end: access.date_end,
				username: access.profiles?.username ?? "Null"
			}
		})
	}

	let freePromise = getFreeAccess(products[index].id)

	const btnText = action.includes("dd") ? "Add" : "Save"
	let userLocale = "pt-PT"
</script>

<table class="table table-compact variant-outline-surface">
	<thead class="font-bold text-lg variant-outline-surface rounded-t-md">
		<tr>
			<th><span class="flex justify-center text-center">WaspScripts ID</span></th>
			<th><span class="flex justify-center text-center">Username</span></th>
			<th><span class="flex justify-center text-center">Start Date</span></th>
			<th><span class="flex justify-center text-center">End Date</span></th>
			<th><span class="flex justify-center text-center">Action</span></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<TableCell padding={0}>
				<div class="mx-3">
					<input
						name="{products[index].id}_new_free_access_user_id"
						class="input my-1 md:my-0 w-72"
						type="text"
						value="User ID"
					/>
				</div>
			</TableCell>

			<TableCell>-</TableCell>
			<TableCell>-</TableCell>
			<TableCell padding={0}>
				<div class="mx-3">
					<input
						name="{products[index].id}_new_free_access_end_date"
						class="input my-1 md:my-0 w-72"
						type="date"
					/>
				</div>
			</TableCell>

			<TableCell padding={0}>
				<button
					id="{products[index].id}_new_free_access_button"
					type="submit"
					class="btn variant-outline-primary"
					formaction="?/addFreeAccess&product={products[index].id}"
					on:submit={async () => (freePromise = getFreeAccess(products[index].id))}
				>
					{btnText}
				</button>
			</TableCell>
		</tr>

		{#await freePromise then freeAccessRows}
			{#each freeAccessRows as row}
				<tr>
					<TableCell>{row.id}</TableCell>
					<TableCell>{row.username}</TableCell>
					<TableCell>{new Date(row.date_start).toLocaleString(userLocale)}</TableCell>
					<TableCell>{new Date(row.date_end).toLocaleString(userLocale)}</TableCell>

					<TableCell padding={0}>
						<button
							id="button-{products[index].id}"
							type="submit"
							class="btn variant-outline-error"
							formaction="?/cancelFreeAccess&product={products[index].id}&id={row.id}"
							on:submit={async () => (freePromise = getFreeAccess(products[index].id))}
						>
							Cancel
						</button>
					</TableCell>
				</tr>
			{/each}
		{/await}
	</tbody>
</table>
