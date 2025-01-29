<script lang="ts">
	import { page } from "$app/state"
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { legalSchema } from "$lib/client/schemas"

	let { data } = $props()
	let { policies } = $derived(data)

	let show: boolean = $state(false)
	let isFocused: boolean = $state(true)

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(legalSchema)
	})

	const headTitle = "Add Legal - WaspScripts"
	const headDescription = "Add Legal document in WaspScripts."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide"
	const headAuthor = ""
	const headImage = "/multi-color-logo.png"
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
	<meta property="og:url" content={page.url.href} />
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
			<article class="prose mx-auto py-6 dark:prose-invert">
				{$form.content}
			</article>
		</div>
	{/if}

	{#if data.profile && data.roles?.administrator}
		<div class="flex">
			<button class="btn mx-auto my-auto preset-filled" onclick={() => (show = !show)}>
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
					{#each $errors._errors as err}
						<small class="text-error-500">- {err}</small>
					{/each}
				</div>
			{/if}
		</form>
	{:else}
		You don't have permission to edit this post.
	{/if}
</div>
