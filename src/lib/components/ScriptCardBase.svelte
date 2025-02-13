<script lang="ts">
	import type { Script } from "$lib/types/collection"
	import { cropString, encodeSEO, scriptCategories, scriptStatus, scriptTypes } from "$lib/utils"
	import { Tooltip } from "@skeletonlabs/skeleton-svelte"
	import { onMount } from "svelte"

	let data = $props()
	let script: Script | null = $derived(data.script)
	let imgElement: HTMLImageElement | undefined = $state(data.imgElement ?? undefined)

	let imgLink = $state(data.script?.protected.assets + "cover.jpg")

	$effect(() => {
		imgLink = data.script?.protected.assets + "cover.jpg"
	})

	onMount(async () => {
		if (imgLink !== "") {
			const response = await fetch(imgLink)
			if (response.status != 200) imgLink = "/cover.jpg"
		} else imgLink = "/cover.jpg"

		imgElement?.src
	})

	const categoriesTooltip: boolean[] = $state(
		new Array(data.script?.metadata.categories.length).fill(false)
	)
	let status = $state(false)
	let type = $state(false)
</script>

{#if script}
	<div
		class="card card-hover flex h-96 w-64 flex-col shadow-sm preset-filled-surface-200-800 hover:preset-outlined"
	>
		<header class="m-1">
			<img
				bind:this={imgElement}
				src={imgLink}
				alt="Script cover"
				class="rounded-md contain-content"
				loading="lazy"
			/>
		</header>
		<section class="m-2 flex h-full flex-col">
			<header class="flex h-fit flex-col">
				<span class="whitespace-break-spaces font-semibold text-primary-600 dark:text-primary-500">
					{script.title}
				</span>
				<span class="text-xs text-primary-600 drop-shadow dark:text-secondary-500">
					by
					<a
						href="/scripters/{encodeSEO(script.protected.username.normalize('NFKC'))}"
						class="permalink"
					>
						{script.protected.username}
					</a>
					{#if !script.published}<small class="text-error-500">Unpublished</small>{/if}
				</span>
			</header>
			<article
				class="my-4 h-full overflow-y-auto break-words text-sm text-surface-600 dark:text-surface-300"
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
					{#snippet trigger()}{scriptStatus[script.metadata.status].icon}{/snippet}
					{#snippet content()}{scriptStatus[script.metadata.status].name}{/snippet}
				</Tooltip>
				<Tooltip
					open={type}
					positioning={{ placement: "top" }}
					contentBase="card preset-filled p-4"
					openDelay={200}
				>
					{#snippet trigger()}{scriptTypes[script.metadata.type].icon}{/snippet}
					{#snippet content()}{scriptTypes[script.metadata.type].name}{/snippet}
				</Tooltip>
			</div>
			<div class="flex">
				{#each script.metadata.categories as category, i}
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
{:else}
	<div class="card card-hover flex h-96 w-64 flex-col justify-between shadow-sm">
		<div>
			<header class="h-48 p-0">
				<img
					bind:this={imgElement}
					src={imgLink}
					alt="Script cover"
					class="rounded-t"
					loading="lazy"
				/>
			</header>
			<section class="mx-3 flex flex-col">
				<header class="flex h-fit flex-col">
					<span
						class="whitespace-break-spaces font-semibold text-primary-600 dark:text-primary-500"
					>
						Loading...
					</span>
					<span class="text-xs text-primary-600 drop-shadow dark:text-secondary-500">
						by Loading...
					</span>
				</header>
				<article
					class="my-4 h-full overflow-y-auto break-words text-sm text-surface-600 dark:text-surface-300"
				>
					Loading...
				</article>
			</section>
		</div>
		<footer class="card-footer flex h-8 w-full justify-end"></footer>
	</div>
{/if}
