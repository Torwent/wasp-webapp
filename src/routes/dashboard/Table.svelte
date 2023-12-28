<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import type {
		ScriptArraySchema,
		NewScriptArraySchema,
		BundleArraySchema,
		NewBundleSchema
	} from "$lib/backend/schemas"
	import type { SuperValidated } from "sveltekit-superforms"
	import TableHeader from "$lib/components/tables/TableHeader.svelte"
	import TableCell from "$lib/components/tables/TableCell.svelte"
	import PricesCell from "./PricesCell.svelte"
	import { ExternalLink } from "lucide-svelte"

	export let id: string
	export let schema: BundleArraySchema | NewBundleSchema | ScriptArraySchema | NewScriptArraySchema
	export let data: SuperValidated<typeof schema>
	export let headers: string[]
	export let subscriptions: number[] | undefined = undefined
	export let action: string

	$: ({ form, errors, enhance, allErrors } = superForm(data, {
		id: id,
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: schema
	}))

	const btnText = action.includes("dd") ? "Add" : "Save"
</script>

<form method="POST" class="table-container max-w-7xl mx-auto mt-8 max-h-[40rem]" use:enhance>
	<table class="table table-hover border-separate space-y-6 text-sm">
		<TableHeader {headers} />
		<tbody>
			{#if "scripts" in $form}
				{#each $form.scripts as _, i}
					<tr>
						<TableCell alignment="left" padding={0}>
							<div class="mx-3">
								<input
									name="name"
									class="input my-1 md:my-0 w-72"
									type="text"
									bind:value={$form.scripts[i].name}
								/>
								<div class="text-xs mx-4 text-left">by {$form.scripts[i].author}</div>
							</div>
						</TableCell>

						<TableCell padding={0}>
							<PricesCell
								bind:prices={$form.scripts[i].prices}
								errors={"scripts" in $errors && $errors.scripts
									? // @ts-ignore
									  $errors.scripts[i]?.prices?._errors
									: undefined}
							/>
						</TableCell>

						{#if subscriptions}
							<TableCell>
								{#each subscriptions as sub, i}{#if i > 0}&nbsp;/&nbsp;{/if}{sub}{/each}
							</TableCell>
						{/if}

						<TableCell padding={0}>
							<button
								type="submit"
								class="btn variant-filled-secondary"
								formaction="?/{action}={$form.scripts[i].id}"
							>
								{btnText}
							</button>
						</TableCell>
					</tr>
				{/each}
			{:else if "bundles" in $form}
				{#each $form.bundles as bundle, i}
					<tr>
						<TableCell alignment="left" padding={0}>
							<div class="mx-3">
								<input
									name="name"
									class="input my-1 md:my-0 w-72"
									type="text"
									bind:value={$form.bundles[i].name}
								/>
								<div class="text-xs mx-4 text-left">by {$form.bundles[i].author}</div>
							</div>
						</TableCell>

						<TableCell padding={0}>
							<PricesCell
								bind:prices={$form.bundles[i].prices}
								errors={"bundles" in $errors && $errors.bundles
									? // @ts-ignore
									  $errors.bundles[i]?.prices?._errors
									: undefined}
							/>
						</TableCell>

						{#if subscriptions}
							<TableCell>
								{#each subscriptions as sub, i}{#if i > 0}&nbsp;/&nbsp;{/if}{sub}{/each}
							</TableCell>
						{/if}

						<TableCell padding={0}>
							<button
								type="button"
								class="btn variant-filled-secondary"
								on:click|preventDefault={() => (bundle.open = !bundle.open)}
							>
								View/Edit Scripts
							</button>
						</TableCell>
						<TableCell padding={0}>
							<button
								id="button-{$form.bundles[i].id}"
								type="submit"
								class="btn variant-filled-secondary"
								formaction="?/{action}={$form.bundles[i].id}"
							>
								{btnText}
							</button>
						</TableCell>
					</tr>
					{#if $form.bundles[i].open}
						<tr class="table-row">
							<td colspan="5">
								<table class="table table-compact">
									<tbody>
										{#each $form.bundles[i].bundledScripts as script}
											<tr>
												<td
													class="text-xs cursor-pointer"
													class:text-secondary-500={script.active}
													on:click={() => (script.active = !script.active)}
												>
													<div class="flex align-items-center ml-3">
														<a href={script.url} class="flex permalink h-full">
															<ExternalLink size={16} class="mr-4" />
														</a>
														{script.name}
													</div>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</td>
						</tr>
					{/if}
				{/each}
			{:else}
				<tr>
					<TableCell padding={0}>
						<div class="mx-3">
							<input
								name="name"
								class="input my-1 md:my-0 w-72"
								type="text"
								bind:value={$form.name}
							/>
							<div class="text-xs mx-4 text-left">by {$form.author}</div>
						</div>
					</TableCell>

					<TableCell padding={0}>
						<PricesCell
							bind:prices={$form.prices}
							errors={"prices" in $errors // @ts-ignore
								? $errors?.prices?._errors
								: undefined}
						/>
					</TableCell>
					<TableCell padding={0}>
						<button
							type="button"
							class="btn variant-filled-secondary"
							on:click|preventDefault={() => {
								if ("open" in $form) $form.open = !$form.open
							}}
						>
							View/Edit Scripts
						</button>
					</TableCell>
					<TableCell padding={0}>
						<button
							id="add-bundle"
							type="submit"
							class="btn variant-filled-secondary"
							formaction="?/{action}"
						>
							Add
						</button>
					</TableCell>
				</tr>
				{#if $form.open}
					<tr class="table-row">
						<td colspan="5">
							<table class="table table-compact">
								<tbody>
									{#each $form.bundledScripts as script}
										<tr>
											<td
												class="text-xs cursor-pointer"
												class:text-secondary-500={script.active}
												on:click={() => (script.active = !script.active)}
											>
												<div class="flex align-items-center ml-3">
													<a href={script.url} class="flex permalink h-full">
														<ExternalLink size={16} class="mr-4" />
													</a>
													{script.name}
												</div>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</td>
					</tr>
				{/if}
			{/if}
		</tbody>
	</table>
	<div class="max-h-64">
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
