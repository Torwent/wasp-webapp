<script lang="ts">
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"
	import { currency } from "$lib/utils"
	import ArrowLeft from "svelte-lucide/ArrowLeft.svelte"
	import ArrowRight from "svelte-lucide/ArrowRight.svelte"
	import { SvelteDate } from "svelte/reactivity"

	const { data, children } = $props()
	let { payoutsPromise, direction, cursor } = $derived(data)

	let hasMore = $state(false)
	let hasPrev = $state(false)
	let nextCursor: string | null = $state(null)
	let prevCursor: string | null = $state(null)

	$effect(() => {
		payoutsPromise.then((py) => {
			hasMore = direction === "next" ? py.has_more : true
			hasPrev = direction === "prev" ? py.has_more : !!cursor
			nextCursor = py.data.at(-1)?.id ?? null
			prevCursor = py.data.at(0)?.id ?? null
		})
	})

	const pathParts = page.url.pathname.split("/")
	const len = pathParts.indexOf("payouts")
	let url = "/"
	for (let i = 1; i < len; i++) {
		url += pathParts[i] + "/"
	}

	const payoutsURL = "payouts/"

	const next = $derived(payoutsURL + "?cursor=" + nextCursor + "&dir=next")
	const prev = $derived(payoutsURL + "?cursor=" + prevCursor + "&dir=prev")
</script>

<Head
	title="Payouts"
	description="List of payouts the scripter received."
	keywords="Scripters, Developers, Dashboard, Payouts"
/>

{@render children()}

<main class="mx-auto my-12 flex w-8/12 flex-col gap-2">
	{#await payoutsPromise}
		Loading...
	{:then payouts}
		<table class="mx-auto table h-full border-separate space-y-6 text-xs">
			<thead class="preset-filled-surface-200-800 text-lg font-bold">
				<tr class="text-surface-900-100">
					<th>Date</th>
					<th>State</th>
					<th>Destination</th>
					<th>Value</th>
				</tr>
			</thead>
			<tbody class="preset-filled-surface-100-900 [&>tr]:hover:preset-tonal-surface">
				{#each payouts.data as payout (payout.id)}
					<tr onclick={async () => await goto(payoutsURL + payout.id)} class="cursor-pointer">
						<td>{new SvelteDate(payout.arrival_date * 1000).toUTCString()}</td>
						<td>{payout.status.toLocaleUpperCase()}</td>
						<td>
							{#if typeof payout.destination !== "string" && "bank_name" in payout.destination!}
								{payout.destination.bank_name} ****{payout.destination.last4}
							{:else}
								Destination ID: {payout.destination}
							{/if}
						</td>
						<td>
							{currency(payout.amount / 100, payout.currency)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/await}

	<div class="flex justify-end-safe gap-2">
		{#if hasPrev && prevCursor}
			<a href={prev} class="btn preset-outlined-surface-500" data-sveltekit-noscroll>
				<ArrowLeft class="size-4" />
			</a>
		{:else}
			<button disabled class="btn preset-outlined-surface-500">
				<ArrowLeft class="size-4" />
			</button>
		{/if}

		{#if hasMore && nextCursor}
			<a href={next} class="btn preset-outlined-surface-500" data-sveltekit-noscroll>
				<ArrowRight class="size-4" />
			</a>
		{:else}
			<button disabled class="btn preset-outlined-surface-500">
				<ArrowRight class="size-4" />
			</button>
		{/if}
	</div>
</main>
