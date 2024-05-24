<script lang="ts">
	import { AppShell } from "@skeletonlabs/skeleton"
	import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-svelte"
	import { page } from "$app/stores"
	import { goto } from "$app/navigation"
	import Paginator from "$lib/components/Paginator.svelte"
	import type { CheckboxType } from "$lib/types/collection"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import { browser } from "$app/environment"
	import { onMount } from "svelte"

	export let data
	const { checkboxes, range, featured } = data
	let { profile, scripts } = data
	let count = scripts.count
	let { searchParams } = $page.url

	$: ({ profile, scripts } = data)
	$: count = scripts.count
	$: ({ searchParams } = $page.url)

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()
	let categories: string[] = []
	let subcategories: string[] = []
	let show = false

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

	async function handleFilters() {
		categories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)
		subcategories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && !checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)

		await replaceQuery({ page: "1", categories: categories.toString().replaceAll(",", "-") })
		await replaceQuery({ page: "1", subcategories: subcategories.toString().replaceAll(",", "-") })
	}

	let carousel: HTMLDivElement

	function carouselLeft(): void {
		if (carousel === undefined) return
		const x =
			carousel.scrollLeft === 0
				? carousel.clientWidth * carousel.childElementCount // loop
				: carousel.scrollLeft - carousel.clientWidth // step left
		carousel.scroll(x, 0)
	}

	function carouselRight(): void {
		if (carousel === undefined) return
		const x =
			carousel.scrollLeft === carousel.scrollWidth - carousel.clientWidth
				? 0 // loop
				: carousel.scrollLeft + carousel.clientWidth // step right
		carousel.scroll(x, 0)
	}

	onMount(() => {
		const autoplay = setInterval(() => carouselRight(), 5000)
		return () => clearInterval(autoplay)
	})

	const headTitle = "Scripts - WaspScripts"
	const headDescription =
		"Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
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
							on:change={async () => await handleFilters()}
						>
							<input
								class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-primary-500"
								type="checkbox"
								id={"checkbox" + checkbox.id}
								bind:checked={checkbox.checked}
							/>
							<label
								class="form-check-label inline-block cursor-pointer hover:text-primary-200"
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

	<div class="p-4 grid grid-cols-[auto_1fr_auto] gap-5 items-center">
		<!-- Button: Left -->
		<button type="button" class="btn-icon variant-filled-surface" on:click={carouselLeft}>
			<ArrowLeft />
		</button>
		<!-- Full Images -->
		<div
			bind:this={carousel}
			class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto hide-scrollbar"
		>
			{#each featured as f}
				<a href="/scripts/{f?.url}" class="relative snap-center shrink-0 w-full text-center">
					<img
						class="object-cover w-full rounded-container-token brightness-90"
						src="{f?.protected?.assets}/banner.jpg"
						alt={f?.title}
						loading="lazy"
					/>
					<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<h1 class="font-bold text-sm text-shadow-strong drop-shadow-2xl">
							{f?.title}
						</h1>
						<h2 class="text-xl">
							<a
								href="/scripters/{f?.protected?.username}"
								class="font-semibold text-xl text-shadow-strong drop-shadow-2xl"
							>
								by {f?.protected?.username}
							</a>
						</h2>
					</div>
				</a>
			{/each}
		</div>
		<!-- Button: Right -->
		<button type="button" class="btn-icon variant-filled-surface" on:click={carouselRight}>
			<ArrowRight />
		</button>
	</div>

	<main class="container mt-8 mx-auto flex-grow w-[95%] max-h-screen overflow-y-visible">
		<div>
			{#if profile && profile.roles.scripter}
				<a href="/scripts/add" class="block mx-auto w-fit">
					<button class="btn variant-filled-secondary inline-block">Add Script</button>
				</a>
			{/if}
			<div class="py-6 flex flex-col text-sm mb-2 max-w-2xl m-auto">
				<input
					placeholder="Search script id, name, categories, author,..."
					class="input"
					bind:value={search}
					on:input={async () => await replaceQuery({ page: "1", search: search })}
				/>
			</div>

			<div
				class="grid gap-8 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-center justify-items-center"
			>
				{#each scripts.data as script} <ScriptCard {script} /> {/each}
			</div>
		</div>
		<Paginator bind:searchParams bind:pageIdx={currentPage} {range} bind:count />
	</main>
</AppShell>
