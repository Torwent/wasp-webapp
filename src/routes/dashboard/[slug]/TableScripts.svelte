<script lang="ts">
	import type { TScriptArraySchema } from "$lib/backend/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import { page } from "$app/stores"

	export let headers: string[]
	interface Subscriptions {
		count: number
		cancelling: number
		free: number
	}

	export let products: TScriptArraySchema["scripts"]
	export let errors: string[] | undefined
	export let subscriptions: Subscriptions[]

	export let action: string

	const btnText = action.includes("dd") ? "Add" : "Save"

	async function getFreeAccess(id: string) {
		const { data, error } = await $page.data.supabaseClient
			.schema("profiles")
			.from("free_access")
			.select("id, date_start, date_end")
			.eq("product", id)

		if (error) {
			console.error(error)
			return []
		}

		return data
	}

	let userLocale = "pt-PT"
</script>

<table class="table table-hover border-separate space-y-6 text-sm">
	<TableHeader {headers} />
	<tbody>
		{#each products as _, i}
			<tr>
				<TableCell alignment="left" padding={0}>
					<div class="mx-3">
						<input
							name="name"
							class="input my-1 md:my-0 w-72"
							type="text"
							bind:value={products[i].name}
						/>
						<div class="text-xs mx-4 text-left">by {products[i].author}</div>
					</div>
				</TableCell>

				<TableCell padding={0}>
					<PricesCell bind:prices={products[i].prices} {errors} />
				</TableCell>

				<TableCell padding={0}>
					<button
						type="button"
						class="btn variant-filled-secondary"
						on:click|preventDefault={() => {
							products[i].subsOpen = !products[i].subsOpen
							if (products[i].subsOpen) products[i].freeOpen = false
						}}
					>
						{subscriptions[i].count}
					</button>
				</TableCell>
				<TableCell>{subscriptions[i].cancelling}</TableCell>
				<TableCell padding={0}>
					<button
						type="button"
						class="btn variant-filled-secondary"
						on:click|preventDefault={() => {
							products[i].freeOpen = !products[i].freeOpen
							if (products[i].freeOpen) products[i].subsOpen = false
						}}
					>
						{subscriptions[i].free}
					</button>
				</TableCell>

				<TableCell padding={0}>
					<button
						type="submit"
						class="btn variant-filled-secondary"
						formaction="?/{action}={products[i].id}"
					>
						{btnText}
					</button>
				</TableCell>
			</tr>
			{#if products[i].subsOpen}
				<tr class="table-row">
					<td colspan={headers.length}>
						<table class="table table-compact">
							<tbody>TODO...</tbody>
						</table>
					</td>
				</tr>
			{:else if products[i].freeOpen}
				<tr class="table-row">
					<td colspan={headers.length}>
						<table class="table table-compact variant-outline-surface">
							<thead class="font-bold text-lg variant-outline-surface rounded-t-md">
								<tr>
									<th><span class="flex justify-center text-center">WaspScripts ID</span></th>
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
												name="{products[i].id}_new_free_access_user_id"
												class="input my-1 md:my-0 w-72"
												type="text"
												value="User ID"
											/>
										</div>
									</TableCell>

									<TableCell>-</TableCell>
									<TableCell padding={0}>
										<div class="mx-3">
											<input
												name="{products[i].id}_new_free_access_end_date"
												class="input my-1 md:my-0 w-72"
												type="date"
											/>
										</div>
									</TableCell>

									<TableCell padding={0}>
										<button
											id="{products[i].id}_new_free_access_button"
											type="submit"
											class="btn variant-outline-primary"
											formaction="?/addFreeAccessS&product={products[i].id}"
										>
											{btnText}
										</button>
									</TableCell>
								</tr>

								{#await getFreeAccess(products[i].id) then freeAccessRows}
									{#each freeAccessRows as row}
										<tr>
											<TableCell>{row.id}</TableCell>

											<TableCell>{new Date(row.date_start).toLocaleString(userLocale)}</TableCell>
											<TableCell>{new Date(row.date_end).toLocaleString(userLocale)}</TableCell>

											<TableCell padding={0}>
												<button
													id="button-{products[i].id}"
													type="submit"
													class="btn variant-outline-error"
													formaction="?/cancelFreeAccessS&product={products[i].id}&id={row.id}"
												>
													Cancel
												</button>
											</TableCell>
										</tr>
									{/each}
								{/await}
							</tbody>
						</table>
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>
