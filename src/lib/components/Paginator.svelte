<script lang="ts">
	import { page } from "$app/state"
	import { Pagination } from "@skeletonlabs/skeleton-svelte"
	import ArrowLeft from "svelte-lucide/ArrowLeft.svelte"
	import ArrowRight from "svelte-lucide/ArrowRight.svelte"
	import Ellipsis from "svelte-lucide/Ellipsis.svelte"
	import ChevronLeft from "svelte-lucide/ChevronLeft.svelte"
	import ChevronRight from "svelte-lucide/ChevronRight.svelte"
	import { replaceQuery } from "$lib/client/utils"

	let {
		data,
		currentPage,
		count,
		pageSize = $bindable(),
		amounts = $bindable([Math.round(pageSize / 2), pageSize, pageSize * 2])
	}: {
		data: unknown[]
		currentPage: number
		count: number
		pageSize: number
		amounts?: number[]
	} = $props()
</script>

{#if pageSize < count}
	<footer class="flex justify-between">
		<select
			name="size"
			id="size"
			class="select max-w-[150px]"
			bind:value={pageSize}
			onchange={() => replaceQuery(page.url, { amount: pageSize.toString() })}
		>
			{#each amounts as v (v)}
				<option value={v}>Items {v}</option>
			{/each}
		</select>

		<Pagination
			{data}
			{count}
			page={currentPage}
			{pageSize}
			siblingCount={2}
			onPageChange={(e) => replaceQuery(page.url, { page: e.page.toString() })}
			onPageSizeChange={(e) => (pageSize = e.pageSize)}
		>
			{#snippet labelEllipsis()}<Ellipsis size="4" />{/snippet}
			{#snippet labelNext()}<ArrowRight size="4" />{/snippet}
			{#snippet labelPrevious()}<ArrowLeft size="4" />{/snippet}
			{#snippet labelFirst()}<ChevronLeft size="4" />{/snippet}
			{#snippet labelLast()}<ChevronRight size="4" />{/snippet}
		</Pagination>
	</footer>
{/if}
