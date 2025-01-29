<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import { Pagination } from "@skeletonlabs/skeleton-svelte"
	import ArrowLeft from "svelte-lucide/ArrowLeft.svelte"
	import ArrowRight from "svelte-lucide/ArrowRight.svelte"
	import Ellipsis from "svelte-lucide/Ellipsis.svelte"
	import ChevronLeft from "svelte-lucide/ChevronLeft.svelte"
	import ChevronRight from "svelte-lucide/ChevronRight.svelte"

	let {
		data,
		currentPage,
		count,
		pageSize = $bindable(),
		amounts = $bindable([Math.round(pageSize / 2), pageSize, pageSize * 2])
	} = $props()

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		let invalidate: boolean = false
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else page.url.searchParams.delete(k)

			invalidate = k === "page" || k === "amount"
		}

		const path = page.url.origin + page.url.pathname + "?" + page.url.searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: !invalidate,
			invalidateAll: invalidate
		})
	}
</script>

<footer class="flex justify-between">
	<select
		name="size"
		id="size"
		class="select max-w-[150px]"
		bind:value={pageSize}
		onchange={async () => await replaceQuery({ amount: pageSize.toString() })}
	>
		{#each amounts as v}
			<option value={v}>Items {v}</option>
		{/each}
	</select>
	<Pagination
		{data}
		{count}
		page={currentPage}
		bind:pageSize
		siblingCount={2}
		onPageChange={async (e) => await replaceQuery({ page: e.page.toString() })}
	>
		{#snippet labelEllipsis()}<Ellipsis class="size-4" />{/snippet}
		{#snippet labelNext()}<ArrowRight class="size-4" />{/snippet}
		{#snippet labelPrevious()}<ArrowLeft class="size-4" />{/snippet}
		{#snippet labelFirst()}<ChevronLeft class="size-4" />{/snippet}
		{#snippet labelLast()}<ChevronRight class="size-4" />{/snippet}
	</Pagination>
</footer>
