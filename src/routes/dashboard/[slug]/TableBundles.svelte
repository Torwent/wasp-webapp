<script lang="ts">
	import type { TBundleArraySchema } from "$lib/backend/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import { ExternalLink } from "lucide-svelte"
	import TableSubscriptions from "./TableSubscriptions.svelte"
	import TableFreeAccess from "./TableFreeAccess.svelte"

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
						<TableSubscriptions index={i} bind:products />
					</td>
				</tr>
			{:else if products[i].freeOpen}
				<tr class="table-row">
					<td colspan={headers.length}>
						<TableFreeAccess index={i} bind:products {action} />
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>
