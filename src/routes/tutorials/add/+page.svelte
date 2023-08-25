<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { postSchema } from "$lib/backend/schemas"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import { superForm } from "sveltekit-superforms/client"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import TutorialLevel from "$lib/components/forms/TutorialLevel.svelte"
	import { page } from "$app/stores"

	export let data
	let show: boolean = false
	let isFocused: boolean = true
	let published: boolean = false

	const { form, errors, enhance } = superForm(data.form, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: postSchema
	})

	const headTitle = "Add Tutorial - WaspScripts"
	const headDescription = "Add Tutorial."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide"
	const headAuthor = "Torwent"
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="noindex" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if show}
		<div class="container mx-auto my-6 max-w-4xl flex-grow">
			<h2 class="text-center mb-4 font-bold text-3xl">{$form.title}</h2>
			<h3 class="text-center font-semibold leading-normal mb-4">{$form.description}</h3>

			<article
				class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
			>
				<Markdown src={$form.content} />
			</article>
		</div>
	{/if}

	{#if data.profile && data.profile.roles.administrator}
		<div class="flex">
			<button class="btn variant-filled-secondary mx-auto" on:click={() => (show = !show)}>
				{#if show}Hide{:else}Show{/if} Post Preview
			</button>
		</div>

		<form method="POST" use:focusTrap={isFocused} use:enhance>
			<FormInput title="Title" bind:value={$form.title} bind:errors={$errors.title} />

			<FormInput
				title="Description"
				bind:value={$form.description}
				bind:errors={$errors.description}
			/>

			<FormTextarea
				title="Content"
				bind:value={$form.content}
				bind:errors={$errors.content}
				h={"h-64"}
			/>

			<TutorialLevel bind:value={$form.level} bind:errors={$errors.level} />

			<label for="order" class="label my-2">
				<span>Tutorial order:</span>
				<input
					type="number"
					id="order"
					name="order"
					class="input h-10"
					class:input-error={$errors.order}
					bind:value={$form.order}
				/>

				{#if $errors.order}
					<small class="text-error-500">{$errors.order}</small>
				{:else}
					<div class="m-0 h-5" />
				{/if}
			</label>

			<div class="flex my-8">
				<label
					for="published"
					class="form-check-label inline-block cursor-pointer dark:hover:text-primary-100 hover:text-primary-400"
				>
					Published
					<input
						type="checkbox"
						id="published"
						name="published"
						class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-primary-500"
						bind:checked={published}
					/>
				</label>
			</div>

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
