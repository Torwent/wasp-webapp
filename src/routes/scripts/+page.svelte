<script lang="ts">
	import { ArrowLeft, ArrowRight, ChevronsRight } from "lucide-svelte"
	import { page } from "$app/stores"
	import Paginator from "$lib/components/Paginator.svelte"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import { onMount } from "svelte"
	import { replaceQuery } from "$lib/client/utils"
	import type { CheckboxType } from "$lib/types/collection"
	import CarouselEntry from "./CarouselEntry.svelte"

	export let data
	const { checkboxes, featured } = data
	let { roles, scripts, amount } = data
	let { searchParams } = $page.url
	let count: number = scripts.count

	$: ({ profile, scripts, amount } = data)
	$: ({ searchParams } = $page.url)
	$: count = scripts.count

	const pageStr = searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search = decodeURIComponent(searchParams.get("search") || "").trim()
	let categories: string[] = []
	let subcategories: string[] = []
	let show = false

	async function handleFilters() {
		categories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)

		subcategories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && !checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)

		await replaceQuery($page.url, {
			page: "1",
			categories: categories.toString().replaceAll(",", "-")
		})
		await replaceQuery($page.url, {
			page: "1",
			subcategories: subcategories.toString().replaceAll(",", "-")
		})
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

	let oldScroll: number = 0

	const headTitle = "Scripts - WaspScripts"
	const headDescription =
		"Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
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

<main class="flex h-full">
	<aside
		class="relative h-full variant-outline-surface flex text-sm overflow-x-visible overflow-y-auto
		{show ? 'w-fit' : ''} xl:text-base"
	>
		<div
			class="{show
				? 'block'
				: 'hidden xl:block'} w-screen xs:w-70 md:w-52 justify-center ml-2 sm:mx-2 md:mx-4 my-4 lg:my-auto"
		>
			{#each checkboxes as checkbox}
				<div class="flex">
					{#if !checkbox.main}
						<div class="w-4 h-2" />
					{/if}
					<div
						id={"checkboxdiv" + checkbox.id}
						class:font-thin={!checkbox.main}
						on:change={async () => await handleFilters()}
					>
						<input
							class="form-check-input rounded-sm transition duration-200 cursor-pointer accent-primary-500"
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
			class="px-1 lg:px-2 xl:hidden fill-white content-center justify-items-center justify-center h-full border-r border-surface-200-700-token"
			on:click={() => (show = !show)}
		>
			<ChevronsRight class="flex duration-100 {show ? 'rotate-180' : ''}" />
		</button>
	</aside>

	<main
		class="ml-2 overflow-y-scroll h-full w-full"
		on:scroll={(event) => {
			const scroll = event.currentTarget.scrollTop
			const previous = oldScroll
			oldScroll = scroll

			if (previous > scroll) {
				const parent = event.currentTarget.parentElement?.parentElement
				if (!parent || parent.scrollTop === 0) return
				parent.scrollBy({ top: -5, behavior: "smooth" })
			}
		}}
	>
		<header class="flex h-22 md:h-44 lg:h-64 grid-cols-12 my-4 justify-evenly">
			<!-- Button: Left -->
			<button
				type="button"
				class="btn-icon variant-outline-surface my-auto mx-1 sm:mx-4 p-2"
				on:click={carouselLeft}
			>
				<ArrowLeft />
			</button>

			<div
				bind:this={carousel}
				class="col-span-10 text-white snap-x snap-mandatory scroll-smooth flex overflow-x-auto hide-scrollbar"
			>
				{#each featured as feature}
					<a
						href="/scripts/{feature.url}"
						class="relative snap-center shrink-0 w-full text-center rounded-lg"
					>
						<CarouselEntry
							assets={feature?.protected?.assets}
							title={feature?.title}
							username={feature?.protected?.username}
						/>
					</a>
				{/each}
			</div>

			<!-- Button: Right -->
			<button
				type="button"
				class="shrink-0 btn-icon variant-outline-surface my-auto mx-1 sm:mx-4 p-2"
				on:click={carouselRight}
			>
				<ArrowRight />
			</button>
		</header>

		<main class="flex flex-col h-fit mx-4 lg:mx-auto">
			{#if roles?.scripter}
				<a href="/scripts/add" class="block mx-auto w-fit">
					<button class="btn variant-filled-secondary inline-block">Add Script</button>
				</a>
			{/if}
			<div class="mx-auto w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col my-12">
				<input
					placeholder="Search script id, name, categories, author,..."
					class="input"
					bind:value={search}
					on:input={async () => await replaceQuery($page.url, { page: "1", search: search })}
				/>
			</div>

			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 lg:gap-3 overflow-y-visible"
			>
				{#each scripts.scripts as script}
					<ScriptCard bind:script />
				{/each}
			</div>

			<Paginator
				bind:searchParams
				bind:pageIdx={currentPage}
				bind:amount
				bind:count
				amounts={[4, 8, 12, 24]}
			/>
		</main>
	</main>
</main>
