<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import type {
		ScriptArraySchema,
		NewScriptArraySchema,
		BundleArraySchema,
		NewBundleSchema
	} from "$lib/backend/schemas"
	import type { SuperValidated } from "sveltekit-superforms"
	import TableBundles from "./TableBundles.svelte"
	import TableNewBundle from "./TableNewBundle.svelte"
	import TableScripts from "./TableScripts.svelte"
	import TableNewScripts from "./TableNewScripts.svelte"

	export let id: string
	export let schema: BundleArraySchema | NewBundleSchema | ScriptArraySchema | NewScriptArraySchema

	export let data: SuperValidated<typeof schema>
	export let headers: string[]
	interface Subscriptions {
		count: number
		cancelling: number
		free: number
	}

	export let subscriptions: Subscriptions[] | undefined = undefined
	export let action: string

	const { form, errors, enhance, allErrors } = superForm(data, {
		id: id,
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors-and-message",
		validators: schema,
		resetForm: true
	})

	const subs = subscriptions ?? []
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
