<script lang="ts">
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"

	export let headers: string[]
</script>

<div class="table-container max-w-7xl mx-auto mt-8 max-h-[40rem]">
	<table class="table table-hover border-separate space-y-6 text-sm animate-pulse">
		<table class="table table-hover border-separate space-y-6 text-sm">
			<TableHeader {headers} />
			<tbody>
				<tr>
					<TableCell padding={0}>
						<div class="mx-3">
							<input name="name" class="input my-1 md:my-0 w-72" type="text" value={"Loading..."} />
							<div class="text-xs mx-4 text-left">by Loading...</div>
						</div>
					</TableCell>

					<TableCell padding={0}>
						<div>
							<div class="grid md:flex">
								{#each Array(3) as _}
									<input name="prices" class="input mx-1 my-1 md:my-0" value={"Loading..."} />
								{/each}
							</div>
						</div>
					</TableCell>
					<TableCell padding={0}>
						<button type="button" class="btn variant-filled-secondary"> View/Edit Scripts </button>
					</TableCell>
					<TableCell padding={0}>
						<button id="add-bundle" type="submit" class="btn variant-filled-secondary">
							Add
						</button>
					</TableCell>
				</tr>
			</tbody>
		</table>
		<div class="max-h-64"></div>
	</table>
</div>
