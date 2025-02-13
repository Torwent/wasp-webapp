<script lang="ts">
	import { BadgeAlert, BadgeCheck, ExternalLink } from "svelte-lucide"
	import ScriptHeader from "../ScriptHeader.svelte"
	import { WaspProfile, canDownload, canEdit, getBundles, getProducts } from "$lib/client/supabase"
	import ScriptData from "./ScriptData.svelte"
	import AdvancedButton from "./AdvancedButton.svelte"
	import ZipDownload from "./ZipDownload.svelte"
	import { page } from "$app/state"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { getCurrentPrice, getPriceIntervalEx, setPriceInterval } from "$lib/utils"
	import ScriptArticle from "../ScriptArticle.svelte"
	import { replaceScriptContent } from "$lib/client/utils"

	const { data } = $props()
	const { script, dismissed, profile, roles, supabaseClient } = $derived(data)

	let products: Awaited<ReturnType<typeof getProducts>> | null = $state(null)

	async function canDownloadScript() {
		if (!script) return false
		if (script.metadata.type === "free") return true
		const result = await canDownload(supabaseClient, roles, script.id)
		if (!result) products = await getProducts(supabaseClient, script.id)
		return result
	}
</script>

<main class="mx-auto flex w-[90%] flex-col">
	<ScriptHeader
		id={script?.id}
		title={script?.title}
		username={script?.protected.username}
		description={script?.description}
	>
		<img
			class="rounded-md"
			src={script ? script.protected.assets + "banner.jpg" : "/banner.jpg"}
			alt="Script banner"
			loading="lazy"
		/>
	</ScriptHeader>

	<div class="container mx-auto mb-6 max-w-lg flex-grow md:max-w-5xl">
		<header class="my-8">
			<form method="POST" class="grid">
				{#if script?.protected.broken}
					<h4 class="my-2 text-error-500">
						This script has been reported broken and it might not work.
					</h4>
				{/if}
				<div class="my-2 flex">
					{#if roles?.tester}
						<button
							type="submit"
							class="btn mx-auto preset-outlined-success-500"
							formaction="?/clear&id={script?.id}"
						>
							<BadgeCheck class="mr-2" />
							{script ? "Clear reports" : "Loading..."}
						</button>
					{/if}
					<button
						type="submit"
						class="btn mx-auto preset-outlined-error-500"
						formaction="?/report&id={script?.id}"
					>
						{script ? "Report broken" : "Loading..."}
						<BadgeAlert class="ml-2" />
					</button>
				</div>
			</form>

			{#if !script?.published && canEdit(profile?.id, roles, script?.protected.author_id)}
				<h4 class="text-shadow my-4 text-center text-error-500 drop-shadow-2xl">Unpublished</h4>
			{/if}
		</header>
		{#if script && canEdit(profile?.id, roles, script.protected.author_id)}
			<ScriptData id={script.id} />
		{/if}

		{#if profile}
			<div class="text-center">
				{#await canDownloadScript()}
					<div class="grid animate-pulse justify-center justify-items-center gap-8 py-12">
						<AdvancedButton
							id={script?.id}
							title={script?.title ?? ""}
							rev={script?.protected.revision}
						/>
						<ZipDownload id={script?.id} />
					</div>
				{:then has_access}
					{#if has_access}
						<div class="grid justify-center justify-items-center gap-8 py-12">
							<AdvancedButton
								id={script?.id}
								title={script?.title ?? ""}
								rev={script?.protected.revision}
							/>
							<ZipDownload id={script?.id} />
							{#if canEdit(profile?.id, roles, script?.protected.author_id)}
								<div class="my-8 grid place-items-center">
									<a href="{page.url.pathname}/edit" class="btn preset-filled-secondary-500">Edit</a
									>
								</div>
							{/if}
						</div>
					{:else}
						<div class="my-8 rounded-md p-4 preset-outlined-surface-500">
							<h4 class="py-2">
								This is a <span class="text-secondary-500">premium</span>
								script that you don't have access to.
							</h4>
							<h5>
								To be able to download this script buy a
								<a href="/subscriptions" class="font-semibold text-secondary-500 hover:underline">
									subscription
								</a>
								that gives you access to it! You can buy it with the following products
							</h5>

							{#if script?.metadata.type === "premium" && products}
								<form method="POST" class="table-wrap my-12 flex justify-evenly overflow-auto">
									<table class="table">
										<TableHeader headers={["Product", "Type", "Price", "Interval", "Checkout"]} />
										<tbody class="hover:[&>tr]:preset-tonal">
											{#each products.bundles as bundle}
												<tr class="table-row">
													<TableCell alignment="left" padding={0}>
														<div class="mx-3">
															<div>{bundle.name}</div>
														</div>
													</TableCell>

													<TableCell padding={0}>
														<a
															href="/subscriptions"
															class="btn hover:cursor-pointer hover:text-primary-500"
														>
															<ExternalLink size="16" />
															<span>Bundle</span>
														</a>
													</TableCell>

													<TableCell>{getCurrentPrice(bundle.prices)}</TableCell>

													<TableCell padding={0}>
														<div
															class="btn-group-vertical rounded-md preset-outlined-surface-500 md:btn-group"
														>
															{#each bundle.prices as price, j}
																<button
																	class="btn"
																	class:preset-outlined-primary-500={price.active}
																	onclick={() => setPriceInterval(j, bundle.prices)}
																>
																	{getPriceIntervalEx(price)}
																</button>
															{/each}
														</div>
													</TableCell>

													<TableCell padding={0}>
														<button
															class="btn preset-filled-secondary-500"
															formaction="?/checkout&product={bundle.id}&price={bundle.prices.find(
																(p) => p.active
															)?.id}"
														>
															Checkout
														</button>
													</TableCell>
												</tr>
											{/each}

											{#each products.scripts as script}
												<tr>
													<TableCell alignment="left" padding={0}>
														<div class="mx-3">
															<div class="">{script.name}</div>
														</div>
													</TableCell>

													<TableCell padding={0}>
														<a
															href="/subscriptions"
															class="btn hover:cursor-pointer hover:text-primary-500"
														>
															<ExternalLink size="16" />
															<span>Script</span>
														</a>
													</TableCell>

													<TableCell>{getCurrentPrice(script.prices)}</TableCell>

													<TableCell padding={0}>
														<div
															class="btn-group-vertical rounded-md preset-outlined-surface-500 md:btn-group"
														>
															{#each script.prices as price, j}
																<button
																	class="btn"
																	class:preset-outlined-primary-500={price.active}
																	onclick={() => {
																		setPriceInterval(j, script.prices)
																		products = products
																	}}
																>
																	{getPriceIntervalEx(price)}
																</button>
															{/each}
														</div>
													</TableCell>

													<TableCell padding={0}>
														<button
															class="btn preset-filled-secondary-500"
															formaction="?/checkout&product={script.id}&price={script.prices.find(
																(p) => p.active
															)?.id}"
														>
															Checkout
														</button>
													</TableCell>
												</tr>
											{/each}
										</tbody>
									</table>
								</form>
							{/if}
						</div>
					{/if}
				{/await}
			</div>
		{/if}
	</div>

	<ScriptArticle content={script ? replaceScriptContent(script) : "Loading..."} />
</main>
