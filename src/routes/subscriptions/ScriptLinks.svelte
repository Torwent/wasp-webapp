<script lang="ts">
	import { goto } from "$app/navigation"
	import type { BundleProduct } from "$lib/types/collection"
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { PanelBottomOpen, PanelTopOpen } from "svelte-lucide"
	import ExternalLink from "svelte-lucide/ExternalLink.svelte"

	let { bundle = $bindable() }: { bundle: BundleProduct } = $props()

	function close() {
		bundle.open = false
	}
</script>

<Modal
	bind:open={bundle.open}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm p-12"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet trigger()}
		{#if bundle.open}
			<PanelBottomOpen size="16" />
		{:else}
			<PanelTopOpen size="16" />
		{/if}
		Bundle
	{/snippet}
	{#snippet content()}
		<header class="flex justify-between">
			<h5 class="h5 flex flex-col gap-4 lg:h4 lg:flex-row">
				<span>{bundle.name}</span>
				<span>
					{#await bundle.username}
						by Loading...
					{:then username}
						by {username}
					{/await}
				</span>
			</h5>
		</header>
		<article class="table-wrap">
			<table class="table-compact table">
				<tbody class="preset-filled-surface-100-900 hover:[&>tr]:preset-tonal">
					{#each bundle.scripts as script}
						<tr
							class="flex h-full w-full cursor-pointer"
							onclick={() => goto("/scripts/" + script.url)}
						>
							<td class="text-xs">
								<div class="align-items-center ml-3 flex">
									<ExternalLink size="16" class="mr-4" />
									{script.title}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={close}>Confirm</button>
		</footer>
	{/snippet}
</Modal>
