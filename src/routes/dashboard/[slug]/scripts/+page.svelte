<script lang="ts">
	import { newScriptSchema, scriptArraySchema } from "$lib/client/schemas"
	import TableCell from "$lib/components/tables/TableCell.svelte"
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
		class="xl:mx-w-7xl table-wrap mx-auto max-w-md rounded-md preset-outlined-surface-400-600 md:max-w-3xl lg:max-w-6xl"
		use:scriptsEnhance
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
				{#each $scriptsForm.scripts as _, i}
					<tr>
						<TableCell>
							<div class="mx-3">
								<input
									name="name"
									class="input w-fit preset-outlined-surface-500"
									type="text"
									bind:value={$scriptsForm.scripts[i].name}
								/>
								{#if $scriptErrors.scripts && $scriptErrors.scripts[i].name}
									{#each $scriptErrors.scripts[i].name as err}
										<small class="text-error-500">{err}</small>
									{/each}
								{/if}
							</div>
						</TableCell>

						{#each $scriptsForm.scripts[i].prices as _, j}
							<td>
								<input
									name="prices"
									class="input mx-1 preset-outlined-surface-500"
									type="number"
									bind:value={$scriptsForm.scripts[i].prices[j].amount}
									step="0.01"
								/>
								{#if $scriptErrors.scripts && $scriptErrors.scripts[i].prices && $scriptErrors.scripts[i].prices[j].amount}
									{#each $scriptErrors.scripts[i].prices[j].amount as err}
										<small class="text-error-500">{err}</small>
									{/each}
								{/if}
							</td>
						{/each}

						<TableCell>
							<SubscriptionViewer
								id={$scriptsForm.scripts[i].id}
								name={$scriptsForm.scripts[i].name}
								count={subscriptions[i].length}
							/>
						</TableCell>
						<TableCell>{subscriptions[i].filter((s) => s.cancel).length}</TableCell>
						<TableCell>
							<FreeAccessViewer
								id={$scriptsForm.scripts[i].id}
								name={$scriptsForm.scripts[i].name}
								count={freeAccess[i].length}
							/>
						</TableCell>

						<TableCell>
							<button
								id="button-{$scriptsForm.scripts[i].id}"
								type="submit"
								class="btn font-bold preset-filled-primary-500"
								formaction="?/scriptEdit&product={$scriptsForm.scripts[i].id}"
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
		action="?/scriptAdd"
		class="xl:mx-w-7xl mx-auto my-12 flex max-w-md flex-col rounded-md text-center preset-outlined-surface-400-600 md:max-w-3xl lg:max-w-6xl"
		use:newScriptEnhance
	>
		<h1 class="my-4 text-lg">New Script</h1>

		<label class="my-4">
			<span class="label-text">Script:</span>
			<select class="select mx-auto w-96" bind:value={$newScriptForm.id}>
				{#each available as script}
					<option value={script.id}>{script.name}</option>
				{/each}
			</select>
			{#if $newScriptErrors.id}
				{#each $newScriptErrors.id as err}
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
						placeholder="X €"
						class="input"
						step="0.01"
						bind:value={$newScriptForm.prices[i].amount}
					/>
					{#if $newScriptErrors.prices && $newScriptErrors.prices[i]?.amount}
						{#each $newScriptErrors.prices[i].amount as err}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</label>
			{/each}
		</div>

		<button class="btn mx-auto my-8 w-32 preset-filled-primary-500">Add</button>
	</form>
</main>
