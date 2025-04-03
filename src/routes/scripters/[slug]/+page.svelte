<script lang="ts">
	import Head from "$lib/components/Head.svelte"
	import { Github } from "svelte-lucide"
	import PayPal from "./PayPal.svelte"
	import { page } from "$app/state"
	import { Tabs } from "@skeletonlabs/skeleton-svelte"
	import { replaceQuery } from "$lib/client/utils"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { superForm } from "sveltekit-superforms/client"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { scripterSchema } from "$lib/client/schemas"

	const { data } = $props()
	const { profile, roles, count, scripts, scripter } = $derived(data)

	let { amount } = $state(data)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())

	let tab = $state("info")

	const { form, errors, enhance } = superForm(data.form, {
		dataType: "json",
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: false,
		validators: zodClient(scripterSchema),
		resetForm: true
	})
</script>

<Head
	title={scripter.profiles.username}
	description={scripter.profiles.username + ($form.description ? ", " + $form.description : "")}
	keywords={"Scripter, Scripters, Developer, Developers, " +
		scripter.profiles.username +
		($form.realname ? ", " + $form.realname : "")}
	author={scripter.profiles.username}
	img={scripter.profiles.avatar}
/>

<main class="my-16">
	<div class="my-16 flex justify-around text-center">
		<div class="my-auto flex">
			<header>
				<h3 class="text-2xl font-bold">
					{#if $form.realname && $form.realname != ""}
						{$form.realname} /
					{/if}
					{scripter.profiles.username}
				</h3>
			</header>
		</div>
		{#if $form.github || ($form.paypal_id && $form.paypal_id != "")}
			<div class="my-auto flex">
				{#if $form.github}
					<a
						href={$form.github}
						class="btn preset-filled-surface-300-700 hover:text-secondary-500 mx-5 h-full"
					>
						<Github />
					</a>
				{/if}
				{#if $form.paypal_id && $form.paypal_id != ""}
					<div class="mx-auto w-full">
						<PayPal id={$form.paypal_id} username={scripter.profiles.username} />
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<Tabs value={tab} onValueChange={(e) => (tab = e.value)} listJustify="justify-center">
		{#snippet list()}
			<Tabs.Control value="info">Information</Tabs.Control>
			{#if $form.id === profile?.id || roles?.moderator || roles?.administrator}
				<Tabs.Control value="edit">Edit</Tabs.Control>
			{/if}
			<Tabs.Control value="scripts">Scripts</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="info">
				<h4 class="my-24 text-center">
					{$form.description ?? "This scripter did not add a description."}
				</h4>
				<article class="prose dark:prose-invert mx-auto my-24">
					{#if $form.content}
						{@html $form.content}
					{:else}
						This scripter did not add information about him.
					{/if}
				</article>

				<div class="mx-auto flex justify-around">
					<a href="./" class="btn preset-filled-secondary-500">Back</a>
				</div>
			</Tabs.Panel>
			{#if $form.id === profile?.id || roles?.moderator || roles?.administrator}
				<Tabs.Panel value="edit">
					<form method="POST" class="mx-auto my-24 w-2/4 min-w-xs text-center" use:enhance>
						<h1 class="my-2">All fields are optional</h1>
						<h2 class="mb-12">
							You can preview your changes in the "Information" tab but don't forget to save.
						</h2>
						<label class="label my-4">
							<span class="label-text">Real name:</span>
							<input class="input" bind:value={$form.realname} />
							{#if $errors.id}
								{#each $errors.id as err}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</label>
						<label class="label my-4">
							<span class="label-text">GitHub:</span>
							<input class="input" bind:value={$form.github} />
							{#if $errors.github}
								{#each $errors.github as err}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</label>
						<label class="label my-4">
							<span class="label-text">Paypal ID:</span>
							<input class="input" bind:value={$form.paypal_id} />
							{#if $errors.paypal_id}
								{#each $errors.paypal_id as err}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</label>
						<label class="label my-4">
							<span class="label-text">Description:</span>
							<input class="input" bind:value={$form.description} />
							{#if $errors.description}
								{#each $errors.description as err}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</label>
						<label class="label my-4">
							<span class="label-text">Content:</span>
							<textarea class="textarea h-44" bind:value={$form.content}> </textarea>
							{#if $errors.content}
								{#each $errors.content as err}
									<small class="text-error-500">{err}</small>
								{/each}
							{/if}
						</label>
						<button type="submit" class="btn preset-filled-secondary-500">Save</button>
					</form>
				</Tabs.Panel>
			{/if}
			<Tabs.Panel value="scripts">
				<input
					type="text"
					placeholder="🔍Search script by id, name, categories, author, content, ..."
					class="input mx-auto my-8 max-w-3xl"
					bind:value={search}
					oninput={() =>
						replaceQuery(page.url, {
							page: "1",
							search: search
						})}
				/>

				<main class="my-4 flex h-fit flex-col">
					<div
						class="3xl:grid-cols-5 mx-8 my-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
					>
						{#each scripts as script (script.id)}
							<ScriptCard {script} link={"/scripts/" + script.url} />
						{/each}
					</div>
					<div class="mx-8">
						<Paginator data={scripts} {currentPage} bind:pageSize={amount} {count} />
					</div>
				</main>
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</main>
