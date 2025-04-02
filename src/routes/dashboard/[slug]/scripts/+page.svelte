<script lang="ts">
	import { newScriptSchema, scriptArraySchema } from "$lib/client/schemas"
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import SubscriptionViewer from "../SubscriptionViewer.svelte"
	import FreeAccessViewer from "../FreeAccessViewer.svelte"

	const { data } = $props()
	const { available, subscriptions, freeAccess } = $derived(data)

	const {
		form: scriptsForm,
		errors: scriptErrors,
		enhance: scriptsEnhance
	} = superForm(data.scriptsForm, {
		id: "scripts",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(scriptArraySchema)
	})

	const {
		form: newScriptForm,
		errors: newScriptErrors,
		enhance: newScriptEnhance
	} = superForm(data.newScriptForm, {
		id: "newscript",
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(newScriptSchema)
	})

	const headers = [
		"Title",
		"Weekly Price",
		"Monthly Price",
		"Yearly Price",
		"Subscribers",
		"Cancelling",
		"Free Access",
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
		use:scriptsEnhance
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
				{#each $scriptsForm.scripts, i}
					<tr>
						<td class="text-center">
							<input
								name="name"
								class="input preset-outlined-surface-500 mx-auto w-fit"
								type="text"
								bind:value={$scriptsForm.scripts[i].name}
							/>
							{#if $scriptErrors.scripts && $scriptErrors.scripts[i].name}
								{#each $scriptErrors.scripts[i].name as err (err)}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</td>

						{#each $scriptsForm.scripts[i].prices, j}
							<td class="text-center">
								<input
									name="prices"
									class="input preset-outlined-surface-500 mx-auto w-24"
									type="number"
									bind:value={$scriptsForm.scripts[i].prices[j].amount}
									step="0.01"
								/>
								{#if $scriptErrors.scripts && $scriptErrors.scripts[i].prices && $scriptErrors.scripts[i].prices[j].amount}
									{#each $scriptErrors.scripts[i].prices[j].amount as err (err)}
										<small class="text-error-500">{err}</small>
									{/each}
								{/if}
							</td>
						{/each}

						<td class="text-center">
							<SubscriptionViewer
								id={$scriptsForm.scripts[i].id}
								name={$scriptsForm.scripts[i].name}
								count={subscriptions[i].length}
							/>
						</td>
						<td class="text-center">{subscriptions[i].filter((s) => s.cancel).length}</td>
						<td class="text-center">
							<FreeAccessViewer
								id={$scriptsForm.scripts[i].id}
								name={$scriptsForm.scripts[i].name}
								count={freeAccess[i].length}
							/>
						</td>

						<td class="text-center">
							<button
								id="button-{$scriptsForm.scripts[i].id}"
								type="submit"
								class="btn preset-filled-primary-500 font-bold"
								formaction="?/scriptEdit&product={$scriptsForm.scripts[i].id}"
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
		action="?/scriptAdd"
		class="xl:mx-w-7xl preset-outlined-surface-400-600 mx-auto my-12 flex max-w-md flex-col rounded-md text-center md:max-w-3xl lg:max-w-6xl"
		use:newScriptEnhance
	>
		<h1 class="my-4 text-lg">New Script</h1>

		{#if available.length === 0}
			<h2 class="text-warning-500 my-24 text-center text-lg">
				You either have no premium scripts or all your premium scripts are already products in the
				table above.
			</h2>
		{/if}

		<label class="my-4">
			<span class="label-text">Script:</span>
			<select
				class="select mx-auto w-96"
				bind:value={$newScriptForm.id}
				class:disabled={available.length === 0}
				class:ring-error-500={$newScriptErrors.id}
			>
				{#each available as script (script.id)}
					<option value={script.id}>{script.name}</option>
				{/each}
			</select>
			{#if $newScriptErrors.id}
				{#each $newScriptErrors.id as err (err)}
					<small class="text-error-500">{err}</small>
				{/each}
			{/if}
		</label>

		<div class="my-12 flex flex-col justify-around md:flex-row">
			{#each ["Weekly", "Monthly", "Yearly"] as interval, i (interval)}
				<label>
					<span class="label-text">{interval} price:</span>
					<input
						type="number"
						class="input"
						step="0.01"
						bind:value={$newScriptForm.prices[i].amount}
						class:disabled={available.length === 0}
						class:ring-error-500={$newScriptErrors.prices && $newScriptErrors.prices[i]?.amount}
					/>
					{#if $newScriptErrors.prices && $newScriptErrors.prices[i]?.amount}
						{#each $newScriptErrors.prices[i].amount as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</label>
			{/each}
		</div>

		<button type="submit" class="btn preset-filled-primary-500 mx-auto my-8 w-32">Add</button>
	</form>
</main>
