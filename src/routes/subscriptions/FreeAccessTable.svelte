<script lang="ts">
	import TableHeader from "$lib/components/TableHeader.svelte"
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

<div class="mx-auto w-screen max-w-fit">
	<h1 class="my-12 justify-center text-center font-bold">Free access</h1>

	<div class="table-wrap preset-outlined-surface-500 mx-auto max-w-[95%] rounded-md">
		<table class="table border-separate space-y-6 text-xs md:text-sm">
			<TableHeader headers={["Product", "Type", "Start date", "End date"]} />
			<tbody class="preset-filled-surface-200-800 [&>tr]:hover:preset-tonal">
				{#each freeAccess as access, i (access.product)}
					{#if bundleArray[i]}
						<tr class="table-row">
							<td>
								<div class="mx-3">
									<div>{bundleArray[i].name}</div>

									{#await bundleArray[i].username}
										<div class="text-left text-xs">by Loading...</div>
									{:then username}
										<div class="text-left text-xs">by {username}</div>
									{/await}
								</div>
							</td>

							<td class="text-center">
								<ScriptLinks bundle={bundleArray[i]} />
							</td>

							<td class="text-center">
								{new Date(access.date_start).toLocaleString(userLocale)}
							</td>

							<td class="text-center">
								{new Date(access.date_end).toLocaleString(userLocale)}
							</td>
						</tr>
					{:else}
						{@const script = getScript(access.product)}

						{#if script}
							<tr class="table-row">
								<td>
									<div class="mx-3">
										<div>{script.name}</div>
										{#await script.username}
											<div class="text-left text-xs">by Loading...</div>
										{:then username}
											<div class="text-left text-xs">by {username}</div>
										{/await}
									</div>
								</td>

								<td class="text-center">
									<a href="/scripts/{script.url}" class="permalink">
										<button class="btn hover:text-primary-500 hover:cursor-pointer">
											<ExternalLink size="16" />
											<span>Script</span>
										</button>
									</a>
								</td>

								<td class="text-center">
									{new Date(access.date_start).toLocaleString(userLocale)}
								</td>

								<td class="text-center">
									{new Date(access.date_end).toLocaleString(userLocale)}
								</td>
							</tr>
						{/if}
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>
