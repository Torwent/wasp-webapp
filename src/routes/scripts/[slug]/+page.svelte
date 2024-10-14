<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { WaspProfile, canDownload, canEdit, getBundles, getProducts } from "$lib/client/supabase"
	import AdvancedButton from "$lib/components/AdvancedButton.svelte"
	import ZipDownload from "$lib/components/ZIPDownload.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { getModalStore, type ModalSettings, getToastStore } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import ScriptHeader from "../ScriptHeader.svelte"
	import ScriptArticle from "../ScriptArticle.svelte"
	import StatsHeader from "../StatsHeader.svelte"
	import { onMount } from "svelte"
	import { replaceScriptContent } from "$lib/client/utils"
	import ScriptData from "./ScriptData.svelte"
	import {
		BadgeAlert,
		BadgeCheck,
		ExternalLink,
		PanelBottomOpen,
		PanelTopOpen,
		RotateCw
	} from "lucide-svelte"

	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { getCurrentPrice, getPriceIntervalEx, setPriceInterval } from "$lib/utils"
	import type { Price } from "$lib/types/collection"
	import ScriptLinks from "../../subscriptions/ScriptLinks.svelte"

	export let data

	let { scriptPromise, dismissed, profile, supabaseClient, roles } = data
	$: ({ scriptPromise, dismissed, profile, supabaseClient, roles } = data)

	const toastStore = getToastStore()
	const modalStore = getModalStore()

	let script: Awaited<typeof scriptPromise> | null = null
	$: scriptPromise?.then((awaited) => (script = awaited))

	function warningDismissed(r: boolean) {
		if (r) {
			if (profile) WaspProfile.updateWarning(supabaseClient, profile?.id)
			if (browser) document.cookie = `warning_dismissed=true;max-age=31536000;path="/"`
		} else goto("/scripts")
	}

	const warn: ModalSettings = {
		type: "confirm",
		// Data
		title: "Community Script",
		buttonTextConfirm: "I agree",
		body: `
		<div class="variant-ghost-error flex">
			<div class="block p-4">
				<p>
					Community scripts can be uploaded by anyone with the
					<span class="text-sky-500 dark:text-teal-400"> Scripter </span>
					role and are not reviewed, therefore they can be malicious.
				</p>
				<br>
				<p>
					You shouldn't use a community script you are not willing to review or that you don't
					trust it's developer.
				</p>
				<br>
				<p>
					Maintenance of the script is also responsibility of it's developer. So if the script
					doesn't work or has bugs you need to report those issues to the developer.
				</p>
				<p>
					For more information read the <a href="/legal/user_tos">user terms of service</a>.
				</p>
			</div>
		</div>
		`,
		response: (r: boolean) => warningDismissed(r)
	}

	let warningPromise: Promise<boolean>

	if (!dismissed) warningPromise = WaspProfile.getWarning(supabaseClient, profile?.id)

	onMount(async () => {
		const s = await scriptPromise
		if (!$page.url.pathname.includes("-by-")) history.replaceState({}, "", "/scripts/" + s.url)
		if (!dismissed && s.categories.includes("Community")) {
			if (!(await warningPromise)) modalStore.trigger(warn)
		}
	})

	let products: Awaited<ReturnType<typeof getProducts>> | null = null

	async function canDownloadScript() {
		const script = await scriptPromise
		if (!script) return false
		if (script.categories.includes("Free")) return true
		const result = await canDownload(supabaseClient, roles, script.id)

		if (!result) products = await getProducts(supabaseClient, script.id)
		return result
	}

	if (!profile) {
		toastStore.trigger({
			message: "Please login to be able to download this script.",
			action: {
				label: "Login",
				response: async () => goto("/login")
			},
			timeout: 12000
		})
	}
</script>

