<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { Github } from "lucide-svelte"
	import PayPal from "./PayPal.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import type { Script } from "$lib/types/collection"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	export let data

	const { range } = data
	let { profile, developer, scripts } = data
	let count = scripts.count
	let { searchParams } = $page.url

	$: ({ profile, developer, scripts } = data)
	$: count = scripts.count
	$: ({ searchParams } = $page.url)

	const parsedPage = Number(searchParams.get("page") || "-1")
	let currentPage = parsedPage >= 0 ? parsedPage : 1

	let search = decodeURIComponent(searchParams.get("search") || "").trim()

	async function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		let invalidate: boolean = false
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else searchParams.delete(k)

			invalidate = invalidate || v === ""
		}

		const path = $page.url.origin + $page.url.pathname + "?" + searchParams.toString()

		await goto(path, {
			keepFocus: true,
			noScroll: true,
			replaceState: true,
			invalidateAll: invalidate
		})
	}

	function canSeeScript(script: Script) {
		if (script.published) return true
		if (!profile) return false
		if (profile.roles.administrator) return true
		if (profile.roles.moderator) return true
		return script.protected.author_id === profile.id
	}

	const headTitle = developer.profiles.username + " - WaspScripts"
	const headDescription = developer.description
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Developer, " +
		developer.profiles.username
	const headAuthor = developer.profiles.username
	const headImage =
		"https://db.waspscripts.com/storage/v1/object/public/imgs/logos/multi-color-logo.png"
</script>

<svelte:head>
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
</svelte:head>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	<div class="flex justify-between">
		<div class="flex my-auto">
			<header>
				<h3 class="font-bold text-2xl">
					{#if developer.realname && developer.realname != ""} {developer.realname} / {/if}
					{developer.profiles.username}
				</h3>
			</header>
		</div>
		<div class="flex my-auto">
			{#if developer.github}
				<a href={developer.github}>
					<button class="text-secondary-500 mx-5 h-full">
						<Github />
					</button>
				</a>
			{/if}
			{#if developer.paypal_id && developer.paypal_id != ""}
				<div class="w-full mx-auto">
					<PayPal paypal_id={developer.paypal_id} username={developer.profiles.username} />
				</div>
			{/if}
		</div>
	</div>
	<h4 class="my-4">{developer.description || ""}</h4>
	<article
		class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
	>
		<Markdown src={developer.content || ""} />
	</article>

	<div class="flex justify-between">
		<div class="my-8 grid place-items-center">
			<a href="./" class="btn variant-filled-secondary">Back</a>
		</div>

		<EditButton author_id={developer.id} />
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
				on:input={async () => await replaceQuery({ page: "1", search: search })}
			/>
		</div>

		<div
			class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-center justify-items-center"
		>
			{#each scripts.data as script}
				{#if canSeeScript(script)}
					<ScriptCard {script} />
				{/if}
			{/each}
		</div>
	</div>
	<Paginator bind:searchParams bind:pageIdx={currentPage} {range} bind:count />
</main>
