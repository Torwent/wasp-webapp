<script lang="ts">
	import type { TNewBundleSchema } from "$lib/client/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import { ExternalLink } from "lucide-svelte"

	export let headers: string[]
	export let product: TNewBundleSchema
	export let errors: string[] | undefined
	export let action: string
</script>

<table class="table table-hover border-separate space-y-6 text-sm">
	<TableHeader {headers} />
	<tbody>
		<tr>
			<TableCell padding={0}>
				<div class="mx-3">
					<input
						name="name"
						class="input my-1 md:my-0 w-72"
						type="text"
						bind:value={product.name}
					/>
					<div class="text-xs mx-4 text-left">by {product.author}</div>
				</div>
			</TableCell>

			<TableCell padding={0}>
				<PricesCell bind:prices={product.prices} {errors} />
			</TableCell>
			<TableCell padding={0}>
				<button
					type="button"
					class="btn variant-filled-secondary"
					on:click|preventDefault={() => {
						if ("open" in product) product.open = !product.open
					}}
				>
					View/Edit Scripts
				</button>
			</TableCell>
			<TableCell padding={0}>
				<button
					id="add-bundle"
					type="submit"
					class="btn variant-filled-secondary"
					formaction="?/{action}"
				>
					Add
				</button>
			</TableCell>
		</tr>
		{#if product.open}
			<tr class="table-row">
				<td colspan={headers.length}>
					<table class="table table-compact">
						<tbody>
							{#each product.bundledScripts as script}
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
		{/if}
	</tbody>
</table>
