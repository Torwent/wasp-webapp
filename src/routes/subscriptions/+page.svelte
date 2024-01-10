<script lang="ts">
	import { SlideToggle } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import { superForm } from "sveltekit-superforms/client"
	import { checkoutSchema } from "$lib/backend/schemas"
	import { onMount } from "svelte"
	import { ExternalLink, PanelBottomOpen, PanelTopOpen } from "lucide-svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import type { Price } from "$lib/types/collection"
	import {
		getCurrentPrice,
		getPrice,
		getPriceAmount,
		getPriceIntervalEx,
		setPriceInterval
	} from "$lib/utils"

	export let data
	let {
		profile,
		data: { bundles, scripts, prices }
	} = data

	$: ({
		profile,
		data: { bundles, scripts, prices }
	} = data)

	const { errors: subscriptionsErrors, enhance: subscriptionEnhance } = superForm(
		data.subscriptionsform,
		{
			dataType: "json",
			multipleSubmits: "prevent",
			clearOnSubmit: "errors"
		}
	)

	$: if (profile?.subscription) {
		profile.subscription.forEach((sub) => {
			bundles.forEach((bundle) => {
				if (sub.product === bundle.id) bundle.active = false
			})

			scripts.forEach((script) => {
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
		validators: checkoutSchema
	})

	function changePriceInterval(prices: Price[], index: number, productIndex: number) {
		setPriceInterval(index, prices)
		bundles = bundles //this is stupid but is required to trigger a redraw
		scripts = scripts //this is stupid but is required to trigger a redraw

		$checkoutForm.products[productIndex].prices = prices
	}

	async function getBundle(id: string) {
		return bundles.find((bundle) => bundle.id === id)
	}

	async function getScript(id: string) {
		return scripts.find((script) => script.id === id)
	}

	let userLocale = "pt-PT"
	onMount(() => {
		userLocale = navigator.language
	})

	function dateDiff(start: string, end: string) {
		const dateStart = new Date(start).getFullYear()
		const dateEnd = new Date(end).getFullYear()

		return dateEnd - dateStart
	}

	const headTitle = "Subscriptions - WaspScripts"
	const headDescription =
		"Get access to exclusive scripts. With access to premium scripts you have scripts for nearly all skills in OSRS."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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
	{#if profile && profile.subscription.length > 0}
		<form
			method="POST"
			class="my-8 items-center justify-center"
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
						headers={["Product", "Type", "Price", "Interval", "Start date", "End date", "Cancel"]}
					/>
					<tbody>
						{#each profile.subscription as subscription}
							{@const price = getPrice(subscription.price, prices)}
							{#await getBundle(subscription.product)}
								<tr><TableCell padding={0}>...</TableCell></tr>
							{:then bundle}
								{#if bundle}
									{@const isTenYearSub =
										bundle.name.includes("Legacy") &&
										dateDiff(subscription.date_start, subscription.date_end) > 9}
									<tr class="table-row">
										<TableCell alignment="left" padding={0}>
											<div class="mx-3">
												<div>{bundle.name}</div>
												<div class="text-xs text-left">by {bundle.username}</div>
											</div>
										</TableCell>

										<TableCell padding={0}>
											<button
												class="btn hover:cursor-pointer hover:text-primary-500"
												on:click|preventDefault={() => (bundle.open = !bundle.open)}
											>
												{#if bundle.open}
													<PanelBottomOpen size={16} />
												{:else}
													<PanelTopOpen size={16} />
												{/if}

												<span>Bundle</span>
											</button>
										</TableCell>

										<TableCell>
											{#if isTenYearSub}
												-
											{:else if price}
												{getPriceAmount(price)}
											{:else}
												...
											{/if}
										</TableCell>

										<TableCell>
											{#if isTenYearSub}
												-
											{:else if price}
												{getPriceIntervalEx(price)}
											{:else}
												...
											{/if}
										</TableCell>

										<TableCell>
											{new Date(subscription.date_start).toLocaleString(userLocale)}
										</TableCell>

										<TableCell>
											{new Date(subscription.date_end).toLocaleString(userLocale)}
										</TableCell>

										<TableCell>
											{#if isTenYearSub}
												<SlideToggle
													name="{subscription.subscription}-slider"
													checked={true}
													size="sm"
													disabled
													active="variant-filled-error"
													background="variant-filled-success"
													class="disabled"
												>
													<span class="inline-block w-[60px] text-left">
														{subscription.cancel ? "Cancel" : "Renew"}
													</span>
												</SlideToggle>
											{:else}
												<SlideToggle
													name="{subscription.subscription}-slider"
													bind:checked={subscription.cancel}
													size="sm"
													active="variant-filled-error"
													background="variant-filled-success"
													on:click={() => {
														subsform.setAttribute(
															"action",
															"?/subscriptions&product=" + subscription.subscription
														)
														subsform.requestSubmit()
													}}
												>
													<span class="inline-block w-[60px] text-left">
														{subscription.cancel ? "Cancel" : "Renew"}
													</span>
												</SlideToggle>
											{/if}
										</TableCell>
									</tr>
									{#if bundle.open}
										<tr class="table-row">
											<td colspan="7">
												<table class="table table-compact">
													<tbody>
														{#each bundle.scripts as script}
															<tr>
																<a
																	href="/scripts/{script.url}"
																	class="flex permalink h-full w-full"
																>
																	<td class="text-xs">
																		<div class="flex align-items-center ml-3">
																			<ExternalLink size={16} class="mr-4" />
																			{script.title}
																		</div>
																	</td>
																</a>
															</tr>
														{/each}
													</tbody>
												</table>
											</td>
										</tr>
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
														<div class="text-xs text-left">by {script.username}</div>
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
													{#if price} {getPriceAmount(price)} {:else} ... {/if}
												</TableCell>

												<TableCell>
													{#if price} {getPriceIntervalEx(price)} {:else} ... {/if}
												</TableCell>

												<TableCell>
													{new Date(subscription.date_start).toLocaleString(userLocale)}
												</TableCell>

												<TableCell>
													{new Date(subscription.date_end).toLocaleString(userLocale)}
												</TableCell>

												<TableCell>
													<SlideToggle
														name="{subscription.subscription}-slider"
														bind:checked={subscription.cancel}
														size="sm"
														active="variant-filled-error"
														background="variant-filled-success"
														on:click={() => {
															subsform.setAttribute(
																"action",
																"?/subscriptions&product=" + subscription.subscription
															)
															subsform.requestSubmit()
														}}
													>
														<span class="inline-block w-[60px] text-left">
															{subscription.cancel ? "Cancel" : "Renew"}
														</span>
													</SlideToggle>
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
		</form>
	{/if}

	<form method="POST" class="my-8 items-center justify-center" use:checkoutEnhance>
		<h3 class="justify-center text-center my-12">New subscriptions</h3>

		<div class="table-container max-w-md md:max-w-3xl lg:max-w-6xl xl:mx-w-7xl mx-auto">
			<table class="table table-hover border-separate space-y-6 text-sm">
				<TableHeader headers={["Product", "Type", "Price", "Interval", "Checkout"]} />
				<tbody>
					{#each bundles as bundle, i}
						{#if bundle.active}
							<tr class="table-row">
								<TableCell alignment="left" padding={0}>
									<div class="mx-3">
										<div>{bundle.name}</div>
										<div class="text-xs text-left">by {bundle.username}</div>
									</div>
								</TableCell>

								<TableCell padding={0}>
									<button
										class="btn hover:cursor-pointer hover:text-primary-500"
										on:click|preventDefault={() => (bundle.open = !bundle.open)}
									>
										{#if bundle.open}
											<PanelBottomOpen size={16} />
										{:else}
											<PanelTopOpen size={16} />
										{/if}
										<span>Bundle</span>
									</button>
								</TableCell>

								<TableCell>
									{#if bundle.active} {getCurrentPrice(bundle.prices)} {:else}-{/if}
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
									{#if bundle.active}
										<button
											class="btn variant-filled-secondary"
											formaction="?/checkout&product={bundle.id}"
										>
											Checkout
										</button>
									{:else}
										<div class="btn variant-filled-surface cursor-pointer">Checkout</div>
									{/if}
								</TableCell>
							</tr>
							{#if bundle.open}
								<tr class="table-row">
									<td colspan="5">
										<table class="table table-compact">
											<tbody>
												{#each bundle.scripts as script}
													<tr>
														<a href="/scripts/{script.url}" class="flex permalink h-full w-full">
															<td class="text-xs">
																<div class="flex align-items-center ml-3">
																	<ExternalLink size={16} class="mr-4" />
																	{script.title}
																</div>
															</td>
														</a>
													</tr>
												{/each}
											</tbody>
										</table>
									</td>
								</tr>
							{/if}
						{/if}
					{/each}

					{#each scripts as script, i}
						{#if script.active}
							<tr>
								<TableCell alignment="left" padding={0}>
									<div class="mx-3">
										<div class="">{script.name}</div>
										<div class="text-xs">by {script.username}</div>
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
										<div class="btn-group-vertical md:btn-group variant-outline-surface rounded-md">
											{#each script.prices as price, j}
												<button
													class="btn"
													class:variant-ringed-primary={price.active}
													on:click|preventDefault={() =>
														changePriceInterval(script.prices, j, i + bundles.length)}
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
	<a href="/legal/user_terms_of_service">user terms or service</a>
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
