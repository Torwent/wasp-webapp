<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"
	import { ChevronLeft, ChevronRight } from "lucide-svelte"

	export let searchParams: URLSearchParams
	export let pageIdx: number
	export let range: number
	export let count: number
	let totalPages: number

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		let invalidate: boolean = false
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else searchParams.delete(k)

			invalidate = k === "page"
		}

		const path = $page.url.origin + $page.url.pathname + "?" + searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: !invalidate,
			invalidateAll: invalidate
		})
	}

	$: totalPages = Math.ceil(count / range)
</script>

<nav class="flex justify-between items-center my-12" aria-label="Scripts pagination">
	<span class="text-sm font-normal text-surface-500">
		Showing
		<span class="font-semibold text-surface-900 dark:text-surface-200">
			{(pageIdx - 1) * range + 1}
			-
			{(pageIdx - 1) * range + range + 1 < count ? (pageIdx - 1) * range + range + 1 : count}
		</span>
		of
		<span class="font-semibold text-stone-900 dark:text-white">{count}</span>
	</span>
	<ul class="inline-flex items-center -space-x-px">
		<li>
			<button
				class="block py-2 px-3 ml-0 leading-tight rounded-l-lg variant-ghost-surface"
				name="Previous"
				aria-label="Go to the previous page"
				on:click={async () => {
					pageIdx -= 1
					if (pageIdx <= 0) pageIdx = 1
					await replaceQuery({ page: pageIdx.toString() })
				}}
			>
				<ChevronLeft class="w-5 h-5" />
			</button>
		</li>

		{#if totalPages < 10}
			{#each Array(totalPages) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight variant-ghost-surface"
						on:click={async () => {
							pageIdx = Number(idx + 1)
							await replaceQuery({ page: pageIdx.toString() })
						}}
						class:text-primary-500={pageIdx === idx + 1}
						class:dark:text-primary-400={pageIdx === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}
		{:else}
			{#each Array(3) as _, idx}
				<li>
					<button
						class="py-2 px-3 leading-tight variant-ghost-surface"
						on:click={async () => {
							pageIdx = Number(idx + 1)
							await replaceQuery({ page: pageIdx.toString() })
						}}
						class:text-primary-500={pageIdx === idx + 1}
						class:dark:text-primary-400={pageIdx === idx + 1}
					>
						{idx + 1}
					</button>
				</li>
			{/each}

			{#each Array(5) as _, idx}
				{@const reverseIdx = pageIdx - 2}
				{#if reverseIdx - 2 > 3 && reverseIdx + 2 < totalPages - 3}
					<li>
						<button
							class="py-2 px-3 leading-tight variant-ghost-surface"
							on:click={async () => {
								pageIdx = Number(reverseIdx + idx)
								await replaceQuery({ page: pageIdx.toString() })
							}}
							class:text-primary-500={pageIdx === reverseIdx + idx}
							class:dark:text-primary-400={pageIdx === reverseIdx + idx}
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
						class="py-2 px-3 leading-tight variant-ghost-surface"
						on:click={async () => {
							pageIdx = Number(totalPages - reverseIdx)
							await replaceQuery({ page: pageIdx.toString() })
						}}
						class:text-primary-500={pageIdx === totalPages - reverseIdx - 1}
						class:dark:text-primary-400={pageIdx === totalPages - reverseIdx}
					>
						{totalPages - reverseIdx}
					</button>
				</li>
			{/each}
		{/if}

		<li>
			<button
				class="block py-2 px-3 leading-tight rounded-r-lg variant-ghost-surface"
				name="Next"
				aria-label="Go to the next page"
				on:click={async () => {
					pageIdx += 1
					if (pageIdx >= totalPages) pageIdx = totalPages
					await replaceQuery({ page: pageIdx.toString() })
				}}
			>
				<ChevronRight class="w-5 h-5" />
			</button>
		</li>
	</ul>
</nav>
