<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { PanelBottomOpen, PanelTopOpen } from "svelte-lucide"

	let { children } = $props()
	let open = $state(false)
</script>

<Modal
	{open}
	onOpenChange={(e) => (open = e.open)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[95%] max-w-fit max-h-[95%] overflow-y-auto"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		{#if open}
			<PanelBottomOpen size="16" />
		{:else}
			<PanelTopOpen size="16" />
		{/if}
		<span>Edit Scripts</span>
	{/snippet}
	{#snippet content()}
		<header class="flex justify-between">
			<h5 class="lg:h4 my-4 flex flex-col gap-4 text-lg lg:flex-row">
				Choose the scripts you want on this bundle:
			</h5>
		</header>
		<article class="table-wrap my-12 max-h-[28rem] w-full">
			<table class="table">
				<tbody class="[&>tr]:hover:preset-tonal">
					{@render children()}
				</tbody>
			</table>
		</article>
		<small class="mb-12 hidden justify-center md:flex">
			On Desktop you can also use your keyboard:
			<kbd class="kbd">Tab, Shift + Tab and Space</kbd>
		</small>

		<footer class="my-4 flex gap-4">
			<button type="button" class="btn preset-tonal mx-auto" onclick={() => (open = false)}
				>Confirm</button
			>
		</footer>
	{/snippet}
</Modal>
