<script lang="ts">
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import type { BundleProduct, FreeAccess, ScriptProduct } from "$lib/types/collection"
	import ExternalLink from "svelte-lucide/ExternalLink.svelte"
	import ScriptLinks from "./ScriptLinks.svelte"

	let {
		freeAccess,
		bundles,
		scripts
	}: {
		freeAccess: FreeAccess[]
		bundles: BundleProduct[]
		scripts: ScriptProduct[]
	} = $props()

	function getBundle(id: string) {
		return bundles.find((bundle) => bundle.id === id)
	}

	function getScript(id: string) {
		return scripts.find((script) => script.id === id)
	}

	let userLocale = navigator.language ?? "pt-PT"

	let bundleArray: (BundleProduct | undefined)[] = $state([])
	freeAccess.forEach((access) => {
		bundleArray.push(getBundle(access.product))
	})
</script>

<div class="mx-auto my-4 items-center justify-center">
	<h3 class="my-12 justify-center text-center">Free access</h3>

	<div
		class="xl:mx-w-7xl table-wrap mx-auto max-w-md rounded-md preset-outlined-surface-500 md:max-w-3xl lg:max-w-6xl"
	>
		<table class="table border-separate space-y-6 text-xs">
			<TableHeader headers={["Product", "Type", "Start date", "End date"]} />
			<tbody class="preset-filled-surface-200-800 hover:[&>tr]:preset-tonal">
				{#each freeAccess as access, i}
					{#if bundleArray[i]}
						<tr class="table-row">
							<TableCell alignment="left" padding={0}>
								<div class="mx-3">
									<div>{bundleArray[i].name}</div>

									{#await bundleArray[i].username}
										<div class="text-left text-xs">by Loading...</div>
									{:then username}
										<div class="text-left text-xs">by {username}</div>
									{/await}
								</div>
							</TableCell>

							<TableCell padding={0}>
								<ScriptLinks bind:bundle={bundleArray[i]} />
							</TableCell>

							<TableCell>
								{new Date(access.date_start).toLocaleString(userLocale)}
							</TableCell>

							<TableCell>
								{new Date(access.date_end).toLocaleString(userLocale)}
							</TableCell>
						</tr>
					{:else}
						{@const script = getScript(access.product)}

						{#if script}
							<tr class="table-row">
								<TableCell alignment="left" padding={0}>
									<div class="mx-3">
										<div>{script.name}</div>
										{#await script.username}
											<div class="text-left text-xs">by Loading...</div>
										{:then username}
											<div class="text-left text-xs">by {username}</div>
										{/await}
									</div>
								</TableCell>

								<TableCell padding={0}>
									<a href="/scripts/{script.url}" class="permalink">
										<button class="btn hover:cursor-pointer hover:text-primary-500">
											<ExternalLink size="16" />
											<span>Script</span>
										</button>
									</a>
								</TableCell>

								<TableCell>
									{new Date(access.date_start).toLocaleString(userLocale)}
								</TableCell>

								<TableCell>
									{new Date(access.date_end).toLocaleString(userLocale)}
								</TableCell>
							</tr>
						{/if}
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
