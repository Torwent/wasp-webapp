<script lang="ts">
	import { bundleArraySchema, newBundleSchema } from "$lib/client/schemas"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import ScriptPicker from "./ScriptPicker.svelte"
	import SubscriptionViewer from "../SubscriptionViewer.svelte"
	import FreeAccessViewer from "../FreeAccessViewer.svelte"

	const { data } = $props()
	const { scripter, subscriptions } = $derived(data)

	const {
		form: bundlesForm,
		errors: bundlesErrors,
		enhance: bundlesEnhance
	} = superForm(data.forms.bundles, {
		id: "bundles",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(bundleArraySchema),
		resetForm: true
	})

	const {
		form: newBundleForm,
		errors: newBundleErrors,
		enhance: newBundleEnhance
	} = superForm(data.forms.newBundle, {
		id: "bundles",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(newBundleSchema),
		resetForm: true
	})

	const headers = [
		"Title",
		"Price (Week/Month/Year)",
		"Subscribers",
		"Cancelling",
		"Free Access",
		"Scripts",
		"Action"
	]
</script>

<main class="m-4">
	{#if !scripter.stripe}
		<h1 class="my-24 text-center">
			To use this section of the dashboard you need to go through and finish the stripe on-boarding.
		</h1>
	{:else}
		<h1 class="my-24 text-center">
			By making premium scripts you automatically accept the
			<a href="/legal/scripter_tos" class="text-tertiary-500"> scripter terms or service</a>
			.
		</h1>

		<form
			method="POST"
			class="xl:mx-w-7xl table-wrap mx-auto max-w-md rounded-md preset-outlined-surface-400-600 md:max-w-3xl lg:max-w-6xl"
			use:bundlesEnhance
		>
			<table class="table border-separate space-y-6 text-xs">
				<thead class="rounded-md text-lg font-bold preset-filled-surface-200-800">
					<tr>
						{#each headers as header}
							<th>
								<span class="flex justify-center text-center text-secondary-950-50">{header}</span>
							</th>
						{/each}
					</tr>
				</thead>

				<tbody class="preset-filled-surface-100-900 hover:[&>tr]:preset-tonal-surface">
					{#each $bundlesForm.bundles as _, i}
						<tr>
							<TableCell>
								<div class="mx-3">
									<input
										name="name"
										class="input w-fit preset-outlined-surface-500"
										type="text"
										bind:value={$bundlesForm.bundles[i].name}
									/>
								</div>
							</TableCell>

							<TableCell>
								<div>
									<div class="grid md:flex">
										{#each $bundlesForm.bundles[i].prices as _, j}
											<input
												name="prices"
												class="input mx-1 preset-outlined-surface-500"
												type="number"
												bind:value={$bundlesForm.bundles[i].prices[j].amount}
												step="0.01"
											/>
										{/each}
									</div>
									{#if $bundlesErrors.bundles && $bundlesErrors.bundles[i].prices?._errors}
										{#each $bundlesErrors.bundles[i].prices._errors as error}
											<small class="text-error-500">
												{error}
											</small>
										{/each}
									{/if}
								</div>
							</TableCell>

							<TableCell>
								<SubscriptionViewer
									id={$bundlesForm.bundles[i].id}
									name={$bundlesForm.bundles[i].name}
									bind:state={$bundlesForm.bundles[i].subsOpen}
									bind:count={subscriptions.bundles[i].count}
								/>
							</TableCell>
							<TableCell>{subscriptions.bundles[i].cancelling}</TableCell>
							<TableCell>
								<FreeAccessViewer
									id={$bundlesForm.bundles[i].id}
									name={$bundlesForm.bundles[i].name}
									bind:state={$bundlesForm.bundles[i].freeOpen}
									bind:count={subscriptions.bundles[i].free}
								/>
							</TableCell>

							<TableCell>
								<ScriptPicker
									bind:scripts={$bundlesForm.bundles[i].bundledScripts}
									bind:state={$bundlesForm.bundles[i].open}
								/>
							</TableCell>
							<TableCell>
								<button
									id="button-{$bundlesForm.bundles[i].id}"
									type="submit"
									class="btn font-bold preset-filled-secondary-500"
									formaction="?/bundleEdit={$bundlesForm.bundles[i].id}"
								>
									Save
								</button>
							</TableCell>
						</tr>

						{#if $bundlesForm.bundles[i].freeOpen}
							<tr class="table-row">
								<td colspan={headers.length}>
									<!-- <TableFreeAccess index={i} bind:products {action} /> -->
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</form>

		<form
			method="POST"
			action="?/addFree"
			class="xl:mx-w-7xl mx-auto my-12 flex max-w-md flex-col rounded-md text-center preset-outlined-surface-400-600 md:max-w-3xl lg:max-w-6xl"
			use:newBundleEnhance
		>
			<h1 class="my-4 text-lg">New Bundle</h1>
			<label class="my-4">
				<span class="label-text">Name:</span>
				<input
					name="bundlename"
					type="text"
					placeholder="Bundle name"
					class="input mx-auto w-96"
					bind:value={$newBundleForm.name}
				/>
			</label>

			<div class="my-12 flex flex-col justify-around md:flex-row">
				<label>
					<span class="label-text">Weekly price:</span>
					<input
						name="weekprice"
						type="number"
						placeholder="X €"
						class="input"
						bind:value={$newBundleForm.prices[0].amount}
					/>
				</label>
				<label>
					<span class="label-text">Weekly price:</span>
					<input
						name="weekprice"
						type="number"
						placeholder="X €"
						class="input"
						bind:value={$newBundleForm.prices[1].amount}
					/>
				</label>
				<label>
					<span class="label-text">Weekly price:</span>
					<input
						name="weekprice"
						type="number"
						placeholder="X €"
						class="input"
						bind:value={$newBundleForm.prices[2].amount}
					/>
				</label>
			</div>

			<ScriptPicker bind:scripts={$newBundleForm.bundledScripts} bind:state={$newBundleForm.open} />

			<button class="btn mx-auto my-8 w-32 preset-filled-primary-500">Add</button>
		</form>
	{/if}
</main>
