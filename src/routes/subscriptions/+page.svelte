<script lang="ts">
	import { SlideToggle } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import { superForm } from "sveltekit-superforms/client"
	import { checkoutSchema } from "$lib/client/schemas"
	import { onMount } from "svelte"
	import { ExternalLink, PanelBottomOpen, PanelTopOpen, RotateCw } from "lucide-svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import ScriptLinks from "./ScriptLinks.svelte"
	import type { FreeAccess, Price, Subscription } from "$lib/types/collection"
	import {
		getCurrentPrice,
		getPrice,
		getPriceAmount,
		getPriceIntervalEx,
		setPriceInterval
	} from "$lib/utils"
	import { zodClient } from "sveltekit-superforms/adapters"

	export let data

	let { profile, pageDataPromise, pricesPromise, subscriptionsPromise, freeAccessPromise } = data
	$: ({ profile, pageDataPromise, pricesPromise, subscriptionsPromise, freeAccessPromise } = data)

	let bundles: Awaited<typeof pageDataPromise>["bundles"] | null = null
	let scripts: Awaited<typeof pageDataPromise>["scripts"] | null = null

	pageDataPromise.then((awaited) => {
		bundles = awaited.bundles
		scripts = awaited.scripts
	})

	$: if (bundles && scripts) $checkoutForm.products = [...bundles, ...scripts]

	const { errors: subscriptionsErrors, enhance: subscriptionEnhance } = superForm(
		data.subscriptionsform,
		{
			dataType: "json",
			multipleSubmits: "prevent",
			clearOnSubmit: "errors"
		}
	)

	let subscriptions: Subscription[] | null = null
	$: if (subscriptionsPromise) {
		subscriptionsPromise.then((subs) => (subscriptions = subs))
	} else subscriptions = null

	let free_access: FreeAccess[] | null = null
	$: if (freeAccessPromise) {
		freeAccessPromise.then((free) => (free_access = free))
	} else subscriptions = null

	$: if (subscriptions && bundles && scripts) {
		subscriptions.forEach((sub) => {
			bundles?.forEach((bundle) => {
				if (sub.product === bundle.id) bundle.active = false
			})

			scripts?.forEach((script) => {
				if (sub.product === script.id) script.active = false
			})
		})
	}

	let subsform: HTMLFormElement

	const {
		form: checkoutForm,
		errors: checkoutErrors,
		enhance: checkoutEnhance,
		allErrors
	} = superForm(data.checkoutForm, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: null,
		validators: zodClient(checkoutSchema)
	})

	function changePriceInterval(prices: Price[], index: number, productIndex: number) {
		setPriceInterval(index, prices)
		bundles = bundles //this is stupid but is required to trigger a redraw
		scripts = scripts //this is stupid but is required to trigger a redraw

		$checkoutForm.products[productIndex].prices = prices
	}

	async function getBundle(id: string) {
		return bundles?.find((bundle) => bundle.id === id)
	}

	async function getScript(id: string) {
		return scripts?.find((script) => script.id === id)
	}

	let userLocale = "pt-PT"
	onMount(() => {
		userLocale = navigator.language
	})

	const headTitle = "Subscriptions - WaspScripts"
	const headDescription =
		"Get access to exclusive scripts. With access to premium scripts you have scripts for nearly all skills in OSRS."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="grid my-8">
	{#if profile}
		{#if subscriptions}
			<form
				method="POST"
				class="my-4 items-center justify-center"
				use:subscriptionEnhance
				bind:this={subsform}
				action="?/subscriptions"
			>
				<h3 class="justify-center text-center my-12">Current subscriptions</h3>

				{#if $subscriptionsErrors._errors}
					<div class="w-full my-8 text-center mx-auto">
						{#each $subscriptionsErrors._errors as err}
							<span class="text-error-500">{err}</span>
						{/each}
					</div>
				{/if}

				<div class="table-container max-w-md md:max-w-3xl lg:max-w-6xl xl:mx-w-7xl mx-auto">
					<table class="table table-hover border-separate space-y-6 text-xs">
						<TableHeader
							headers={["Product", "Type", "Price", "Interval", "Start date", "End date", "Renew"]}
						/>
						<tbody>
							{#await pricesPromise}
								Loading...
							{:then prices}
								{#each subscriptions as subscription}
									{@const price = getPrice(subscription.price, prices)}
									{#await getBundle(subscription.product)}
										<tr>
											<td colspan="7">
												<span class="flex justify-center text-center py-3">...</span>
											</td>
										</tr>
									{:then bundle}
										{#if bundle}
											<tr class="table-row">
												<TableCell alignment="left" padding={0}>
													<div class="mx-3">
														<div>{bundle.name}</div>
														{#await bundle.username}
															<div class="text-xs text-left">by Loading...</div>
														{:then username}
															<div class="text-xs text-left">by {username}</div>
														{/await}
													</div>
												</TableCell>

												<TableCell padding={0}>
													<button
														class="btn hover:cursor-pointer hover:text-primary-500"
														on:click|preventDefault={() => (bundle.open = !bundle.open)}
													>
														{#if bundle.open}
															<PanelBottomOpen size={16} />{:else}<PanelTopOpen size={16} />
														{/if}

														<span>Bundle</span>
													</button>
												</TableCell>

												<TableCell>{price ? getPriceAmount(price) : "..."}</TableCell>

												<TableCell>{price ? getPriceIntervalEx(price) : "..."}</TableCell>

												<TableCell>
													{new Date(subscription.date_start).toLocaleString(userLocale)}
												</TableCell>

												<TableCell>
													{subscription.cancel ? "Cancels on " : "Renews on "}
													{new Date(subscription.date_end).toLocaleString(userLocale)}
												</TableCell>

												<TableCell>
													<SlideToggle
														name="{subscription.subscription}-slider"
														checked={!subscription.cancel}
														size="sm"
														active="variant-filled-success"
														background="variant-filled-surface"
														disabled={subscription.disabled}
														class={subscription.disabled ? "disabled" : ""}
														on:click={() => {
															if (subscription.disabled) return
															subsform.setAttribute(
																"action",
																"?/subscriptions&product=" + subscription.subscription
															)
															subsform.requestSubmit()
														}}
													/>
												</TableCell>
											</tr>
											{#if bundle.open}
												<ScriptLinks scripts={bundle.scripts} colspan={7} />
											{/if}
										{:else}
											{#await getScript(subscription.product)}
												<tr><TableCell padding={0}>...</TableCell></tr>
											{:then script}
												{#if script}
													<tr class="table-row">
														<TableCell alignment="left" padding={0}>
															<div class="mx-3">
																<div>{script.name}</div>
																{#await script.username}
																	<div class="text-xs text-left">by Loading...</div>
																{:then username}
																	<div class="text-xs text-left">by {username}</div>
																{/await}
															</div>
														</TableCell>

														<TableCell padding={0}>
															<a href="/scripts/{script.url}" class="permalink">
																<button class="btn hover:cursor-pointer hover:text-primary-500">
																	<ExternalLink size={16} />
																	<span>Script</span>
																</button>
															</a>
														</TableCell>

														<TableCell>
															{#if price}
																{getPriceAmount(price)}
															{:else}
																...
															{/if}
														</TableCell>

														<TableCell>
															{#if price}
																{getPriceIntervalEx(price)}
															{:else}
																...
															{/if}
														</TableCell>

														<TableCell>
															{new Date(subscription.date_start).toLocaleString(userLocale)}
														</TableCell>

														<TableCell>
															{subscription.cancel ? "Cancels on " : "Renews on "}
															{new Date(subscription.date_end).toLocaleString(userLocale)}
														</TableCell>

														<TableCell>
															<SlideToggle
																name="{subscription.subscription}-slider"
																checked={!subscription.cancel}
																size="sm"
																active="variant-filled-success"
																background="variant-filled-surface"
																disabled={subscription.disabled}
																class={subscription.disabled ? "disabled" : ""}
																on:click={() => {
																	if (subscription.disabled) return
																	subsform.setAttribute(
																		"action",
																		"?/subscriptions&product=" + subscription.subscription
																	)
																	subsform.requestSubmit()
																}}
															/>
														</TableCell>
													</tr>
												{/if}
											{/await}
										{/if}
									{/await}
								{/each}
							{/await}
						</tbody>
					</table>
				</div>
			</form>
		{/if}
		{#if free_access}
			<div class="my-4 items-center justify-center">
				<h3 class="justify-center text-center my-12">Free access</h3>

				<div class="table-container max-w-md md:max-w-3xl lg:max-w-6xl xl:mx-w-7xl mx-auto">
					<table class="table table-hover border-separate space-y-6 text-xs">
						<TableHeader headers={["Product", "Type", "Start date", "End date"]} />
						<tbody>
							{#each free_access as access}
								{#await getBundle(access.product)}
									<tr>
										<td colspan="7">
											<span class="flex justify-center text-center py-3">...</span>
										</td>
									</tr>
								{:then bundle}
									{#if bundle}
										<tr class="table-row">
											<TableCell alignment="left" padding={0}>
												<div class="mx-3">
													<div>{bundle.name}</div>

													{#await bundle.username}
														<div class="text-xs text-left">by Loading...</div>
													{:then username}
														<div class="text-xs text-left">by {username}</div>
													{/await}
												</div>
											</TableCell>

											<TableCell padding={0}>
												<button
													class="btn hover:cursor-pointer hover:text-primary-500"
													on:click|preventDefault={() => (bundle.open = !bundle.open)}
												>
													{#if bundle.open}
														<PanelBottomOpen size={16} />{:else}<PanelTopOpen size={16} />
													{/if}

													<span>Bundle</span>
												</button>
											</TableCell>

											<TableCell>
												{new Date(access.date_start).toLocaleString(userLocale)}
											</TableCell>

											<TableCell>
												{new Date(access.date_end).toLocaleString(userLocale)}
											</TableCell>
										</tr>
										{#if bundle.open}
											<ScriptLinks scripts={bundle.scripts} colspan={5} />
										{/if}
									{:else}
										{#await getScript(access.product)}
											<tr><TableCell padding={0}>...</TableCell></tr>
										{:then script}
											{#if script}
												<tr class="table-row">
													<TableCell alignment="left" padding={0}>
														<div class="mx-3">
															<div>{script.name}</div>
															{#await script.username}
																<div class="text-xs text-left">by Loading...</div>
															{:then username}
																<div class="text-xs text-left">by {username}</div>
															{/await}
														</div>
													</TableCell>

													<TableCell padding={0}>
														<a href="/scripts/{script.url}" class="permalink">
															<button class="btn hover:cursor-pointer hover:text-primary-500">
																<ExternalLink size={16} />
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
										{/await}
									{/if}
								{/await}
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<form method="POST" action="?/portal" class="mt-8 mb-32 grid place-items-center">
			<button class="btn variant-filled-secondary">Customer portal</button>
		</form>
	{/if}

	<form method="POST" class="my-8 items-center justify-center" use:checkoutEnhance>
		<h3 class="justify-center text-center my-12">New subscriptions</h3>

		<div class="table-container max-w-md md:max-w-3xl lg:max-w-6xl xl:mx-w-7xl mx-auto">
			<table class="table table-hover border-separate space-y-6 text-sm">
				<TableHeader headers={["Product", "Type", "Price", "Interval", "Checkout"]} />
				<tbody>
					{#if bundles && scripts}
						{#each bundles as bundle, i}
							{#if bundle.active}
								<tr class="table-row">
									<TableCell alignment="left" padding={0}>
										<div class="mx-3">
											<div>{bundle.name}</div>
											{#await bundle.username}
												<div class="text-xs text-left">by Loading...</div>
											{:then username}
												<div class="text-xs text-left">by {username}</div>
											{/await}
										</div>
									</TableCell>

									<TableCell padding={0}>
										<button
											class="btn hover:cursor-pointer hover:text-primary-500"
											on:click|preventDefault={() => (bundle.open = !bundle.open)}
										>
											{#if bundle.open}
												<PanelBottomOpen size={16} />{:else}<PanelTopOpen size={16} />
											{/if}

											<span>Bundle</span>
										</button>
									</TableCell>

									<TableCell>
										{#if bundle.active}
											{getCurrentPrice(bundle.prices)}
										{:else}-{/if}
									</TableCell>

									<TableCell padding={bundle.active ? 0 : 3}>
										<div class="btn-group-vertical md:btn-group variant-outline-surface rounded-md">
											{#each bundle.prices as price, j}
												<button
													class="btn"
													class:variant-ringed-primary={price.active}
													on:click|preventDefault={() => changePriceInterval(bundle.prices, j, i)}
												>
													{getPriceIntervalEx(price)}
												</button>
											{/each}
										</div>
									</TableCell>

									<TableCell padding={0}>
										<button
											class="btn variant-filled-secondary"
											formaction="?/checkout&product={bundle.id}"
										>
											Checkout
										</button>
									</TableCell>
								</tr>
								{#if bundle.open}
									<ScriptLinks scripts={bundle.scripts} colspan={5} />
								{/if}
							{/if}
						{/each}

						{#each scripts as script, i}
							{#if script.active}
								<tr>
									<TableCell alignment="left" padding={0}>
										<div class="mx-3">
											<div class="">{script.name}</div>
											{#await script.username}
												<div class="text-xs">by Loading...</div>
											{:then username}
												<div class="text-xs">by {username}</div>
											{/await}
										</div>
									</TableCell>

									<TableCell padding={0}>
										<a href="/scripts/{script.url}" class="permalink flex justify-center">
											<button class="btn hover:cursor-pointer hover:text-primary-500">
												<ExternalLink size={16} />
												<span>Script</span>
											</button>
										</a>
									</TableCell>

									<TableCell>{getCurrentPrice(script.prices)}</TableCell>

									<TableCell padding={script.active ? 0 : 3}>
										{#if script.active}
											<div
												class="btn-group-vertical md:btn-group variant-outline-surface rounded-md"
											>
												{#each script.prices as price, j}
													<button
														class="btn"
														class:variant-ringed-primary={price.active}
														on:click|preventDefault={() =>
															changePriceInterval(script.prices, j, i + (bundles?.length ?? 0))}
													>
														{getPriceIntervalEx(price)}
													</button>
												{/each}
											</div>
										{:else}
											Unavailable
										{/if}
									</TableCell>

									<TableCell padding={0}>
										<button
											class="btn variant-filled-secondary"
											formaction="?/checkout&product={script.id}"
										>
											Checkout
										</button>
									</TableCell>
								</tr>
							{/if}
						{/each}
					{:else}
						{#each Array(5) as _}
							<tr class="table-row">
								<TableCell alignment="left" padding={0}>
									<div class="mx-3">
										<div>Loading...</div>
										<div class="text-xs text-left">by Loading...</div>
									</div>
								</TableCell>

								<TableCell padding={0}>
									<button class="btn hover:cursor-pointer hover:text-primary-500">
										<RotateCw size={16} />
										<span>Loading...</span>
									</button>
								</TableCell>

								<TableCell>Loading...</TableCell>

								<TableCell padding={0}>
									<div class="btn-group-vertical md:btn-group variant-outline-surface rounded-md">
										{#each Array(3) as _}
											<button class="btn"> Loading... </button>
										{/each}
									</div>
								</TableCell>

								<TableCell padding={0}>
									<div class="btn variant-filled-surface cursor-pointer disabled">Checkout</div>
								</TableCell>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<div class="max-w-7xl mx-auto">
			{#if $checkoutErrors._errors}
				<div class="w-full my-8 text-center mx-auto">
					{#each $checkoutErrors._errors as err}
						<span class="text-error-500">{err}</span>
					{/each}
				</div>
			{/if}

			{#if $allErrors}
				<div
					class="max-h-24 bg-surface-700 rounded-md overflow-y-scroll overflow-x-hidden text-error-500"
				>
					{#each $allErrors as error, i}
						{#if i === 0}
							Errors:
						{/if}
						<small class="mx-8 text-error-500 flex rounded-md">
							Error path: {error.path}
							{#each error.messages as messages}
								{messages}
							{/each}
						</small>
					{/each}
				</div>
			{/if}
		</div>
	</form>
</main>

<h5 class="my-8 text-center">
	By making any purchase you automatically accept the
	<a href="/legal/user_tos">user terms or service</a>
	.
</h5>
<p class="my-8 mx-auto text-center">
	If you have any issues please contact <a
		href="mailto: support@waspscripts.com"
		class="font-semibold hover:underline"
	>
		support@waspscripts.com
	</a>
</p>
