<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"
	import { scripterSchema } from "$lib/client/schemas"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import { superForm } from "sveltekit-superforms/client"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import PayPal from "../PayPal.svelte"
	import { Github } from "lucide-svelte"
	import { canEdit } from "$lib/client/supabase"
	import { page } from "$app/stores"
	import { zodClient } from "sveltekit-superforms/adapters"

	export let data

	let { scripterPromise: scripter } = data
	let show: boolean = false
	let isFocused: boolean = true

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(scripterSchema)
	})

	let headTitle = ""
	let headDescription = ""
	let headKeywords = ""
	let headAuthor = ""

	$: scripter.then((scripter) => {
		$form.id = scripter.id
		$form.realname = scripter.realname ?? null
		$form.description = scripter.description ?? null
		$form.content = scripter.content ?? null
		$form.github = scripter.github ?? null
		$form.paypal_id = scripter.paypal_id ?? null

		headTitle = "Edit " + scripter.profiles.username + " - WaspScripts"
		headDescription = "Edit " + scripter.profiles.username + " developer page."
		headKeywords =
			"OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Wasp, Scripts, Simba, Developer, " +
			scripter.profiles.username
		headAuthor = scripter.profiles.username
	})

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
		<div class="container mx-auto my-6 max-w-2xl flex-grow">
			<div class="flex justify-between">
				<div class="flex my-auto">
					<header>
						<h3 class="font-bold text-2xl">
							{#if $form.realname && $form.realname != ""}
								{$form.realname} /
							{/if}
							{#await scripter then scripter}
								{scripter.profiles.username}
							{/await}
						</h3>
					</header>
				</div>
				<div class="flex my-auto">
					<a href={$form.github}>
						<button class="text-secondary-500 mx-5 h-full">
							<Github />
						</button>
					</a>
					{#if $form.paypal_id && $form.paypal_id != ""}
						<div class="w-full mx-auto">
							{#await scripter then scripter}
								<PayPal paypal_id={$form.paypal_id} username={scripter.profiles.username} />
							{/await}
						</div>
					{/if}
				</div>
			</div>
			<h4 class="my-4">{$form.description}</h4>
			<article
				class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
			>
				<Markdown src={$form.content || ""} />
			</article>
		</div>
	{/if}

	{#if canEdit(data.profile?.id, data.roles, $form.id)}
		<div class="flex">
			<button class="btn variant-filled-secondary mx-auto" on:click={() => (show = !show)}>
				{#if show}Hide{:else}Show{/if} Preview
			</button>
		</div>

		<form method="POST" use:focusTrap={isFocused} use:enhance>
			<FormInput title="Name" bind:value={$form.realname} bind:errors={$errors.realname} />

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

			<FormInput title="GitHub" bind:value={$form.github} bind:errors={$errors.github} />
			<FormInput title="PaypalID" bind:value={$form.paypal_id} bind:errors={$errors.paypal_id} />

			<div class="flex justify-between">
				<a href="./" class="btn variant-filled-secondary">Back</a>

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
		You don't have permission to edit this post.
	{/if}
</div>
