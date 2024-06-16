<script lang="ts">
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { redirect } from "@sveltejs/kit"
	import { profileSchema } from "$lib/client/schemas"
	import { superForm } from "sveltekit-superforms/client"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import { page } from "$app/stores"
	import { zodClient } from "sveltekit-superforms/adapters"

	export let data
	export let form

	const { profile } = data
	if (!profile) redirect(303, "/")

	let isFocused: boolean = true

	const {
		form: authForm,
		errors,
		enhance
	} = superForm(data.form, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: null,
		validators: zodClient(profileSchema)
	})

	const headTitle = profile.username + " - WaspScripts"
	const headDescription = "Information about " + profile.username + " in WaspScripts"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
		profile.username
	const headAuthor = profile.username
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
	<h3 class="mb-4 font-bold text-3xl">Username: {profile.username}</h3>
	<h4 class="font-semibold leading-normal mb-4">ID: {profile.id}</h4>

	<RoleBadges />

	<h5 class="py-8">
		If you want you can change your email/password already anyway. This can be used to login without
		discord for developing purposes. (e.g. github actions.)
	</h5>

	<form
		class="form my-6 w-full"
		method="POST"
		enctype="multipart/form-data"
		use:focusTrap={isFocused}
		use:enhance
	>
		{#if $errors._errors}
			<div class="flex" />
			{#each $errors._errors as error}
				<small class="flex text-error-500">{error}</small>
			{/each}
		{/if}

		{#if form?.email}
			<small class="text-success-500">You've received a link on your email to confirm it.</small>
		{/if}
		{#if form?.password}
			<small class="text-success-500">Your password has been updated.</small>
		{/if}

		<FormInput title="Email" bind:value={$authForm.email} bind:errors={$errors.email} />
		<FormInput
			title="Password"
			bind:value={$authForm.password}
			bind:errors={$errors.password}
			type={"password"}
		/>

		<button type="submit" class="btn variant-filled-secondary">
			<span class="px-2">Update</span>
		</button>
	</form>
</div>
