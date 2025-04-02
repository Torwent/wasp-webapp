<script lang="ts">
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { legalSchema } from "$lib/client/schemas"
	import Head from "$lib/components/Head.svelte"

	let { data } = $props()
	let show: boolean = $state(false)

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(legalSchema)
	})
</script>

<Head
	title="Add Legal"
	description="Add Legal document in WaspScripts."
	keywords="Privacy, Policy, Terms, Conditions"
/>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if show}
		<div class="container mx-auto my-6 max-w-4xl flex-grow">
			<article class="prose dark:prose-invert mx-auto py-6">
				{$form.content}
			</article>
		</div>
	{/if}

	{#if data.profile && data.roles?.administrator}
		<div class="flex">
			<button class="btn preset-filled mx-auto my-auto" onclick={() => (show = !show)}>
				{#if show}Hide{:else}Show{/if} Post Preview
			</button>
		</div>

		<form method="POST" use:enhance>
			<label for="content" class="label my-2">
				<span class="label-text">Content:</span>
				<textarea
					id="content"
					name="content"
					class="textarea h-64 overflow-y-scroll rounded-md"
					class:input-error={$errors.content}
					bind:value={$form.content}
				>
				</textarea>
				{#if $errors.content}
					<small class="text-error-500">{$errors.content}</small>
				{/if}
			</label>

			<div class="flex justify-between">
				<a href="./">
					<button class="btn preset-filled-secondary-500">Back</button>
				</a>

				<button type="submit" class="btn preset-filled-primary-500">Submit</button>
			</div>

			{#if $errors._errors}
				<div class="mt-8 grid">
					Errors:
					{#each $errors._errors as err (err)}
						<small class="text-error-500">- {err}</small>
					{/each}
				</div>
			{/if}
		</form>
	{:else}
		You don't have permission to edit this post.
	{/if}
</div>
