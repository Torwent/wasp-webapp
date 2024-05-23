<script lang="ts">
	import type { TScriptArraySchema } from "$lib/backend/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import TableSubscriptions from "./TableSubscriptions.svelte"
	import TableFreeAccess from "./TableFreeAccess.svelte"

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

	async function toggleSubs(idx: number) {
		products[idx].subsOpen = !products[idx].subsOpen
		if (products[idx].subsOpen) {
			for (let i = 0; i < products.length; i++) {
				products[i].freeOpen = false
				if (i !== idx) products[i].subsOpen = false
			}
		}
	}

	async function toggleFree(idx: number) {
		products[idx].freeOpen = !products[idx].freeOpen
		if (products[idx].freeOpen) {
			for (let i = 0; i < products.length; i++) {
				products[i].subsOpen = false
				if (i !== idx) products[i].freeOpen = false
			}
		}
	}
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
						on:click|preventDefault={async () => await toggleSubs(i)}
					>
						{subscriptions[i].count}
					</button>
				</TableCell>
				<TableCell>{subscriptions[i].cancelling}</TableCell>
				<TableCell padding={0}>
					<button
						type="button"
						class="btn variant-filled-secondary"
						on:click|preventDefault={async () => await toggleFree(i)}
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
