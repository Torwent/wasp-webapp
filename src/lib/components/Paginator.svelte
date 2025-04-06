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
	<footer class="flex w-full flex-col justify-between gap-2 md:flex-row">
		<select
			name="size"
			id="size"
			class="select mx-auto max-w-[150px] md:mx-0"
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
			siblingCount={1}
			onPageChange={(e) => {
				currentPage = e.page
				replaceQuery(page.url, { page: e.page.toString() }, false)
			}}
			onPageSizeChange={(e) => (pageSize = e.pageSize)}
			classes="w-fit mx-auto md:mx-0"
			buttonClasses="text-xs md:text-base px-2 md:px-3"
		>
			{#snippet labelEllipsis()}<Ellipsis class="size-4" />{/snippet}
			{#snippet labelNext()}<ArrowRight class="size-4" />{/snippet}
			{#snippet labelPrevious()}<ArrowLeft class="size-4" />{/snippet}
			{#snippet labelFirst()}<ChevronLeft class="size-4" />{/snippet}
			{#snippet labelLast()}<ChevronRight class="size-4" />{/snippet}
		</Pagination>
	</footer>
{/if}
