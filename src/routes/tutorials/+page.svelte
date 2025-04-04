<script lang="ts">
	import { page } from "$app/state"
	import TutorialCard from "./TutorialCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { replaceQuery } from "$lib/client/utils"
	import Head from "$lib/components/Head.svelte"

	const { data } = $props()
	const { tutorials, count } = $derived(data)
	let { amount } = $state(data)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = $state(
		Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)
	)

	let search = $state(decodeURIComponent(page.url.searchParams.get("search") || "").trim())

	const parsedLevel = Number(page.url.searchParams.get("level") ?? "-1")
	let level = $state(parsedLevel > -1 && parsedLevel < 3 ? parsedLevel : -1)

	const levelColors = ["sky", "orange", "red"]
	const levelNames = ["Basic", "Intermidiate", "Advanced"]
</script>

<Head
	title="Tutorials"
	description="Guides and tutorials to bot and develop scripts for OldSchool RuneScape. Find the large collection of Simba tutorials available and unleach the power of Simba and max on osrs."
	keywords="Tutorial, Tutorials, Guide, Guides, Learn, Coding"
/>

<main class="mx-auto flex flex-col py-8">
	<header class="py-8 text-center">
		<h3>Welcome to the Tutorials section.</h3>
		<p>Here you can find guides and tutorials to learn how to bot!</p>
	</header>

	<div class="mx-auto my-16 flex flex-col">
		<h3 class="text-center">Useful resources</h3>

		<div class="my-4 flex flex-col gap-2 lg:flex-row">
			<a href="https://torwent.github.io/SRL-T/" class="mx-auto">
				<button class="btn ring-primary-500 preset-filled-primary-200-800 ring-2">
					SRL-T Documentation
				</button>
			</a>
			<a href="https://torwent.github.io/WaspLib/" class="mx-auto">
				<button class="btn ring-primary-500 preset-filled-primary-200-800 ring-2">
					WaspLib Documentation
				</button>
			</a>

			<a href="https://api.waspscripts.com/docs" class="mx-auto">
				<button class="btn ring-primary-500 preset-filled-primary-200-800 ring-2">
					Stats API Documentation
				</button>
			</a>

			<a href="https://map.waspscripts.com" class="mx-auto">
				<button class="btn ring-primary-500 preset-filled-primary-200-800 ring-2">
					Interactive Map
				</button>
			</a>
		</div>
	</div>

	<div class="my-4">
		<div class="form text-center">
			<h3 class="my-8">Filter by level or search the a blog post:</h3>
			<div class="mx-auto my-4 flex flex-col justify-center gap-2 md:flex-row">
				{#each levelNames as name, i (name)}
					<button
						class="mx-auto rounded-md p-2 text-xs font-bold text-white md:mx-0 bg-{levelColors[
							i
						]}-500 border-{levelColors[i]}-500"
						class:border-r-8={level === i}
						class:pr-6={level === i}
						onclick={async () => {
							level = level === i ? -1 : i
							await replaceQuery(page.url, {
								page: "1",
								level: level.toString()
							})
						}}
					>
						{name} tutorial
					</button>
				{/each}
			</div>

			<div class="mx-auto mb-2 max-w-2xl justify-center md:flex md:space-x-5">
				<div class="mb-2 flex w-full flex-col text-sm">
					<input
						type="text"
						placeholder="🔍Search tutorial by name, level, author, co-authors, content, ..."
						class="input"
						bind:value={search}
						oninput={async () =>
							await replaceQuery(page.url, {
								page: "1",
								search: search
							})}
					/>
				</div>
			</div>
		</div>
		<div class="my-8 grid place-items-center">
			<a
				href="https://github.com/Torwent/wasp-info/new/main/tutorials"
				class="btn ring-secondary-500 preset-filled-secondary-200-800 ring-2"
			>
				Add a tutorial through GitHub!
			</a>
		</div>
	</div>

	<div class="mx-auto">
		{#each tutorials as tutorial (tutorial)}
			<TutorialCard {tutorial} />
		{/each}
	</div>

	<Paginator data={tutorials} {currentPage} bind:pageSize={amount} {count} />
</main>
