<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { Github } from "lucide-svelte"
	import PayPal from "./PayPal.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	import { browser } from "$app/environment"
	import { invalidate } from "$app/navigation"
	import type { IScriptCard } from "$lib/types/collection"
	import { onMount } from "svelte"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	export let data

	const { range } = data
	let { profile, developer, scripts } = data
	$: ({ profile, developer, scripts } = data)

	let count = 0
	$: count = (data.count as number) || 0

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent($page.url.searchParams.get("search") || "").trim()
	let loading = true

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
		invalidate("supabase:developer")
	}

	function canSeeScript(script: IScriptCard) {
		if (script.published) return true
		if (!profile) return false
		if (profile.profiles_protected.administrator) return true
		if (profile.profiles_protected.moderator) return true
		return script.scripts_protected.author_id === profile.id
	}

	onMount(() => (loading = false))

	$: replaceQuery({ page: currentPage.toString() })
	$: replaceQuery({ page: "1", search: search })

	const headTitle = developer.profiles_public.username + " - WaspScripts"
	const headDescription = developer.description
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Developer, " +
		developer.profiles_public.username
	const headAuthor = developer.profiles_public.username
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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
					{developer.profiles_public.username}
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
					<PayPal paypal_id={developer.paypal_id} username={developer.profiles_public.username} />
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
				type="search"
				placeholder="Search script id, name, categories, author,..."
				class="input"
				bind:value={search}
			/>
		</div>

		<div
			class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-center justify-items-center"
		>
			{#each scripts as script}
				{#if canSeeScript(script)}
					<ScriptCard {script} />
				{/if}
			{/each}
		</div>
	</div>
	<Paginator srcData={"supabase:developer"} bind:currentPage {range} bind:count />
</main>
