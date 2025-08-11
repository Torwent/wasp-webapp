<script lang="ts">
	import type { Price } from "$lib/types/collection"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { RotateCw } from "svelte-lucide"
	let {
		name,
		username,
		subscription,
		price
	}: {
		name: string
		username: Promise<string | null>
		subscription: string
		price: Price | undefined
	} = $props()
	let open = $state(false)

	const value = Math.min((price?.amount ?? 0) - Math.ceil((price?.amount ?? 0) * 0.22), 500)

	const priceStr = new Intl.NumberFormat("pt-PT", {
		style: "currency",
		currency: price?.currency ?? "eur"
	}).format((value ?? 0) / 100)
</script>

<Modal
	{open}
	onOpenChange={(e) => (open = e.open)}
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
			<p class="my-4">
				You will not be refunded the processing fees and will lose instant access to it.
			</p>
			<p>The total amount you will be refunded will be roughly <b>{priceStr}</b>.</p>
		</article>
		<footer class="flex justify-end gap-4">
			<form id="refundsform" method="POST" action={"?/refund&id=" + subscription}>
				<button type="submit" class="btn preset-filled-error-500"> Refund </button>
			</form>
			<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>Cancel</button>
		</footer>
	{/snippet}
</Modal>
