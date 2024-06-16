<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import type {
		ScriptArraySchema,
		NewScriptArraySchema,
		BundleArraySchema,
		NewBundleSchema
	} from "$lib/client/schemas"
	import type { Infer, SuperValidated } from "sveltekit-superforms"
	import TableBundles from "./TableBundles.svelte"
	import TableNewBundle from "./TableNewBundle.svelte"
	import TableScripts from "./TableScripts.svelte"
	import TableNewScripts from "./TableNewScripts.svelte"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { page } from "$app/stores"

	export let id: string | undefined = undefined
	export let schema: BundleArraySchema | NewBundleSchema | ScriptArraySchema | NewScriptArraySchema

	export let headers: string[]
	interface Subscriptions {
		count: number
		cancelling: number
		free: number
	}

	let data: SuperValidated<Infer<typeof schema>>
	if (id === "bundleEdit") data = $page.data.forms.bundles
	else if (id === "bundleAdd") data = $page.data.forms.newBundle
	else if (id === "scriptEdit") data = $page.data.forms.scripts
	else data = $page.data.forms.newScript

	$: if (id === "bundleEdit") data = $page.data.forms.bundles
	else if (id === "bundleAdd") data = $page.data.forms.newBundle
	else if (id === "scriptEdit") data = $page.data.forms.scripts
	else data = $page.data.forms.newScript

	export let subscriptions: Subscriptions[] | undefined = undefined
	export let action: string

	const { form, errors, enhance, allErrors } = superForm(data, {
		id: id,
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: zodClient(schema),
		resetForm: true
	})

	const subs = subscriptions ?? [
		{ count: 0, cancelling: 0, free: 0 },
		{ count: 0, cancelling: 0, free: 0 }
	]
</script>

<form method="POST" class="table-container max-w-7xl mx-auto mt-8 max-h-[40rem]" use:enhance>
	<table class="table table-hover border-separate space-y-6 text-sm">
		{#if "bundles" in $form}
			<TableBundles
				{headers}
				bind:products={$form.bundles}
				subscriptions={subs}
				errors={$errors._errors ?? undefined}
				{action}
			/>
		{:else if "scripts" in $form}
			<TableScripts
				{headers}
				bind:products={$form.scripts}
				subscriptions={subs}
				errors={$errors._errors ?? undefined}
				{action}
			/>
		{:else if "newScripts" in $form}
			<TableNewScripts
				{headers}
				bind:products={$form.newScripts}
				errors={$errors._errors ?? undefined}
				{action}
			/>
		{:else}
			<TableNewBundle
				{headers}
				bind:product={$form}
				errors={$errors._errors ?? undefined}
				{action}
			/>
		{/if}
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
	</table>
</form>
