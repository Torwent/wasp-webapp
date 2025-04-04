<script lang="ts">
	import TableHeader from "$lib/components/TableHeader.svelte"
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

<div class="mx-auto w-screen max-w-fit">
	<h1 class="my-12 justify-center text-center font-bold">Current subscriptions</h1>

	{#if $errors._errors}
		<div class="mx-auto my-8 w-full text-center">
			{#each $errors._errors as err (err)}
				<span class="text-error-500">{err}</span>
			{/each}
		</div>
	{/if}

	<form
		id="subsform"
		method="POST"
		class="table-wrap preset-outlined-surface-500 mx-auto max-w-[95%] rounded-md"
		use:enhance
		bind:this={form}
		action="?/subscriptions"
	>
		<table class="table border-separate space-y-6 text-xs md:text-sm">
			<TableHeader
				headers={["Product", "Type", "Price", "Interval", "Start date", "End date", "Renew"]}
			/>
			<tbody class="preset-filled-surface-200-800 [&>tr]:hover:preset-tonal">
				{#each subscriptions as { subscription, product, price, date_start, date_end, cancel, disabled }, i (subscription)}
					{@const priceEx = getPrice(price, prices)}

					{#if bundleArray[i]}
						<tr>
							<td>
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
							</td>

							<td class="text-center">
								<ScriptLinks bundle={bundleArray[i]} />
							</td>

							<td class="text-center">{priceEx ? getPriceAmount(priceEx) : "..."}</td>

							<td class="text-center">{priceEx ? getPriceIntervalEx(priceEx) : "..."}</td>

							<td class="text-center">
								{new Date(date_start).toLocaleString(userLocale)}
							</td>

							<td class="text-center">
								{cancel ? "Cancels on " : "Renews on "}
								{new Date(date_end).toLocaleString(userLocale)}
							</td>

							<td class="text-center">
								<Switch
									name="{subscription}-slider"
									controlInactive="bg-error-500"
									controlActive="bg-success-700"
									controlDisabled="disabled"
									checked={!cancel}
									form="subsform"
									onCheckedChange={() => {
										if (disabled) return
										form.setAttribute("action", "?/subscriptions&product=" + subscription)
										form.requestSubmit()
									}}
								/>
							</td>
						</tr>
					{:else}
						{@const script = getScript(product) as ScriptProduct}

						<tr class="table-row">
							<td>
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
							</td>

							<td>
								<a href="/scripts/{script.url}" class="permalink">
									<button class="btn hover:text-primary-500 hover:cursor-pointer">
										<ExternalLink size="16" />
										<span>Script</span>
									</button>
								</a>
							</td>

							<td>
								{#if priceEx}
									{getPriceAmount(priceEx)}
								{:else}
									...
								{/if}
							</td>

							<td>
								{#if priceEx}
									{getPriceIntervalEx(priceEx)}
								{:else}
									...
								{/if}
							</td>

							<td>
								{new Date(date_start).toLocaleString(userLocale)}
							</td>

							<td>
								{cancel ? "Cancels on " : "Renews on "}
								{new Date(date_end).toLocaleString(userLocale)}
							</td>

							<td>
								<Switch
									name="{subscription}-slider"
									controlInactive="bg-error-500"
									controlActive="bg-success-700"
									controlDisabled="disabled"
									checked={!cancel}
									form="subsform"
									onCheckedChange={() => {
										if (disabled) return
										form.setAttribute("action", "?/subscriptions&product=" + subscription)
										form.requestSubmit()
									}}
								/>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</form>
</div>
