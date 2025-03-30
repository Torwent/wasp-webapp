<script lang="ts">
	import { bundleArraySchema, newBundleSchema } from "$lib/client/schemas"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import ScriptPicker from "./ScriptPicker.svelte"
	import SubscriptionViewer from "../SubscriptionViewer.svelte"
	import FreeAccessViewer from "../FreeAccessViewer.svelte"

	const { data } = $props()
	const { subscriptions, freeAccess } = $derived(data)

	const {
		form: bundlesForm,
		errors: bundlesErrors,
		enhance: bundlesEnhance
	} = superForm(data.bundlesForm, {
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
	} = superForm(data.newBundleForm, {
		id: "newbundle",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(newBundleSchema),
		resetForm: true
	})

	const headers = [
		"Title",
		"Weekly Price",
		"Monthly Price",
		"Yearly Price",
		"Subscribers",
		"Cancelling",
		"Free Access",
		"Scripts",
		"Action"
	]
</script>

<main class="m-4">
	<h1 class="my-24 text-center">
		By making premium scripts you automatically accept the
		<a href="/legal/scripter_tos" class="text-tertiary-500"> scripter terms or service</a>
		.
	</h1>

	<div class="my-12 text-center">
		<p>All prices are displayed in EUR (Euros €).</p>
		<p>
			Setting a price to 0 disables that interval. Setting all prices to 0 disables and hides the
			product from the subscriptions page.
		</p>
	</div>

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

						{#each $bundlesForm.bundles[i].prices as _, j}
							<td>
								<input
									name="prices"
									class="input mx-1 preset-outlined-surface-500"
									type="number"
									bind:value={$bundlesForm.bundles[i].prices[j].amount}
									step="0.01"
								/>
							</td>
						{/each}

						<TableCell>
							<SubscriptionViewer
								id={$bundlesForm.bundles[i].id}
								name={$bundlesForm.bundles[i].name}
								count={subscriptions[i].length}
							/>
						</TableCell>
						<TableCell>{subscriptions[i].filter((s) => s.cancel).length}</TableCell>
						<TableCell>
							<FreeAccessViewer
								id={$bundlesForm.bundles[i].id}
								name={$bundlesForm.bundles[i].name}
								count={freeAccess[i].length}
							/>
						</TableCell>

						<TableCell>
							<ScriptPicker bind:scripts={$bundlesForm.bundles[i].bundledScripts} />
						</TableCell>
						<TableCell>
							<button
								id="button-{$bundlesForm.bundles[i].id}"
								type="submit"
								class="btn font-bold preset-filled-secondary-500"
								formaction="?/bundleEdit&product={$bundlesForm.bundles[i].id}"
							>
								Save
							</button>
						</TableCell>
					</tr>
				{/each}
			</tbody>
		</table>
	</form>

	<form
		method="POST"
		action="?/bundleAdd"
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
			{#if $newBundleErrors.name}
				{#each $newBundleErrors.name as err}
					<small class="text-error-500">{err}</small>
				{/each}
			{/if}
		</label>

		<div class="my-12 flex flex-col justify-around md:flex-row">
			{#each ["Weekly", "Monthly", "Yearly"] as interval, i}
				<label>
					<span class="label-text">{interval} price:</span>
					<input
						type="number"
						class="input"
						step="0.01"
						bind:value={$newBundleForm.prices[i].amount}
					/>
					{#if $newBundleErrors.prices && $newBundleErrors.prices[i]?.amount}
						{#each $newBundleErrors.prices[i].amount as err}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</label>
			{/each}
		</div>

		<ScriptPicker bind:scripts={$newBundleForm.bundledScripts} />

		<button class="btn mx-auto my-8 w-32 preset-filled-primary-500">Add</button>
	</form>
</main>
