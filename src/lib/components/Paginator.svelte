<script lang="ts">
	import { browser } from "$app/environment"
	import { invalidate } from "$app/navigation"
	import { page } from "$app/stores"
	import { ChevronLeft, ChevronRight } from "lucide-svelte"
	import { onMount } from "svelte"

	export let srcData: string
	export let currentPage: number
	export let range: number
	export let count: number
	let totalPages: number
	let loading = true
	let pageNumber: number = currentPage

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
		invalidate(srcData)
	}

	onMount(() => (loading = false))

	$: totalPages = Math.ceil(count / range)
	$: currentPage = pageNumber
</script>

<nav class="flex justify-between items-center pt-4" aria-label="Table navigation">
	<span class="text-sm font-normal text-stone-500 dark:text-stone-400">
		Showing
		<span class="font-semibold text-stone-900 dark:text-white">
			{(pageNumber - 1) * range + 1}-{(pageNumber - 1) * range + range + 1 < count
				? (pageNumber - 1) * range + range + 1
				: count}
		</span>
		of
		<span class="font-semibold text-stone-900 dark:text-white">{count}</span>
	</span>
	<ul class="inline-flex items-center -space-x-px">
		<li>
			<button
				class="block py-2 px-3 ml-0 leading-tight text-stone-500 bg-white rounded-l-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
				name="Previous"
				aria-label="Go to the previous page"
				on:click={() => {
					pageNumber -= 1
					if (pageNumber <= 0) pageNumber = 1
					replaceQuery({ page: pageNumber.toString() })
				}}
			>
				<ChevronLeft class="w-5 h-5" />
			</button>
		</li>

		{#if totalPages < 10}
			{#each Array(totalPages) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
						on:click={() => {
							pageNumber = Number(idx + 1)
							replaceQuery({ page: pageNumber.toString() })
						}}
						class:text-primary-500={pageNumber === idx + 1}
						class:dark:text-primary-400={pageNumber === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}
		{:else}
			{#each Array(3) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
						on:click={() => {
							pageNumber = Number(idx + 1)
							replaceQuery({ page: pageNumber.toString() })
						}}
						class:text-primary-500={pageNumber === idx + 1}
						class:dark:text-primary-400={pageNumber === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}

			{#each Array(5) as _, idx}
				{@const reverseIdx = pageNumber - 2}
				{#if reverseIdx - 2 > 3 && reverseIdx + 2 < totalPages - 3}
					<li>
						<button
							class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
							on:click={() => {
								pageNumber = Number(reverseIdx + idx)
								replaceQuery({ page: pageNumber.toString() })
							}}
							class:text-primary-500={pageNumber === reverseIdx + idx}
							class:dark:text-primary-400={pageNumber === reverseIdx + idx}
						>
							{reverseIdx + idx}
						</button>
					</li>
				{/if}
			{/each}

			{#each Array(3) as _, idx}
				{@const reverseIdx = 3 - 1 - idx}
				<li>
					<button
						class="py-2 px-3 leading-tight text-stone-500 bg-white border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
						on:click={() => {
							pageNumber = Number(totalPages - reverseIdx)
							replaceQuery({ page: pageNumber.toString() })
						}}
						class:text-primary-500={pageNumber === totalPages - reverseIdx - 1}
						class:dark:text-primary-400={pageNumber === totalPages - reverseIdx}
					>
						{totalPages - reverseIdx}
					</button>
				</li>
			{/each}
		{/if}

		<li>
			<button
				class="block py-2 px-3 leading-tight text-stone-500 bg-white rounded-r-lg border border-stone-300 hover:bg-stone-100 hover:text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-white"
				name="Next"
				aria-label="Go to the next page"
				on:click={() => {
					pageNumber += 1
					if (pageNumber >= totalPages) pageNumber = totalPages
					replaceQuery({ page: pageNumber.toString() })
				}}
			>
				<ChevronRight class="w-5 h-5" />
			</button>
		</li>
	</ul>
</nav>
