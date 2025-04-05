<script lang="ts">
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { profileSchema } from "$lib/client/schemas"
	import { zodClient } from "sveltekit-superforms/adapters"
	import Head from "$lib/components/Head.svelte"
	import { superForm } from "sveltekit-superforms"

	const { data, form } = $props()
	const profile = $derived(data.profile!)

	const {
		form: authForm,
		errors,
		enhance
	} = superForm(data.form!, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: null,
		dataType: "json",
		validators: zodClient(profileSchema)
	})
</script>

<Head
	title={profile.username}
	description={"Information about " + profile.username + " in WaspScripts"}
	keywords={profile?.username}
/>

<main class="container mx-auto my-6 flex max-w-3xl flex-col">
	<header class="my-24 flex flex-col">
		<h1 class="mx-auto my-2 text-3xl font-bold">Username: {profile.username}</h1>
		<h2 class="mx-auto my-8 leading-normal font-semibold">ID: {profile.id}</h2>
	</header>

	<RoleBadges />

	<h5 class="py-8">
		If you want you can change your email/password already anyway. This can be used to login without
		discord for developing purposes. (e.g. github actions.)
	</h5>

	<form class="my-6 flex w-full flex-col" method="POST" use:enhance>
		{#if $errors._errors}
			{#each $errors._errors as err (err)}
				<small class="text-error-500 flex">{err}</small>
			{/each}
		{/if}

		{#if form?.email}
			<small class="text-success-500">
				You've received a link on both emails. Open them both to confirm the change.
			</small>
		{/if}
		{#if form?.password}
			<small class="text-success-500">Your password has been updated.</small>
		{/if}

		<label class="label my-4">
			<span class="label-text">Email:</span>
			<input class="input" class:border-error-500={$errors.email} bind:value={$authForm.email} />
			{#if $errors.email}
				{#each $errors.email as err (err)}
					<small class="text-error-500">{err}</small>
				{/each}
			{/if}
		</label>
		<label class="label my-4">
			<span class="label-text">Password:</span>
			<input
				class="input"
				class:border-error-500={$errors.password}
				bind:value={$authForm.password}
			/>
			{#if $errors.password}
				{#each $errors.password as err (err)}
					<small class="text-error-500">{err}</small>
				{/each}
			{/if}
		</label>

		<button type="submit" class="btn preset-filled-primary-500 mx-auto my-4"> Update </button>
	</form>
</main>
