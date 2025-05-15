<script lang="ts">
	import { bundleArraySchema, newBundleSchema } from "$lib/client/schemas"
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
		validators: zodClient(bundleArraySchema)
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
		validators: zodClient(newBundleSchema)
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
		class="table-wrap preset-outlined-surface-400-600 mx-auto max-w-fit rounded-md"
		use:bundlesEnhance
	>
		<table class="table border-separate space-y-6 text-xs">
			<thead class="preset-filled-surface-200-800 rounded-md text-lg font-bold">
				<tr>
					{#each headers as header (header)}
						<th>
							<span class="text-secondary-950-50 flex justify-center text-center">{header}</span>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody class="preset-filled-surface-100-900 [&>tr]:hover:preset-tonal-surface">
				{#each $bundlesForm.bundles, i}
					<tr class:disabled={!$bundlesForm.bundles[i].active}>
						<td class="text-center">
							<input
								name="name"
								class="input preset-outlined-surface-500 mx-auto w-fit"
								class:line-through={!$bundlesForm.bundles[i].active}
								type="text"
								bind:value={$bundlesForm.bundles[i].name}
								class:ring-error-500={$bundlesErrors.bundles && $bundlesErrors.bundles[i].name}
							/>

							{#if $bundlesErrors.bundles && $bundlesErrors.bundles[i].name}
								{#each $bundlesErrors.bundles[i].name as err (err)}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</td>

						{#each $bundlesForm.bundles[i].prices, j}
							<td class="text-center">
								<input
									name="prices"
									class="input preset-outlined-surface-500 mx-auto w-24"
									type="number"
									bind:value={$bundlesForm.bundles[i].prices[j].amount}
									step="0.01"
									class:ring-error-500={$bundlesErrors.bundles &&
										$bundlesErrors.bundles[i].prices &&
										$bundlesErrors.bundles[i].prices[j].amount}
								/>
								{#if $bundlesErrors.bundles && $bundlesErrors.bundles[i].prices && $bundlesErrors.bundles[i].prices[j].amount}
									{#each $bundlesErrors.bundles[i].prices[j].amount as err (err)}
										<small class="text-error-500">{err}</small>
									{/each}
								{/if}
							</td>
						{/each}

						<td class="text-center">
							<SubscriptionViewer
								id={$bundlesForm.bundles[i].id}
								name={$bundlesForm.bundles[i].name}
								count={subscriptions[i].length}
							/>
						</td>

						<td class="text-center">{subscriptions[i].filter((s) => s.cancel).length}</td>
						<td class="text-center">
							<FreeAccessViewer
								id={$bundlesForm.bundles[i].id}
								name={$bundlesForm.bundles[i].name}
								count={freeAccess[i].length}
							/>
						</td>

						<td class="flex flex-col">
							<div class="mx-auto">
								<ScriptPicker>
									{#each $bundlesForm.bundles[i].bundledScripts, j}
										<tr class="flex h-full w-full">
											<td class="h-full w-full p-0 text-xs">
												<label class="flex h-full w-full items-center space-x-2">
													<input
														class="checkbox"
														type="checkbox"
														bind:checked={$bundlesForm.bundles[i].bundledScripts[j].active}
													/>
													<span class="select-none">
														{$bundlesForm.bundles[i].bundledScripts[j].name}</span
													>
												</label>
											</td>
										</tr>
									{/each}
								</ScriptPicker>
							</div>
							<div class="flex flex-col text-center">
								{#if $bundlesErrors.bundles && $bundlesErrors.bundles[i].bundledScripts?._errors}
									{#each $bundlesErrors.bundles[i].bundledScripts?._errors as err (err)}
										<small class="text-error-500">{err}</small>
									{/each}
								{/if}
							</div>
						</td>
						<td class="text-center">
							<button
								id="button-{$bundlesForm.bundles[i].id}"
								type="submit"
								class="btn preset-filled-secondary-500 font-bold"
								formaction="?/bundleEdit&product={$bundlesForm.bundles[i].id}"
							>
								Save
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</form>

	<form
		method="POST"
		action="?/bundleAdd"
		class="preset-outlined-surface-400-600 mx-auto my-12 flex flex-col rounded-md p-4 text-center"
		use:newBundleEnhance
	>
		<h1 class="my-4 text-lg">New Bundle</h1>
		<label class="label mx-auto max-w-96">
			<span class="label-text">Name:</span>
			<input
				name="bundlename"
				type="text"
				placeholder="Bundle name"
				class="input"
				bind:value={$newBundleForm.name}
				class:ring-error-500={$newBundleErrors.name}
			/>
			{#if $newBundleErrors.name}
				{#each $newBundleErrors.name as err (err)}
					<small class="text-error-500">{err}</small>
				{/each}
			{/if}
		</label>

		<div class="mx-auto my-12 flex flex-col justify-center gap-4 md:flex-row">
			{#each ["Weekly", "Monthly", "Yearly"] as interval, i (interval)}
				<label class="label max-w-80">
					<span class="label-text">{interval} price:</span>
					<input
						type="number"
						class="input"
						step="0.01"
						bind:value={$newBundleForm.prices[i].amount}
						class:ring-error-500={$newBundleErrors.prices && $newBundleErrors.prices[i]?.amount}
					/>
					{#if $newBundleErrors.prices && $newBundleErrors.prices[i]?.amount}
						{#each $newBundleErrors.prices[i].amount as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</label>
			{/each}
		</div>

		<ScriptPicker>
			{#each $newBundleForm.bundledScripts, i}
				<tr class="flex h-full w-full">
					<td class="h-full w-full p-0 text-xs">
						<label class="flex h-full w-full items-center space-x-2">
							<input
								class="checkbox"
								type="checkbox"
								bind:checked={$newBundleForm.bundledScripts[i].active}
							/>
							<span class="select-none">{$newBundleForm.bundledScripts[i].name}</span>
						</label>
					</td>
				</tr>
			{/each}
		</ScriptPicker>
		{#if $newBundleErrors.bundledScripts?._errors}
			{#each $newBundleErrors.bundledScripts._errors as err (err)}
				<small class="text-error-500">{err}</small>
			{/each}
		{/if}

		<button type="submit" class="btn preset-filled-primary-500 mx-auto my-8 w-fit">Add</button>
	</form>
</main>
