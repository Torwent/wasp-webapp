<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { developerSchema } from "$lib/backend/types"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import { superForm } from "sveltekit-superforms/client"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import { slide } from "svelte/transition"
	import PayPal from "../PayPal.svelte"
	import { Github } from "lucide-svelte"
	import { canEdit } from "$lib/backend/data"
	import { page } from "$app/stores"

	export let data

	let { developer } = data
	let show: boolean = false
	let isFocused: boolean = true

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: developerSchema
	})

	$form.id = developer.id
	$: $form.realname = developer.real_name
	$: $form.username = developer.username
	$: $form.description = developer.description
	$: $form.content = developer.content
	$: $form.github = developer.github
	$: $form.paypal_id = developer.paypal_id

	const headTitle = "Edit " + developer.username + " - WaspScripts"
	const headDescription = "Edit " + developer.username + " developer page."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour, Bot, Wasp, Scripts, Simba, Developer, " +
		developer.username
	const headAuthor = developer.username
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/logo.png"
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
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if show}
		<div
			class="container mx-auto my-6 max-w-2xl flex-grow"
			in:slide={{ duration: 300, delay: 300 }}
			out:slide={{ duration: 300 }}
		>
			<div class="flex justify-between">
				<div class="flex my-auto">
					<header>
						<h3 class="font-bold text-2xl">
							{#if developer.real_name && developer.real_name != ""} {developer.real_name} / {/if}
							{developer.username}
						</h3>
					</header>
				</div>
				<div class="flex my-auto">
					<a href={developer.github}>
						<button class="text-secondary-500 mx-5 h-full">
							<Github />
						</button>
					</a>
					{#if developer.paypal_id && developer.paypal_id != ""}
						<div class="w-full mx-auto">
							<PayPal paypal_id={developer.paypal_id} username={developer.username} />
						</div>
					{/if}
				</div>
			</div>
			<h4 class="my-4">{developer.description}</h4>
			<article
				class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
			>
				<Markdown src={developer.content} />
			</article>
		</div>
	{/if}

	{#if canEdit(data.profile, developer.id)}
		<div class="flex">
			<button class="btn variant-filled-secondary mx-auto" on:click={() => (show = !show)}>
				{#if show}Hide{:else}Show{/if} Preview
			</button>
		</div>

		<form method="POST" use:focusTrap={isFocused} use:enhance>
			<FormInput title="Name" bind:value={developer.real_name} bind:error={$errors.realname} />
			<FormInput title="Username" bind:value={developer.username} bind:error={$errors.username} />

			<FormInput
				title="Description"
				bind:value={developer.description}
				bind:error={$errors.description}
			/>

			<FormTextarea title="Content" bind:value={developer.content} bind:error={$errors.content} />

			<FormInput title="GitHub" bind:value={developer.github} bind:error={$errors.github} />
			<FormInput title="PaypalID" bind:value={developer.paypal_id} bind:error={$errors.paypal_id} />

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
		You don't have permission to edit this post.
	{/if}
</div>
