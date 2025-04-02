<script lang="ts">
	import { page } from "$app/state"
	import { replaceQuery } from "$lib/client/utils"
	import Paginator from "$lib/components/Paginator.svelte"
	import type { Stats } from "$lib/types/collection"
	import ChevronUp from "svelte-lucide/ChevronUp.svelte"
	import ChevronDown from "svelte-lucide/ChevronDown.svelte"

	let { pageSize = $bindable(), count = 0, data, children } = $props()

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let ascending = $state(page.url.searchParams.get("ascending")?.toLowerCase() === "true")
	let headers: (keyof Stats)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stats = $state(
		(page.url.searchParams.get("order") as keyof Stats) || "experience"
	)

	async function sortBy(header: keyof Stats) {
		ascending = selectedHeader === header ? !ascending : false
		selectedHeader = header
		await replaceQuery(page.url, {
			search: "",
			ascending: ascending ? "true" : "false",
			order: header
		})
	}
</script>

<div class="table-wrap">
	<table class="mx-auto my-8 table w-full overflow-auto text-left text-xs md:text-sm">
		<thead class="preset-filled-surface-100-900 text-lg font-bold uppercase">
			<tr>
				{#each headers as header (header)}
					<th scope="col" class="px-6 py-3" onclick={async () => await sortBy(header)}>
						<div class="flex justify-between text-sm">
							<span class="my-auto h-full align-middle">
								{header}
								{#if header === "levels"}
									<a
										href="/tutorials/waspstats-virtual-levels-by-torwent"
										class="text-surface-700-300 hover:text-primary-600-400"
									>
										*
									</a>
								{/if}
							</span>
							{#if selectedHeader === header}
								{#if ascending}
									<ChevronDown />
								{:else}
									<ChevronUp />
								{/if}
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody class="[&>tr]:hover:preset-tonal">
			{@render children()}
		</tbody>
	</table>
</div>

<Paginator {data} {currentPage} bind:pageSize {count} />
