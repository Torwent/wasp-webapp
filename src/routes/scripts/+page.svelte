<script lang="ts">
	import { fade, slide } from "svelte/transition"
	import ScriptCard from "./ScriptCard.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import { AppShell } from "@skeletonlabs/skeleton"
	import type { CheckboxType } from "$lib/backend/types"
	import { ChevronRight } from "lucide-svelte"
	import { page } from "$app/stores"
	import { invalidate } from "$app/navigation"
	import { browser } from "$app/environment"

	export let data

	const { checkboxes } = data

	const pageStr = $page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 1 : Number(pageStr)

	let search: string
	let ascending = $page.url.searchParams.get("ascending")?.toLowerCase() === "true"
	let show = false

	function handleFilters() {
		let filters = checkboxes
			.filter((checkbox: CheckboxType) => checkbox.checked)
			.map((checkbox: CheckboxType) => checkbox.name)
	}

	function replaceQuery(values: Record<string, string>) {
		const currentURL = window.location.toString()

		const url = new URL(currentURL)
		for (let [k, v] of Object.entries(values)) {
			if (!!v && v !== "") url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v))
			else url.searchParams.delete(k)
		}
		history.replaceState({}, "", url)
		invalidate("scripts:list")
	}

	$: if (browser) replaceQuery({ page: currentPage.toString() })
	$: if (browser) replaceQuery({ search: search })
</script>

<svelte:head>
	<MetaTags
		title="Scripts"
		description="Large script collection to bot OldSchool RuneScape with Simba, SRL and WaspLib. Get that 99 on osrs today!"
	/>
</svelte:head>

<AppShell>
	<svelte:fragment slot="sidebarLeft">
		<div
			class="flex h-screen border-r dark:border-stone-800 sticky bottom-0 min-h-full overflow-y-scroll
				   no-scrollbar font-semibold text-sm"
			in:slide={{ duration: 600, delay: 600, axis: "x" }}
			out:slide={{ duration: 300, axis: "x" }}
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

	<main
		class="container mt-8 mx-auto flex-grow w-[95%] max-h-screen overflow-y-visible hide-scrollbar"
		in:fade={{ duration: 300, delay: 300 }}
		out:fade={{ duration: 300 }}
	>
		<div>
			{#if data.profile && data.profile.profiles_protected.developer}
				<a href="/scripts/add" class="block mx-auto w-fit">
					<button class="btn variant-filled-secondary inline-block">Add Script</button>
				</a>
			{/if}
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
				{#if data.scripts}
					{#each data.scripts as script}
						{#if script.published || (data.profile && script.scripts_protected.author_id === data.profile.id)}
							<ScriptCard {script} />
						{/if}
					{/each}
				{:else}
					{#each Array(10) as _i}
						<div class="card w-[300px]">
							<header class="group h-[200px] p-0">
								<div class="placeholder h-full" />
							</header>
							<section class="p-4">
								<header class="h-6"><div class="placeholder w-full h-full m-0" /></header>
								<article class="h-20 mt-4">
									<div class="placeholder w-full h-full m-0" />
								</article>
							</section>
							<footer class="card-footer flex h-8 w-full justify-end">
								{#each Array(10) as i}
									<div class="placeholder-circle w-4 mx-1" />
								{/each}
							</footer>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</main>
</AppShell>
