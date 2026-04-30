<script lang="ts">
	import { page } from "$app/state"
	import { currency } from "$lib/utils"
	import { onMount } from "svelte"
	import { SvelteDate } from "svelte/reactivity"
	const { data } = $props()
	let { transaction, source, charge, user } = $derived(data)

	let dialog: HTMLDialogElement

	const pathParts = page.url.pathname.split("/")
	const len = pathParts.indexOf("transactions")
	let url = "/"
	for (let i = 1; i < len; i++) {
		url += pathParts[i] + "/"
	}
	const transactionURL = url + "transactions/"

	onMount(() => dialog.showModal())
</script>

<dialog
	bind:this={dialog}
	class="outline-surface-500 bg-surface-100-900 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75 top-1/2 left-1/2 z-10 max-w-[640px] -translate-1/2 space-y-4 rounded-md p-4 text-inherit outline-1"
>
	<div class="h-fit w-fit">
		<div class="my-2 w-96 gap-3">
			<h2 class="h2 my-2">
				{currency(transaction.amount / 100, transaction.currency)}
			</h2>

			<div class="text-surface-800-200 flex flex-col text-sm">
				<p>Started on {new SvelteDate(transaction.created * 1000).toLocaleString()}</p>
				<p>Available on {new SvelteDate(transaction.available_on * 1000).toLocaleString()}</p>
			</div>
		</div>

		<div class="flex h-fit max-h-96 flex-col gap-4 overflow-auto p-4">
			<h3 class="h5">General View</h3>
			<div class="text-surface-900-100 grid grid-cols-3 gap-x-4 text-sm">
				<span>Transaction ID</span>
				<span class="col-span-2">{transaction.id}</span>
				<span>Source ID</span>
				<span class="col-span-2">{source}</span>
				<span>Charge ID</span>
				<span class="col-span-2">{charge}</span>
			</div>

			<div class="text-surface-900-100 grid grid-cols-3 gap-x-4 text-sm">
				<span>WSID</span>
				<span class="col-span-2">{user.waspscripts}</span>
				<span>Discord ID</span>
				<span class="col-span-2">{user.discord}</span>
			</div>

			<div class="text-surface-900-100 grid grid-cols-3 gap-x-4 text-sm">
				<span>Amount</span>
				<span class="col-span-2">
					{currency(transaction.amount / 100, transaction.currency)}
				</span>
				<span>Fee</span>
				<span class="col-span-2">
					{currency(transaction.fee / 100, transaction.currency)}
				</span>
				<span>Net</span>
				<span class="col-span-2">
					{currency(transaction.net / 100, transaction.currency)}
				</span>

				<span>Country</span>
				<span class="col-span-2">{user.country}</span>
			</div>
		</div>
	</div>
	<div class="flex justify-end">
		<a href={transactionURL} class="btn preset-tonal" data-sveltekit-noscroll> Close </a>
	</div>
</dialog>
