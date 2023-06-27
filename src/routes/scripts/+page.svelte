<script lang="ts">
	import { AppShell } from "@skeletonlabs/skeleton"
	import { ChevronRight } from "lucide-svelte"
	import { page } from "$app/stores"
	import { invalidate } from "$app/navigation"
	import { browser } from "$app/environment"
	import Paginator from "$lib/components/Paginator.svelte"
	import { onMount } from "svelte"
	import type { CheckboxType, IScriptCard } from "$lib/types/collection"
	import ScriptCard from "$lib/components/ScriptCard.svelte"

	export let data
	const { checkboxes, range } = data
	let { profile, scripts } = data
	$: ({ profile, scripts } = data)

	let count = 0
	$: count = (data.count as number) || 0

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent($page.url.searchParams.get("search") || "").trim()
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"
	let categories: string[] = []
	let subcategories: string[] = []
	let show = false
	let loading = true

	function handleFilters() {
		categories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)
		subcategories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && !checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)
	}

	function replaceQuery(values: Record<string, string>) {
		if (!browser) return
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") $page.url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else $page.url.searchParams.delete(k)
		}

		if (loading) return

		history.replaceState({}, "", $page.url)
		invalidate("supabase:scripts")
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
	$: replaceQuery({ page: "1", categories: categories.toString().replaceAll(",", "-") })
	$: replaceQuery({ page: "1", subcategories: subcategories.toString().replaceAll(",", "-") })
	$: replaceQuery({ ascending: ascending.toString() })

	const headTitle = "Scripts - WaspScripts"
	const headDescription =
		"Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
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

<AppShell>
	<svelte:fragment slot="sidebarLeft">
		<div
			class="flex h-screen border-r dark:border-stone-800 sticky bottom-0 min-h-full overflow-y-scroll
				   no-scrollbar font-semibold text-sm"
		>
			<div class="sm:grid w-60 justify-center my-4" class:hidden={!show}>
				{#each checkboxes as checkbox}
					<div class="flex py-0.5">
						{#if !checkbox.main}
							<div class="w-4 h-2" />
						{/if}
						<div
							id={"checkboxdiv" + checkbox.id}
							class:font-thin={!checkbox.main}
							on:change={() => handleFilters()}
						>
							<input
								class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-amber-500"
								type="checkbox"
								id={"checkbox" + checkbox.id}
								bind:checked={checkbox.checked}
							/>
							<label
								class="form-check-label inline-block cursor-pointer dark:hover:text-amber-100 hover:text-orange-400"
								for={"checkbox" + checkbox.id}
								class:text-amber-500={checkbox.checked}
							>
								{checkbox.name + checkbox.emoji}
							</label>
						</div>
					</div>
					{#if checkbox.id === 3}
						<br />
					{/if}
				{/each}
			</div>
			<button
				class="grid sm:hidden fill-white content-center justify-items-center justify-center h-full"
				on:click={() => (show = !show)}
			>
				<ChevronRight class="flex duration-100 {show ? 'rotate-180' : ''}" />
			</button>
		</div>
	</svelte:fragment>

	<main class="container mt-8 mx-auto flex-grow w-[95%] max-h-screen overflow-y-visible">
		<div>
			{#if profile && profile.profiles_protected.developer}
				<a href="/scripts/add" class="block mx-auto w-fit">
					<button class="btn variant-filled-secondary inline-block">Add Script</button>
				</a>
			{/if}
			<div class="py-6 flex flex-col text-sm mb-2 max-w-2xl m-auto">
				<input
					type="text"
					placeholder="Search script id, name, categories, author,..."
					class="input"
					bind:value={search}
				/>
			</div>

			<div
				class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-center justify-items-center"
			>
				{#each scripts as script}
					<ScriptCard {script} />
				{/each}
			</div>
		</div>
		<Paginator srcData={"supabase:scripts"} bind:currentPage {range} bind:count />
	</main>
</AppShell>
