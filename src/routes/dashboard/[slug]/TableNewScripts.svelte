<script lang="ts">
	import type { TNewScriptArraySchema } from "$lib/client/schemas"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"

	export let headers: string[]
	export let products: TNewScriptArraySchema["newScripts"]
	export let errors: string[] | undefined

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
						type="submit"
						class="btn variant-filled-secondary"
						formaction="?/{action}={products[i].id}"
					>
						{btnText}
					</button>
				</TableCell>
			</tr>
		{/each}
	</tbody>
</table>