<svelte:head>
	{#if script}
		<title>{script.title + " - WaspScripts"}</title>
		<meta name="description" content={"RuneScape OSRS Color Bot - " + script.description} />
		<meta
			name="keywords"
			content={"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
				script.subcategories}
		/>
		<meta name="author" content={script.protected.username} />
		<meta name="robots" content="all" />

		<!-- OpenGraph tags -->
		<meta property="og:type" content="website" />
		<meta property="og:title" content={script.title + " - WaspScripts"} />
		<meta property="og:url" content={$page.url.href} />
		<meta property="og:image" content={script.protected.assets + "banner.jpg"} />
		<meta property="og:image:type" content="image/jpeg" />
		<meta property="og:image:alt" content="WaspScripts Logo" />
		<meta property="og:description" content={"RuneScape OSRS Color Bot - " + script.description} />

		<!-- Twitter tags -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={script.title + " - WaspScripts"} />
		<meta name="twitter:description" content={"RuneScape OSRS Color Bot - " + script.description} />
		<meta name="twitter:image" content={script.protected.assets + "banner.jpg"} />
	{/if}
</svelte:head>

<main class="flex flex-col w-[90%] mx-auto">
	<ScriptHeader
		id={script?.id}
		title={script?.title}
		username={script?.protected.username}
		description={script?.description}
	>
		<img
			class="rounded-md {!script ? 'animate-pulse' : ''}"
			src={script ? script.protected.assets + "banner.jpg" : "/banner.jpg"}
			alt="Script banner"
			loading="lazy"
		/>
	</ScriptHeader>

	<div class="container mx-auto mb-6 max-w-lg md:max-w-5xl flex-grow">
		<header class="my-8">
			<form method="POST" class="grid">
				{#if script?.protected.broken}
					<h4 class="text-error-500 my-2">
						This script has been reported broken and it might not work.
					</h4>
				{/if}
				<div class="flex my-2">
					{#if roles?.tester}
						<button
							type="submit"
							class="mx-auto btn variant-glass-success"
							formaction="?/clear&id={script?.id}"
						>
							<BadgeCheck class="mr-2" />
							{script ? "Clear reports" : "Loading..."}
						</button>
					{/if}
					<button
						type="submit"
						class="mx-auto btn variant-glass-error"
						formaction="?/report&id={script?.id}"
					>
						{script ? "Report broken" : "Loading..."}
						<BadgeAlert class="ml-2" />
					</button>
				</div>
			</form>

			{#if script && !script.published && canEdit(profile?.id, roles, script.protected.author_id)}
				<h4 class="my-4 text-center text-error-500 text-shadow drop-shadow-2xl">Unpublished</h4>
			{/if}
		</header>

		{#if script && canEdit(profile?.id, roles, script.protected.author_id)}
			<ScriptData id={script.id} />
		{/if}

		{#if profile}
			<div class="text-center">
				{#await canDownloadScript()}
					<div class="py-12 grid justify-center justify-items-center gap-8 animate-pulse">
						<AdvancedButton
							id={script?.id}
							title={script?.title ?? ""}
							rev={script?.protected.revision}
						/>
						<ZipDownload id={script?.id} />
					</div>
				{:then has_access}
					{#if has_access}
						<div class="py-12 grid justify-center justify-items-center gap-8">
							<AdvancedButton
								id={script?.id}
								title={script?.title ?? ""}
								rev={script?.protected.revision}
							/>
							<ZipDownload id={script?.id} />
							<EditButton author={script?.protected.author_id} />
						</div>
					{:else}
						<div class="variant-outline-surface rounded-md p-4 my-8">
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

							{#if script?.categories.includes("Premium") && products}
								<form method="POST" class="my-12 flex justify-evenly overflow-auto">
									<table class="table table-hover border-separate space-y-6 text-xs">
										<TableHeader headers={["Product", "Type", "Price", "Interval", "Checkout"]} />
										<tbody>
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
															<ExternalLink size={16} />
															<span>Bundle</span>
														</a>
													</TableCell>

													<TableCell>{getCurrentPrice(bundle.prices)}</TableCell>

													<TableCell padding={0}>
														<div
															class="btn-group-vertical md:btn-group variant-outline-surface rounded-md"
														>
															{#each bundle.prices as price, j}
																<button
																	class="btn"
																	class:variant-ringed-primary={price.active}
																	on:click|preventDefault={() => setPriceInterval(j, bundle.prices)}
																>
																	{getPriceIntervalEx(price)}
																</button>
															{/each}
														</div>
													</TableCell>

													<TableCell padding={0}>
														<button
															class="btn variant-filled-secondary"
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
															<ExternalLink size={16} />
															<span>Script</span>
														</a>
													</TableCell>

													<TableCell>{getCurrentPrice(script.prices)}</TableCell>

													<TableCell padding={0}>
														<div
															class="btn-group-vertical md:btn-group variant-outline-surface rounded-md"
														>
															{#each script.prices as price, j}
																<button
																	class="btn"
																	class:variant-ringed-primary={price.active}
																	on:click|preventDefault={() => {
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
															class="btn variant-filled-secondary"
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

		<ScriptArticle content={script ? replaceScriptContent(script) : "Loading..."} />
	</div>
</main>
