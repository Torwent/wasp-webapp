<script lang="ts">
	import { fade } from "svelte/transition"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { redirect } from "@sveltejs/kit"
	import { profileSchema } from "$lib/backend/types.js"
	import { superForm } from "sveltekit-superforms/client"
	import { focusTrap } from "@skeletonlabs/skeleton"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import { page } from "$app/stores"

	export let data
	const { profile } = data
	if (!profile) throw redirect(303, "/")

	let email = data.email ?? ""
	let password: string = ""
	let isFocused: boolean = true

	const { form, errors, enhance } = superForm(data.form, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: profileSchema
	})

	$: $form.email = email === "" ? undefined : email
	$: $form.password = password === "" ? undefined : password

	const headTitle = profile.username + " - WaspScripts"
	const headDescription = "Information about " + profile.username + " in WaspScripts"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
		profile.username
	const headAuthor = profile.username
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

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<h3 class="mb-4 font-bold text-3xl">Username: {profile.username}</h3>
	<h4 class="font-semibold leading-normal mb-4">ID: {profile.id}</h4>

	<RoleBadges {profile} />

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

		<FormInput title="Email" bind:value={email} bind:error={$errors.email} />
		<FormInput
			title="Password"
			bind:value={password}
			bind:error={$errors.password}
			type={"password"}
		/>

		<button
			type="submit"
			class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
		>
			<span class="px-2">Update</span>
		</button>
	</form>
</div>
