<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte"
	import { PanelBottomOpen, PanelTopOpen } from "svelte-lucide"

	let {
		scripts = $bindable()
	}: {
		scripts: {
			name: string
			author: string
			active: boolean
			id: string
			url: string
		}[]
	} = $props()

	let open = $state(false)
</script>

<Modal
	bind:open
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
			<h5 class="my-4 flex flex-col gap-4 text-lg lg:h4 lg:flex-row">
				Choose the scripts you want on this bundle:
			</h5>
		</header>
		<article class="table-wrap">
			<table class="table-compact table">
				<tbody class="preset-filled-surface-100-900 hover:[&>tr]:preset-tonal">
					{#each scripts as _, i}
						<tr class="flex h-full w-full" onclick={() => {}}>
							<td class="h-full w-full p-0 text-xs">
								<label class="flex h-full w-full items-center space-x-2">
									<input class="checkbox" type="checkbox" bind:checked={scripts[i].active} />
									<span class="select-none">{scripts[i].name}</span>
								</label>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={() => (open = false)}>Confirm</button>
		</footer>
	{/snippet}
</Modal>
