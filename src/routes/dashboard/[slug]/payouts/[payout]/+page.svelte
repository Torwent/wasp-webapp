<script lang="ts">
	import { page } from "$app/state"
	import { onMount } from "svelte"
	import { SvelteDate } from "svelte/reactivity"

	const { data } = $props()
	let { payoutPromise, transactionsPromise } = $derived(data)

	function currency(value: number, code: string) {
		return value.toLocaleString(navigator.language, {
			style: "currency",
			currency: code.toUpperCase()
		})
	}

	function toUnit(value: number) {
		return `"${value.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}"`
	}

	function formatDate(n: number) {
		const d = new Date(n)

		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, "0")
		const day = String(d.getDate()).padStart(2, "0")

		const hours = String(d.getHours()).padStart(2, "0")
		const minutes = String(d.getMinutes()).padStart(2, "0")

		return `${year}-${month}-${day} ${hours}:${minutes}`
	}

	function capitalize(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	async function exportTransactions() {
		const transactions = await transactionsPromise
		if (!transactions.length) return

		const txs = transactions.toSorted((a, b) => {
			const n = a.type.localeCompare(b.type)
			if (n !== 0) return n
			return a.created - b.created
		})
		const lines = ["Type,ID,Created,Description,Amount,Currency,Fees,Net,Country"]

		for (const tx of txs) {
			const date = formatDate(tx.created * 1000)
			const amount = toUnit(tx.amount / 100)
			const fees = toUnit(tx.fee / 100)
			const net = toUnit(tx.net / 100)

			const line = `${tx.type},${tx.id},${date},${tx.description ?? ""},${amount},${tx.currency},${fees},${net},${tx.country}`
			lines.push(line)
		}

		const csv = lines.join("\n")
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "transactions.csv"
		a.click()
		URL.revokeObjectURL(url)
	}

	let loading = $state(true)
	let fees = $state(0)
	const charges = $state({ name: "Charges", amount: 0, gross: 0, fees: 0, total: 0 })
	const refunds = $state({ name: "Refunds", amount: 0, gross: 0, fees: 0, total: 0 })
	const adjusts = $state({
		name: "Adjustments",
		amount: 0,
		gross: 0,
		fees: 0,
		total: 0
	})

	$effect(() => {
		transactionsPromise.then((txs) => {
			for (let i = 0; i < txs.length - 1; i++) {
				const tx = txs[i]
				fees += tx.fee
				if (tx.type == "payout") continue

				if (tx.type == "adjustment") {
					adjusts.amount += 1
					adjusts.gross += tx.amount
					adjusts.fees -= tx.fee
					adjusts.total += tx.amount - tx.fee
					continue
				}

				if (tx.type == "refund" || tx.type == "payment_refund") {
					refunds.amount += 1
					refunds.gross += tx.amount
					refunds.fees -= tx.fee
					refunds.total += tx.amount - tx.fee
					continue
				}

				charges.amount += 1
				charges.gross += tx.amount
				charges.fees -= tx.fee
				charges.total += tx.amount - tx.fee
			}

			loading = false
		})
	})

	let dialog: HTMLDialogElement

	const pathParts = page.url.pathname.split("/")
	const len = pathParts.indexOf("payouts")
	let url = $state("/")
	for (let i = 1; i < len; i++) {
		url += pathParts[i] + "/"
	}
	const payoutURL = $derived(url + "payouts/")
	const transactionURL = $derived(url + "transactions/")

	onMount(() => dialog.showModal())
</script>

<dialog
	bind:this={dialog}
	class="outline-surface-500 bg-surface-100-900 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75 top-1/2 left-1/2 z-10 max-w-[640px] -translate-1/2 space-y-4 rounded-md p-4 text-inherit outline-1"
>
	<div class="h-fit w-fit">
		{#await payoutPromise}
			Loading...
		{:then payout}
			<div class="my-2 w-96 gap-3">
				<h2 class="h2 my-2">
					{currency(payout.amount / 100, payout.currency)}
				</h2>

				<div class="text-surface-800-200 flex flex-col text-sm">
					<p>Started on {new SvelteDate(payout.created * 1000).toLocaleString()}</p>
					<p>Finished on {new SvelteDate(payout.arrival_date * 1000).toLocaleString()}</p>
				</div>
			</div>

			<div class="flex h-fit max-h-96 flex-col gap-8 overflow-auto p-8">
				<div class="text-sm">
					<h3 class="h5">General View</h3>
					<div class="grid grid-cols-2 gap-x-4">
						<span>To</span>
						<span>
							{#if typeof payout.destination !== "string" && "bank_name" in payout.destination!}
								{payout.destination.bank_name} ****{payout.destination.last4}
							{:else}
								Destination ID: {payout.destination}
							{/if}
						</span>
						<span>Amount</span>
						<span>
							{currency(payout.amount / 100, payout.currency)}
						</span>

						<span>Type</span>
						<span>
							{#if payout.type == "bank_account"}
								Bank account
							{:else}
								Card
							{/if}
						</span>

						<span>Method</span>
						<span>
							{payout.method}
						</span>

						<span>Bank statement</span>
						<span>
							{payout.statement_descriptor}
						</span>

						<span>Reference number</span>
						<span>
							{payout.trace_id?.value ?? "Unknown"}
						</span>

						<span>Stripe ID</span>
						<span>
							{payout.id}
						</span>
					</div>
				</div>

				<div class="flex flex-col">
					<h3 class="h5">Summary</h3>
					<table class="mx-auto table h-full border-separate space-y-6 text-xs">
						<thead class="preset-filled-surface-200-800 text-lg font-bold">
							<tr class="text-surface-900-100">
								<th></th>
								<th>Amount</th>
								<th>Gross</th>
								<th>Fees</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody class="preset-filled-surface-100-900 [&>tr]:hover:preset-tonal-surface">
							{#each [charges, refunds, adjusts] as entry}
								<tr>
									<td>{entry.name}</td>
									<td class="text-right">{entry.amount}</td>
									<td class="text-right">{currency(entry.gross / 100, payout.currency)}</td>
									<td class="text-right">{currency(entry.fees / 100, payout.currency)}</td>
									<td class="text-right">{currency(entry.total / 100, payout.currency)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div>
					<div class="flex justify-between">
						<h3 class="h5">Transactions</h3>
						<button
							class="btn preset-filled-surface-500"
							onclick={exportTransactions}
							disabled={loading}
						>
							{#if loading}
								Loading
							{:else}
								Export
							{/if}
						</button>
					</div>

					<div class="[&>a]:hover:preset-tonal-surface my-2 flex flex-col">
						{#await transactionsPromise}
							Loading...
						{:then transactions}
							{#each transactions as transaction}
								<a
									href={transactionURL + transaction.id}
									class="border-surface-500 flex justify-between border-b-1"
								>
									<div class="flex flex-col">
										<span>{capitalize(transaction.type.replaceAll("_", " "))}</span>
										<span class="text-surface-700-300 text-xs">{transaction.description}</span>
									</div>
									<span class="my-auto text-right">
										{currency(transaction.amount / 100, transaction.currency)}
									</span>
								</a>
							{/each}
						{/await}
					</div>
				</div>
			</div>
		{/await}
	</div>
	<div class="flex justify-end">
		<a href={payoutURL} type="button" class="btn preset-tonal" data-sveltekit-noscroll> Close </a>
	</div>
</dialog>
