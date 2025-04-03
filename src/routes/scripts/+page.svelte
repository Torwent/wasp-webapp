<script lang="ts">
	import { page } from "$app/state"
	import { replaceQuery } from "$lib/client/utils"
	import { scriptCategories, scriptStatus, scriptTypes } from "$lib/utils"
	import { onMount } from "svelte"
	import { ArrowRight } from "svelte-lucide"
	import CarouselEntry from "./CarouselEntry.svelte"
	import { goto, invalidate } from "$app/navigation"
	import ScriptCard from "$lib/components/ScriptCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import Head from "$lib/components/Head.svelte"

	const { data } = $props()
	const { scripts, featured, roles } = $derived(data)

	let { amount } = $state(data)
	const { count } = $derived(data)

	const pageStr = $derived(page.url.searchParams.get("page") || "-1")
	const currentPage = $derived(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())
	let statusFilter = $state(page.url.searchParams.get("status") ?? "")
	let typeFilter = $state(page.url.searchParams.get("type") ?? "")

	let categoriesStr = page.url.searchParams.get("categories")
	let categoriesFilter = $state(categoriesStr ? decodeURIComponent(categoriesStr).split("-") : [])

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

	const categories = Object.values(scriptCategories)
	const categoriesCheckboxes: boolean[] = $state(new Array(categories.length).fill(false))

	async function handleFilter(key: string, value: string) {
		if (value == "") page.url.searchParams.delete(key)
		else page.url.searchParams.set(key, value)
		page.url.searchParams.delete("page")
		await goto(page.url, { noScroll: true, keepFocus: true })
		invalidate("wasp:scripts")
	}
</script>

<Head
	title="Scripts"
	description="The best open source OSRS botting scripts."
	keywords="Premium, Free, Automation, ComputerVision"
/>

<header class="my-4 flex h-full grid-cols-12 justify-evenly">
	<!-- Button: Left -->
	<button type="button" class="btn-icon hover:preset-tonal ml-4 h-auto" onclick={carouselLeft}>
		<ArrowRight class="rotate-180" />
	</button>

	<div
		bind:this={carousel}
		class="hide-scrollbar col-span-10 flex snap-x snap-mandatory overflow-x-auto scroll-smooth text-white"
	>
		{#each featured as feature (feature.id)}
			<a
				href="/scripts/{feature.url}"
				class="relative w-full shrink-0 snap-center rounded-lg text-center"
			>
				<CarouselEntry
					assets={feature.protected.assets}
					title={feature.title}
					username={feature.protected.username}
				/>
			</a>
		{/each}
	</div>

	<!-- Button: Right -->
	<button type="button" class="btn-icon hover:preset-tonal mr-4 h-auto" onclick={carouselRight}>
		<ArrowRight />
	</button>
</header>

<div class="flex h-full w-full">
	<aside class="mx-2 my-4 hidden h-full lg:block lg:text-sm xl:text-base">
		<label class="label my-4">
			<span class="label-text">Status:</span>
			<select
				name="status"
				id="script-status"
				class="select w-full"
				bind:value={statusFilter}
				onchange={() => handleFilter("status", statusFilter)}
			>
				<option value="" selected={statusFilter == null || statusFilter == ""}>🎮All</option>
				{#each Object.values(scriptStatus) as status (status.value)}
					<option value={status.value} selected={status.value == statusFilter}>
						{status.icon}{status.name}
					</option>
				{/each}
			</select>
		</label>

		<label class="label my-4">
			<span class="label-text">Type:</span>
			<select
				name="type"
				id="script-type"
				class="select w-full"
				bind:value={typeFilter}
				onchange={() => handleFilter("type", typeFilter)}
			>
				<option
					value=""
					selected={typeFilter == null || typeFilter == ""}
					class="selection:bg-primary-500">🕹️All</option
				>
				{#each Object.values(scriptTypes) as type (type.value)}
					<option value={type.value} selected={type.value == typeFilter}>
						{type.icon}{type.name}
					</option>
				{/each}
			</select>
		</label>

		<div class="label my-4 h-auto">
			<span class="label-text">Categories</span>
			<div class="select flex h-auto w-auto flex-col gap-1 overflow-y-scroll p-3">
				{#each categories as category, idx (category.value)}
					<label class="flex gap-1 xl:gap-2">
						<input
							type="checkbox"
							id={category.value}
							name={category.name}
							bind:checked={categoriesCheckboxes[idx]}
							class="checkbox my-auto"
							onchange={() => {
								const i = categoriesFilter.indexOf(category.value)
								if (i === -1) categoriesFilter.push(category.value)
								else categoriesFilter.splice(i, 1)
								handleFilter("categories", categoriesFilter.join("-"))
							}}
						/>
						<span class="my-auto whitespace-nowrap select-none xl:text-lg">
							{category.icon}
							{category.name}
						</span>
					</label>
				{/each}
			</div>
		</div>
	</aside>

	<main class="h-full w-full">
		{#if roles?.scripter}
			<a href="/scripts/add" class="mx-auto my-4 block w-fit">
				<button class="btn preset-filled-secondary-500">Add Script</button>
			</a>
		{/if}

		<div class="mx-4 my-4 h-full lg:hidden">
			<label class="label my-4">
				<span class="label-text">Status:</span>
				<select
					name="status"
					id="script-status"
					class="select w-full"
					bind:value={statusFilter}
					onchange={() => handleFilter("status", statusFilter)}
				>
					<option value="" selected={statusFilter == null || statusFilter == ""}>🎮All</option>
					{#each Object.values(scriptStatus) as status (status.value)}
						<option value={status.value} selected={status.value == statusFilter}>
							{status.icon}{status.name}
						</option>
					{/each}
				</select>
			</label>

			<label class="label my-4">
				<span class="label-text">Type:</span>
				<select
					name="type"
					id="script-type"
					class="select w-full"
					bind:value={typeFilter}
					onchange={() => handleFilter("type", typeFilter)}
				>
					<option
						value=""
						selected={typeFilter == null || typeFilter == ""}
						class="selection:bg-primary-500">🕹️All</option
					>
					{#each Object.values(scriptTypes) as type (type.value)}
						<option value={type.value} selected={type.value == typeFilter}>
							{type.icon}{type.name}
						</option>
					{/each}
				</select>
			</label>

			<label class="label">
				<span class="label-text">Categories</span>
				<select
					class="select"
					bind:value={categoriesFilter}
					onchange={() => handleFilter("categories", categoriesFilter.join("-"))}
					multiple
				>
					{#each categories as category (category.value)}
						<option value={category.value}>
							{category.icon}
							{category.name}
						</option>
					{/each}
				</select>
			</label>
		</div>

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
	</main>
</div>
