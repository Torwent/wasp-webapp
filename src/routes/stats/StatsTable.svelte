<script lang="ts">
	import { page } from "$app/stores"
	import { replaceQuery } from "$lib/client/utils"
	import Paginator from "$lib/components/Paginator.svelte"
	import type { Stats } from "$lib/types/collection"
	import { ChevronDown, ChevronUp } from "lucide-svelte"

	export let range: number
	export let count: number = 0
	export let search: string

	let { searchParams } = $page.url
	$: ({ searchParams } = $page.url)

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let ascending = searchParams.get("ascending")?.toLowerCase() === "true"
	let headers: (keyof Stats)[] = ["username", "experience", "gold", "levels", "runtime"]
	let selectedHeader: keyof Stats = (searchParams.get("order") as keyof Stats) || "experience"

	async function sortBy(header: keyof Stats) {
		search = ""
		ascending = selectedHeader === header ? !ascending : false
		selectedHeader = header
		await replaceQuery($page.url.origin + $page.url.pathname, searchParams, {
			ascending: ascending ? "true" : "false",
			order: header
		})
	}
</script>

<table class="w-full text-sm text-left table table-hover">
	<thead class="text-xs uppercase text-primary-700 dark:text-primary-500">
		<tr>
			{#each headers as header}
				<th scope="col" class="py-3 px-6" on:click={async () => await sortBy(header)}>
					<div class="flex justify-between text-sm">
						<span class="align-middle h-full my-auto">
							{header}
							{#if header === "levels"}
								<a
									href="/tutorials/waspstats-virtual-levels-by-torwent"
									class="text-stone-700 dark:text-stone-400 hover:text-primary-400"
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
	<tbody>
		<slot />
	</tbody>
</table>

<Paginator bind:searchParams pageIdx={currentPage} {range} bind:count />
