<script lang="ts">
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms"
	import { subscriptionsSchema } from "$lib/client/schemas"
	import { Switch } from "@skeletonlabs/skeleton-svelte"
	import type { BundleProduct, Price, ScriptProduct, Subscription } from "$lib/types/collection"
	import { getPrice, getPriceAmount, getPriceIntervalEx } from "$lib/utils"
	import ExternalLink from "svelte-lucide/ExternalLink.svelte"
	import ScriptLinks from "./ScriptLinks.svelte"

	let {
		data,
		bundles,
		scripts,
		subscriptions,
		prices
	}: {
		data: SuperValidated<Infer<typeof subscriptionsSchema>>
		bundles: BundleProduct[]
		scripts: ScriptProduct[]
		subscriptions: Subscription[]
		prices: Price[]
	} = $props()

	let form: HTMLFormElement

	const { errors, enhance } = superForm(data, {
		id: "subscriptions",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors"
	})

	function getBundle(id: string) {
		return bundles.find((bundle) => bundle.id === id)
	}

	function getScript(id: string) {
		return scripts.find((script) => script.id === id)
	}

	let userLocale = navigator.language ?? "pt-PT"

	let bundleArray: (BundleProduct | undefined)[] = $state([])
	subscriptions.forEach((sub) => {
		bundleArray.push(getBundle(sub.product))
	})
</script>

<div class="mx-auto my-4 items-center justify-center">
	<h3 class="my-12 justify-center text-center">Current subscriptions</h3>

	{#if $errors._errors}
		<div class="mx-auto my-8 w-full text-center">
			{#each $errors._errors as err}
				<span class="text-error-500">{err}</span>
			{/each}
		</div>
	{/if}

	<form
		id="subsform"
		method="POST"
		class="xl:mx-w-7xl table-wrap mx-auto max-w-md rounded-md preset-outlined-surface-500 md:max-w-3xl lg:max-w-6xl"
		use:enhance
		bind:this={form}
		action="?/subscriptions"
	>
		<table class="table border-separate space-y-6 text-xs">
			<TableHeader
				headers={["Product", "Type", "Price", "Interval", "Start date", "End date", "Renew"]}
			/>
			<tbody class="preset-filled-surface-200-800 hover:[&>tr]:preset-tonal">
				{#each subscriptions as subscription, i}
					{@const price = getPrice(subscription.price, prices)}

					{#if bundleArray[i]}
						<tr>
							<TableCell alignment="left" padding={0}>
								<div class="mx-3">
									<div>{bundleArray[i].name}</div>
									<div class="text-left text-xs">
										{#await bundleArray[i].username}
											by Loading...
										{:then username}
											by {username}
										{/await}
									</div>
								</div>
							</TableCell>

							<TableCell padding={0}>
								<ScriptLinks bind:bundle={bundleArray[i]} />
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
								<Switch
									name="{subscription.subscription}-slider"
									controlInactive="bg-error-500"
									controlActive="bg-success-700"
									controlDisabled="disabled"
									checked={!subscription.cancel}
									form="subsform"
									onCheckedChange={() => {
										if (subscription.disabled) return
										form.setAttribute(
											"action",
											"?/subscriptions&product=" + subscription.subscription
										)
										form.requestSubmit()
									}}
								/>
							</TableCell>
						</tr>
					{:else}
						{@const script = getScript(subscription.product)}
						{#if script}
							<tr class="table-row">
								<TableCell alignment="left" padding={0}>
									<div class="mx-3">
										<div>{script.name}</div>
										<div class="text-left text-xs">
											{#await script.username}
												by Loading...
											{:then username}
												by {username}
											{/await}
										</div>
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
									<Switch
										name="{subscription.subscription}-slider"
										controlInactive="bg-error-500"
										controlActive="bg-success-700"
										controlDisabled="disabled"
										checked={!subscription.cancel}
										form="subsform"
										onCheckedChange={() => {
											if (subscription.disabled) return
											form.setAttribute(
												"action",
												"?/subscriptions&product=" + subscription.subscription
											)
											form.requestSubmit()
										}}
									/>
								</TableCell>
							</tr>
						{/if}
					{/if}
				{/each}
			</tbody>
		</table>
	</form>
</div>
