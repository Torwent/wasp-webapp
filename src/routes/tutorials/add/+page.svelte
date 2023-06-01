<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { postSchema } from "$lib/backend/types"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import { superForm } from "sveltekit-superforms/client"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import { slide } from "svelte/transition"
	import TutorialLevel from "$lib/components/forms/TutorialLevel.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"

	export let data
	let show: boolean = false
	let isFocused: boolean = true

	const { form, errors, enhance } = superForm(data.form, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: postSchema
	})
</script>

<svelte:head>
	<MetaTags title="Add Tutorial" description="Add tutorial." robots="noindex" />
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if show}
		<div
			class="container mx-auto my-6 max-w-4xl flex-grow"
			in:slide={{ duration: 300, delay: 300 }}
			out:slide={{ duration: 300 }}
		>
			<h2 class="text-center mb-4 font-bold text-3xl">{$form.title}</h2>
			<h3 class="text-center font-semibold leading-normal mb-4">{$form.description}</h3>

			<article
				class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
			>
				<Markdown src={$form.content} />
			</article>
		</div>
	{/if}

	{#if data.profile && data.profile.profiles_protected.moderator}
		<div class="flex">
			<button class="btn variant-filled-secondary mx-auto" on:click={() => (show = !show)}>
				{#if show}Hide{:else}Show{/if} Post Preview
			</button>
		</div>

		<form method="POST" use:focusTrap={isFocused} use:enhance>
			<FormInput title="Title" bind:value={$form.title} bind:error={$errors.title} />

			<FormInput
				title="Description"
				bind:value={$form.description}
				bind:error={$errors.description}
			/>

			<FormTextarea title="Content" bind:value={$form.content} bind:error={$errors.content} />

			<TutorialLevel bind:value={$form.level} bind:error={$errors.level} />

			<div class="flex justify-between">
				<a href="./">
					<button class="btn variant-filled-secondary">Back</button>
				</a>

				<button type="submit" class="btn variant-filled-secondary">Submit</button>
			</div>

			{#if $errors._errors}
				<div class="mt-8 grid">
					Errors:
					{#each $errors._errors as err}
						<small class="text-error-500">- {err}</small>
					{/each}
				</div>
			{/if}
		</form>
	{:else}
		You don't have permission to add posts.
	{/if}
</div>
