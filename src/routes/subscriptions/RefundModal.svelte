<script lang="ts">
	import type { Price } from "$lib/types/collection"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { RotateCw } from "svelte-lucide"
	let {
		name,
		username,
		subscription,
		price,
		date_end
	}: {
		name: string
		username: Promise<string | null>
		subscription: string
		price: Price
		date_end: string
	} = $props()
	let open = $state(false)

	const value = price.amount - Math.min(price.amount * 0.15, 500)

	const priceStr = new Intl.NumberFormat("pt-PT", {
		style: "currency",
		currency: price?.currency ?? "eur"
	}).format((value ?? 0) / 100)

	const endDate = new Date(date_end)
	const startDate = new Date(endDate)

	switch (price.interval) {
		case "week":
			startDate.setDate(startDate.getDate() - 7)
			break
		case "month":
			startDate.setMonth(startDate.getMonth() - 1)
			break
		case "year":
			startDate.setFullYear(startDate.getFullYear() - 1)
			break
		default:
	}

	const start_date = startDate.getTime()
	const end_date = endDate.getTime()

	const DAY = 24 * 3600000
	const tenDayMS = 10 * DAY

	const intervalMs = end_date - start_date
	const tenPercentMs = intervalMs * 0.1
	const windowMs = Math.min(tenPercentMs, tenDayMS)

	const elapsedSinceStartMs = Date.now() - start_date

	const endWindow = new Date(start_date + DAY + windowMs)
</script>

{#if elapsedSinceStartMs <= windowMs}
	<Modal
		{open}
		onOpenChange={(e) => {
			open = e.open
		}}
		triggerBase="btn preset-tonal"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[70%] max-w-fit max-h-[95%] overflow-y-auto"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet trigger()}
			<RotateCw size="16" />
			<span>Refund</span>
		{/snippet}
		{#snippet content()}
			<header class="flex justify-between">
				<h5 class="h5 lg:h4 flex flex-col gap-4 lg:flex-row">
					Refund
					<span>{name}</span>
					<span>
						{#await username}
							by Loading...
						{:then username}
							by {username}
						{/await}
					</span>
				</h5>
			</header>
			<article class="my-16">
				<p>Are you sure you want to refund this product?</p>
				<p class="my-4">You are about to refund:</p>

				<b>
					<span>{name}</span>
					<span>
						{#await username}
							by Loading...
						{:then username}
							by {username}
						{/await}
					</span>
				</b>
				<p class="mt-8">
					You will not be refunded the processing fees and will lose instant access to it.
				</p>
				<p>
					Please consider
					<a href="https://discord.gg/Khp7RXpRz4" class="text-secondary-500 hover:underline">
						asking for help on Discord if you are having technical issues
					</a>.
				</p>
				<p class="my-8">The total amount you will be refunded will be roughly <b>{priceStr}</b>.</p>

				<div class="text-warning-500 bg-surface-300-700 m-4 flex flex-col gap-4 rounded-md p-2">
					{#if elapsedSinceStartMs < DAY}
						<p>
							The refund option will be available after <span class="text-error-500">1 day</span>
							and you will have until the
							<span class="text-error-500">{endWindow.toLocaleString()}</span>
							to request it.
						</p>
						<p>
							While it's not available try reaching out to
							<span class="text-error-500">
								{#await username}
									Loading...
								{:then username}
									{username}
								{/await}
							</span>
							and let him know if you are having issues!
						</p>
					{:else}
						<p>
							Refunding will be available until <span class="text-error-500">
								{endWindow.toLocaleString()}
							</span>
						</p>
					{/if}
				</div>
			</article>
			<footer class="flex justify-end gap-4">
				{#if elapsedSinceStartMs >= DAY && elapsedSinceStartMs <= windowMs}
					<form id="refundsform" method="POST" action={"?/refund&id=" + subscription}>
						<button type="submit" class="btn preset-filled-error-500"> Refund </button>
					</form>
					<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>
						Cancel
					</button>
				{:else}
					<button type="button" disabled class="btn preset-filled-error-500"> Refund </button>
					<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>
						Cancel
					</button>
				{/if}
			</footer>
		{/snippet}
	</Modal>
{:else}
	<button disabled class="btn preset-tonal">
		<RotateCw size="16" />
		<span>Refund</span>
	</button>
{/if}
