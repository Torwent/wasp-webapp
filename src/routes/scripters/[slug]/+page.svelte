<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"
	import { Github } from "lucide-svelte"
	import PayPal from "./PayPal.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import ScriptCardBase from "$lib/components/ScriptCardBase.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { replaceQuery } from "$lib/client/utils"

	import type { ScriptBase } from "$lib/types/collection"
	export let data

	const { range } = data
	let { scripterPromise, scriptsPromise } = data
	$: ({ scriptsPromise, scriptsPromise } = data)

	let { searchParams } = $page.url
	$: ({ searchParams } = $page.url)

	const parsedPage = Number(searchParams.get("page") || "-1")
	let currentPage = parsedPage >= 0 ? parsedPage : 1

	let search = decodeURIComponent(searchParams.get("search") || "").trim()

	let resolvedPromise: ScriptBase[] | null = null
	let resolvedCount: number = 0

	$: scriptsPromise.then((scripts) => {
		resolvedPromise = scripts.scripts
		resolvedCount = scripts.count
	})

	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	{#await scripterPromise then scripter}
		{@const headTitle = scripter.profiles.username + " - WaspScripts"}
		{@const headDescription = scripter.description}
		{@const headKeywords =
			"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Developer, " +
			scripter.profiles.username}
		{@const headAuthor = scripter.profiles.username}

		<title>{headTitle}</title>
		<meta name="description" content={headDescription} />
		<meta name="keywords" content={headKeywords} />
		<meta name="author" content={headAuthor} />
		<meta name="robots" content="all" />

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
	{/await}
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	<div class="flex justify-between">
		<div class="flex my-auto">
			<header>
				<h3 class="font-bold text-2xl">
					{#await scripterPromise}
						Loading...
					{:then scripter}
						{#if scripter.realname && scripter.realname != ""}
							{scripter.realname} /
						{/if}
						{scripter.profiles.username}
					{/await}
				</h3>
			</header>
		</div>
		<div class="flex my-auto">
			{#await scripterPromise then scripter}
				{#if scripter.github}
					<a href={scripter.github}>
						<button class="text-secondary-500 mx-5 h-full"><Github /></button>
					</a>
				{/if}
				{#if scripter.paypal_id && scripter.paypal_id != ""}
					<div class="w-full mx-auto">
						<PayPal paypal_id={scripter.paypal_id} username={scripter.profiles.username} />
					</div>
				{/if}
			{/await}
		</div>
	</div>
	<h4 class="my-4">
		{#await scripterPromise}
			Loading...
		{:then scripter}
			{scripter.description ?? ""}
		{/await}
	</h4>
	<article
		class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
	>
		{#await scripterPromise}
			Loading...
		{:then scripter}
			<Markdown src={scripter.content ?? ""} />
		{/await}
	</article>

	<div class="flex justify-between">
		<div class="my-8 grid place-items-center">
			<a href="./" class="btn variant-filled-secondary">Back</a>
		</div>
		{#await scripterPromise then scripter} <EditButton author={scripter.id} /> {/await}
	</div>
</div>

<main class="my-8 container mt-8 mx-auto flex-grow w-[95%] max-h-full">
	<div>
		<div class="py-6 flex flex-col text-sm mb-2 max-w-2xl m-auto">
			<input
				type="text"
				placeholder="Search script id, name, categories, author,..."
				class="input"
				bind:value={search}
				on:input={async () =>
					await replaceQuery($page.url, {
						page: "1",
						search: search
					})}
			/>
		</div>

		<div
			class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-center justify-items-center"
		>
			{#if resolvedPromise}
				{#each resolvedPromise as script}
					<ScriptCard bind:script />
				{/each}
			{:else}
				{#each Array(8) as _}
					<ScriptCardBase />
				{/each}
			{/if}
		</div>
	</div>

	<Paginator bind:searchParams bind:pageIdx={currentPage} {range} bind:count={resolvedCount} />
</main>
