<script lang="ts">
	import { ArrowLeft, ArrowRight, ChevronsRight } from "svelte-lucide"
	import { page } from "$app/state"
	import Paginator from "$lib/components/Paginator.svelte"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import { onMount } from "svelte"
	import { replaceQuery } from "$lib/client/utils"
	import type { CheckboxType } from "$lib/types/collection"
	import CarouselEntry from "./CarouselEntry.svelte"

	const { data } = $props()
	const { checkboxes, featured, roles, scripts } = $derived(data)

	let { amount } = $state(data)

	const count = $derived(scripts.count)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())

	let categories: string[] = []
	let subcategories: string[] = []
	let show = $state(false)

	async function handleFilters() {
		categories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)

		subcategories = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked && !checkbox.main)
			.map((checkbox: CheckboxType) => checkbox.name)

		await replaceQuery(page.url, {
			page: "1",
			categories: categories.toString().replaceAll(",", "-")
		})
		await replaceQuery(page.url, {
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
	<meta property="og:url" content={page.url.href} />
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

<main class="flex">
	<aside
		class="preset-outlined-surface-500 flex text-sm outline
		{show ? 'w-fit' : ''} xl:text-base"
	>
		<div
			class="{show
				? 'block'
				: 'hidden xl:block'} xs:w-70 my-4 ml-2 w-screen justify-center sm:mx-2 md:mx-4 md:w-52 lg:my-auto"
		>
			{#each checkboxes as checkbox}
				<div class="flex">
					{#if !checkbox.main}
						<div class="h-2 w-4"></div>
					{/if}
					<div
						id={"checkboxdiv" + checkbox.id}
						class:font-thin={!checkbox.main}
						onchange={async () => await handleFilters()}
					>
						<input
							class="form-check-input accent-primary-500 cursor-pointer rounded-sm transition duration-200"
							type="checkbox"
							id={"checkbox" + checkbox.id}
							bind:checked={checkbox.checked}
						/>
						<label
							class="form-check-label hover:text-primary-200 inline-block cursor-pointer"
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
			class="border-surface-200-700-token h-full content-center justify-center justify-items-center border-r fill-white px-1 lg:px-2 xl:hidden"
			onclick={() => (show = !show)}
		>
			<ChevronsRight class="flex duration-100 {show ? 'rotate-180' : ''}" />
		</button>
	</aside>

	<main>
		<header class="my-4 flex h-22 grid-cols-12 justify-evenly md:h-44 lg:h-64">
			<!-- Button: Left -->
			<button
				type="button"
				class="btn-icon preset-outlined-surface-500 mx-1 my-auto p-2 sm:mx-4"
				onclick={carouselLeft}
			>
				<ArrowLeft />
			</button>

			<div
				bind:this={carousel}
				class="hide-scrollbar col-span-10 flex snap-x snap-mandatory overflow-x-auto scroll-smooth text-white"
			>
				{#each featured as feature}
					<a
						href="/scripts/{feature.url}"
						class="relative w-full shrink-0 snap-center rounded-lg text-center"
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
				class="btn-icon preset-outlined-surface-500 mx-1 my-auto shrink-0 p-2 sm:mx-4"
				onclick={carouselRight}
			>
				<ArrowRight />
			</button>
		</header>

		<main class="mx-4 flex h-fit flex-col lg:mx-auto">
			{#if roles?.scripter}
				<a href="/scripts/add" class="mx-auto block w-fit">
					<button class="btn preset-filled-secondary-500 inline-block">Add Script</button>
				</a>
			{/if}
			<div class="mx-auto my-12 flex w-[80%] flex-col lg:w-[70%] xl:w-[60%]">
				<input
					placeholder="Search script id, name, categories, author,..."
					class="input"
					bind:value={search}
					oninput={async () => await replaceQuery(page.url, { page: "1", search: search })}
				/>
			</div>

			<div class="mx-8 grid">
				{#each scripts.scripts as script}
					<ScriptCard {script} />
				{/each}
			</div>

			<Paginator data={scripts.scripts} {currentPage} bind:pageSize={amount} {count} />
		</main>
	</main>
</main>
