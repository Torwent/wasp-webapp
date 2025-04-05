<script lang="ts">
	import { goto } from "$app/navigation"
	import type { Script } from "$lib/types/collection"
	import { cropString, encodeSEO, scriptCategories, scriptStatus, scriptTypes } from "$lib/utils"
	import { Tooltip } from "@skeletonlabs/skeleton-svelte"
	import { onMount } from "svelte"

	let { script, customCover, link }: { script: Script; customCover?: string; link?: string } =
		$props()

	let imgLink = $state(customCover ?? script?.protected.assets + "cover.jpg")

	$effect(() => {
		imgLink = customCover ?? script?.protected.assets + "cover.jpg"
	})

	$effect(() => {
		imgLink = script?.protected.assets + "cover.jpg"
	})

	onMount(async () => {
		if (imgLink !== "") {
			const response = await fetch(imgLink)
			if (response.status != 200) imgLink = "/cover.jpg"
		} else imgLink = "/cover.jpg"
	})

	const categoriesTooltip: boolean[] = $state(
		new Array(script?.metadata.categories.length).fill(false)
	)
	let status = $state(false)
	let type = $state(false)
</script>

<div
	class="card card-hover preset-filled-surface-200-800 hover:preset-outlined mx-auto flex h-fit w-fit flex-col shadow-sm"
	class:cursor-pointer={link}
>
	<button
		class="m-1"
		onclick={() => {
			if (link) goto(link)
		}}
	>
		<img src={imgLink} alt="Script cover" class="rounded-md contain-content" loading="lazy" />
	</button>
	<button
		class="mx-auto my-2 flex h-44 w-64 flex-col"
		onclick={() => {
			if (link) goto(link)
		}}
	>
		<header class="flex h-fit flex-col">
			<span class="text-primary-600 dark:text-primary-500 font-semibold whitespace-break-spaces">
				{script.title}
			</span>
			<span class="text-primary-600 dark:text-secondary-500 text-xs drop-shadow">
				by
				<a
					href="/scripters/{encodeSEO(script.protected.username.normalize('NFKC'))}"
					class="hover:preset-tonal-secondary"
				>
					{script.protected.username}
				</a>
				{#if !script.published}<small class="text-error-500">Unpublished</small>{/if}
			</span>
		</header>
		<article
			class="text-surface-600 dark:text-surface-300 my-4 h-full overflow-y-auto text-sm break-words"
		>
			{cropString(script.description, 80)}
		</article>
	</button>

	<footer class="m-2 flex cursor-default justify-between">
		<div class="flex">
			<Tooltip
				open={status}
				onOpenChange={(e) => (status = e.open)}
				positioning={{ placement: "top" }}
				triggerBase="cursor-default"
				contentBase="card preset-filled p-4"
				openDelay={200}
			>
				{#snippet trigger()}{scriptStatus[script.metadata.status].icon}{/snippet}
				{#snippet content()}{scriptStatus[script.metadata.status].name}{/snippet}
			</Tooltip>
			<Tooltip
				open={type}
				onOpenChange={(e) => (type = e.open)}
				positioning={{ placement: "top" }}
				triggerBase="cursor-default"
				contentBase="card preset-filled p-4"
				openDelay={200}
			>
				{#snippet trigger()}{scriptTypes[script.metadata.type].icon}{/snippet}
				{#snippet content()}{scriptTypes[script.metadata.type].name}{/snippet}
			</Tooltip>
		</div>
		<div class="flex">
			{#each script.metadata.categories as category, i (i)}
				<Tooltip
					open={categoriesTooltip[i]}
					onOpenChange={(e) => (categoriesTooltip[i] = e.open)}
					positioning={{ placement: "top" }}
					triggerBase="cursor-default"
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
