<script lang="ts">
	import { goto } from "$app/navigation"
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"
	import { currency } from "$lib/utils.js"
	import Stripe from "stripe"
	import ArrowLeft from "svelte-lucide/ArrowLeft.svelte"
	import ArrowRight from "svelte-lucide/ArrowRight.svelte"
	import { SvelteDate } from "svelte/reactivity"

	const { data, children } = $props()
	let { transactionsPromise, direction, cursor } = $derived(data)

	let hasMore = $state(false)
	let hasPrev = $state(false)
	let nextCursor: string | null = $state(null)
	let prevCursor: string | null = $state(null)

	$effect(() => {
		transactionsPromise.then((txs) => {
			hasMore = direction === "next" ? txs.has_more : true
			hasPrev = direction === "prev" ? txs.has_more : !!cursor
			nextCursor = txs.data.at(-1)?.id ?? null
			prevCursor = txs.data.at(0)?.id ?? null
		})
	})

	const pathParts = page.url.pathname.split("/")
	const len = pathParts.indexOf("transactions")
	let url = "/"
	for (let i = 1; i < len; i++) {
		url += pathParts[i] + "/"
	}

	const transactionsURL = url + "transactions/"
	const payoutsURL = url + "payouts/"

	const next = $derived(transactionsURL + "?cursor=" + nextCursor + "&dir=next")
	const prev = $derived(transactionsURL + "?cursor=" + prevCursor + "&dir=prev")
</script>

<Head
	title="Transactions"
	description="List of transactions the scripter received."
	keywords="Scripters, Developers, Dashboard, Transactions"
/>

{@render children()}

<main class="mx-auto my-12 flex w-8/12 flex-col gap-2">
	{#await transactionsPromise}
		Loading...
	{:then transactions}
		<table class="mx-auto table h-full border-separate space-y-6 text-xs">
			<thead class="preset-filled-surface-200-800 text-lg font-bold">
				<tr class="text-surface-900-100">
					<th>Date</th>
					<th>Type</th>
					<th>Status</th>
					<th>Source</th>
					<th>Gross</th>
					<th>Fee</th>
					<th>Net</th>
				</tr>
			</thead>
			<tbody class="preset-filled-surface-100-900 [&>tr]:hover:preset-tonal-surface">
				{#each transactions.data as transaction (transaction.id)}
					<tr
						onclick={async () => {
							if (transaction.type === "payout") {
								const source = transaction!.source as Stripe.BalanceTransactionSource
								await goto(payoutsURL + source.id, { noScroll: true })
								return
							}
							await goto(transactionsURL + transaction.id, { noScroll: true })
						}}
						class="cursor-pointer"
					>
						<td>{new SvelteDate(transaction.created * 1000).toUTCString()}</td>
						<td>{transaction.type.toLocaleUpperCase()}</td>
						<td class="text-success-500" class:text-warning-500={transaction.status === "pending"}>
							{transaction.status.toLocaleUpperCase()}
						</td>
						<td>
							{#if typeof transaction.source !== "string"}
								{#if transaction.source.source && typeof transaction.source.source !== "string"}
									{#if "application_name" in transaction.source.source!}
										{transaction.source.source.application_name}
									{:else}
										{transaction.source.source.id}
									{/if}
								{:else if transaction.source.description != null}
									{transaction.source.description}
								{:else}
									{transaction.source.source}
								{/if}
							{:else}
								{transaction.source}
							{/if}
						</td>
						<td>
							{currency(transaction.amount / 100, transaction.currency)}
						</td>
						<td>
							{currency(transaction.fee / 100, transaction.currency)}
						</td>
						<td>
							{currency((transaction.amount - transaction.fee) / 100, transaction.currency)}
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
