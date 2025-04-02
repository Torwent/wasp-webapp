<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { PanelBottomOpen, PanelTopOpen } from "svelte-lucide"

	let { children } = $props()
	let open = $state(false)
</script>

<Modal
	{open}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm p-12 w-full"
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
		<article class="table-wrap my-12">
			<table class="table-compact table">
				<tbody class="preset-filled-surface-100-900 [&>tr]:hover:preset-tonal">
					{@render children()}
				</tbody>
			</table>
		</article>
		<small class="mx-auto my-16 py-8">
			On Desktop you can also use your keyboard:
			<kbd class="kbd">Tab, Shift + Tab and Space</kbd>
		</small>

		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>Confirm</button>
		</footer>
	{/snippet}
</Modal>
