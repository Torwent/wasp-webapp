<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"
	import { Paginator, type PaginationSettings } from "@skeletonlabs/skeleton"
	import { ChevronLeft, ChevronRight } from "lucide-svelte"

	export let searchParams: URLSearchParams
	export let pageIdx: number
	export let amount: number
	export let count: number
	export let amounts: number[] = [5, 10, 20]

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		let invalidate: boolean = false
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else searchParams.delete(k)

			invalidate = k === "page" || k === "amount"
		}

		const path = $page.url.origin + $page.url.pathname + "?" + searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: !invalidate,
			invalidateAll: invalidate
		})
	}

	let paginationSettings: PaginationSettings = {
		page: pageIdx,
		limit: amount,
		size: count,
		amounts: amounts
	}

	$: paginationSettings.page = pageIdx
	$: paginationSettings.limit = amount
	$: paginationSettings.size = count
</script>

<footer class="my-4">
	<Paginator
		...
		bind:settings={paginationSettings}
		showNumerals
		regionControl="btn-group"
		controlVariant="variant-ringed-surface"
		justify="justify-between mx-4 lg:mx-3"
		showFirstLastButtons={true}
		on:page={async (e) => await replaceQuery({ page: (e.detail + 1).toString() })}
		on:amount={async (e) => await replaceQuery({ amount: e.detail.toString() })}
	/>
</footer>
