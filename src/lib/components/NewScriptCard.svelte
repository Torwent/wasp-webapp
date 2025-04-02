<script lang="ts">
	import { page } from "$app/state"
	import type { ScriptMetaData, ScriptPublic } from "$lib/types/collection"
	import { cropString, encodeSEO, scriptCategories, scriptStatus, scriptTypes } from "$lib/utils"
	import { Tooltip } from "@skeletonlabs/skeleton-svelte"
	import { onMount } from "svelte"

	let {
		script,
		metadata,
		customCover = $bindable(undefined)
	}: { script: ScriptPublic; metadata: ScriptMetaData; customCover: string | undefined } = $props()

	let imgLink = $state(customCover ?? "/cover.jpg")
	const username = page.data.profile?.username ?? "USERNAME"

	$effect(() => {
		imgLink = customCover ?? "/cover.jpg"
	})

	onMount(async () => {
		if (imgLink !== "") {
			const response = await fetch(imgLink)
			if (response.status != 200) imgLink = "/cover.jpg"
		} else imgLink = "/cover.jpg"
	})

	const categoriesTooltip: boolean[] = $state(new Array(metadata.categories.length).fill(false))
	let status = $state(false)
	let type = $state(false)
</script>

<div
	class="card card-hover preset-filled-surface-200-800 hover:preset-outlined flex h-96 w-64 flex-col shadow-sm"
>
	<header class="m-1">
		<img src={imgLink} alt="Script cover" class="rounded-md contain-content" loading="lazy" />
	</header>
	<section class="m-2 flex h-full flex-col">
		<header class="flex h-fit flex-col">
			<span class="text-primary-600 dark:text-primary-500 font-semibold whitespace-break-spaces">
				{script.title}
			</span>
			<span class="text-primary-600 dark:text-secondary-500 text-xs drop-shadow">
				by
				<a
					href="/scripters/{encodeSEO(username.normalize('NFKC'))}"
					class="hover:preset-tonal-secondary"
				>
					{username}
				</a>
				{#if !script.published}<small class="text-error-500">Unpublished</small>{/if}
			</span>
		</header>
		<article
			class="text-surface-600 dark:text-surface-300 my-4 h-full overflow-y-auto text-sm break-words"
		>
			{cropString(script.description, 80)}
		</article>
	</section>

	<footer class="m-2 flex justify-between">
		<div class="flex">
			<Tooltip
				open={status}
				positioning={{ placement: "top" }}
				contentBase="card preset-filled p-4"
				openDelay={200}
			>
				{#snippet trigger()}{scriptStatus[metadata.status].icon}{/snippet}
				{#snippet content()}{scriptStatus[metadata.status].name}{/snippet}
			</Tooltip>
			<Tooltip
				open={type}
				positioning={{ placement: "top" }}
				contentBase="card preset-filled p-4"
				openDelay={200}
			>
				{#snippet trigger()}{scriptTypes[metadata.type].icon}{/snippet}
				{#snippet content()}{scriptTypes[metadata.type].name}{/snippet}
			</Tooltip>
		</div>
		<div class="flex">
			{#each metadata.categories as category, i (category)}
				<Tooltip
					open={categoriesTooltip[i]}
					positioning={{ placement: "top" }}
					contentBase="card preset-filled p-4"
					openDelay={200}
				>
					{#snippet trigger()}{scriptCategories[category].icon}{/snippet}
					{#snippet content()}{scriptCategories[category].name}{/snippet}
				</Tooltip>
			{/each}
		</div>
	</footer>
</div>
