<script lang="ts">
	import type { TBundleArraySchema } from "$lib/backend/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import { ExternalLink } from "lucide-svelte"
	import { page } from "$app/stores"

	export let headers: string[]
	interface Subscriptions {
		count: number
		cancelling: number
		free: number
	}

	export let products: TBundleArraySchema["bundles"]
	export let errors: string[] | undefined

	export let subscriptions: Subscriptions[]
	export let action: string

	const btnText = action.includes("dd") ? "Add" : "Save"

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

	async function getSubscriptions(id: string) {
		const { data: subData, error: subError } = await $page.data.supabaseClient
			.schema("profiles")
			.from("subscription")
			.select("id, price, date_start, date_end, cancel, profiles(username)")
			.eq("product", id)

		if (subError) {
			console.error(subError)
			return []
		}

		const { data: priceData, error: priceError } = await $page.data.supabaseClient
			.schema("scripts")
			.from("prices")
			.select("id, amount, interval")
			.eq("product", id)

		if (priceError) {
			console.error(priceError)
			return []
		}

		return subData.map((sub) => {
			const i = priceData.findIndex((price) => price.id, sub.price)
			return {
				id: sub.id,
				username: sub.profiles?.username ?? "Null",
				date_start: sub.date_start,
				date_end: sub.date_end,
				price: priceData[i].amount,
				interval: priceData[i].interval,
				state: sub.cancel
			}
		})
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
							if (products[i].subsOpen) {
								products[i].open = false
								products[i].freeOpen = false
							}
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
							if (products[i].freeOpen) {
								products[i].open = false
								products[i].subsOpen = false
							}
						}}
					>
						{subscriptions[i].free}
					</button>
				</TableCell>

				<TableCell padding={0}>
					<button
						type="button"
						class="btn variant-filled-secondary"
						on:click|preventDefault={() => {
							products[i].open = !products[i].open
							if (products[i].open) {
								products[i].subsOpen = false
								products[i].freeOpen = false
							}
						}}
					>
						View/Edit Scripts
					</button>
				</TableCell>
				<TableCell padding={0}>
					<button
						id="button-{products[i].id}"
						type="submit"
						class="btn variant-filled-secondary"
						formaction="?/{action}={products[i].id}"
					>
						{btnText}
					</button>
				</TableCell>
			</tr>
			{#if products[i].open}
				<tr class="table-row">
					<td colspan={headers.length}>
						<table class="table table-compact">
							<tbody>
								{#each products[i].bundledScripts as script}
									<tr>
										<td
											class="text-xs cursor-pointer"
											class:text-secondary-500={script.active}
											on:click={() => (script.active = !script.active)}
										>
											<div class="flex align-items-center ml-3">
												<a href={script.url} class="flex permalink h-full">
													<ExternalLink size={16} class="mr-4" />
												</a>
												{script.name}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</td>
				</tr>
			{:else if products[i].subsOpen}
				<tr class="table-row">
					<td colspan={headers.length}>
						<table class="table table-compact">
							<thead class="font-bold text-lg variant-outline-surface rounded-t-md">
								<tr>
									<th><span class="flex justify-center text-center">WaspScripts ID</span></th>
									<th><span class="flex justify-center text-center">Username</span></th>
									<th><span class="flex justify-center text-center">Start Date</span></th>
									<th><span class="flex justify-center text-center">End Date</span></th>
									<th><span class="flex justify-center text-center">Price</span></th>
									<th><span class="flex justify-center text-center">Interval</span></th>
									<th><span class="flex justify-center text-center">State</span></th>
									<th><span class="flex justify-center text-center">Action</span></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colspan="8">
										<span class="flex justify-center text-center py-0">
											<button
												id="{products[i].id}-cancel-all-subs-button"
												type="submit"
												class="btn variant-outline-error hover:text-error-500"
												disabled
												formaction="?/cancelAllSubs&product={products[i].id}"
											>
												Cancel All Subscriptions (Can't be undone!)
											</button>
										</span>
									</td>
								</tr>
								{#await getSubscriptions(products[i].id) then subscriptionRows}
									{#each subscriptionRows as row}
										<tr>
											<TableCell>{row.id}</TableCell>
											<TableCell>{row.username}</TableCell>

											<TableCell>{new Date(row.date_start).toLocaleString(userLocale)}</TableCell>
											<TableCell>{new Date(row.date_end).toLocaleString(userLocale)}</TableCell>
											<TableCell>{Number(row.price / 100).toLocaleString(userLocale)} €</TableCell>

											<TableCell>{row.interval + "ly"}</TableCell>
											<TableCell>{row.state ? "Canceling" : "Active"}</TableCell>

											<TableCell padding={0}>
												<button
													id="{products[i].id}-cancel-sub-{row.id}-button"
													type="submit"
													class="btn variant-outline-error"
													disabled
													formaction="?/cancelSub&product={products[i].id}&id={row.id}"
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
			{:else if products[i].freeOpen}
				<tr class="table-row">
					<td colspan={headers.length}>
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
												name="{products[i].id}_new_free_access_user_id"
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
											formaction="?/addFreeAccessB&product={products[i].id}"
										>
											{btnText}
										</button>
									</TableCell>
								</tr>

								{#await getFreeAccess(products[i].id) then freeAccessRows}
									{#each freeAccessRows as row}
										<tr>
											<TableCell>{row.id}</TableCell>
											<TableCell>{row.username}</TableCell>

											<TableCell>{new Date(row.date_start).toLocaleString(userLocale)}</TableCell>
											<TableCell>{new Date(row.date_end).toLocaleString(userLocale)}</TableCell>

											<TableCell padding={0}>
												<button
													id="button-{products[i].id}"
													type="submit"
													class="btn variant-outline-error"
													formaction="?/cancelFreeAccessB&product={products[i].id}&id={row.id}"
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
