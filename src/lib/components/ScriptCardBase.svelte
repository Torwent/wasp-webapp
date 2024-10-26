<script lang="ts">
	import { popup } from "@skeletonlabs/skeleton"
	import type { PopupSettings } from "@skeletonlabs/skeleton"
	import { cropString, encodeSEO } from "$lib/utils"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import type { ScriptBase } from "$lib/types/collection"

	export let script: ScriptBase | null = null
	export let imgElement: HTMLImageElement | undefined = browser ? new Image() : undefined

	const defaultCover = "/cover.jpg"

	const getPopup = (target: string): PopupSettings => {
		return {
			event: "hover",
			target: target,
			placement: "top"
		}
	}

	function getCover(path: string | undefined) {
		if (!path) return ""
		if (path.endsWith(".jpg")) return path
		return path + "cover.jpg"
	}

	let imgLink: string = getCover(script?.protected.assets)
	$: imgLink = getCover(script?.protected.assets)

	onMount(async () => {
		if (imgLink !== "") {
			const response = await fetch(imgLink)
			if (response.status != 200) imgLink = defaultCover
		} else imgLink = defaultCover
	})
</script>

{#if script}
	<div class="card w-64 h-96 shadow-sm card-hover flex flex-col justify-between">
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
			<section class="flex flex-col mx-3">
				<header class="flex flex-col h-fit">
					<span
						class="font-semibold text-primary-600 dark:text-primary-500 whitespace-break-spaces"
					>
						{script.title}
					</span>
					<span class="text-xs text-primary-600 dark:text-secondary-500 drop-shadow">
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
					class="h-full my-4 dark:text-surface-300 text-surface-600 text-sm break-words overflow-y-auto"
				>
					{cropString(script.description, 80)}
				</article>
			</section>
		</div>
		<footer class="card-footer flex h-8 w-full justify-end">
			{#each script.tooltip_emojis as emoji, i}
				<button use:popup={getPopup(script.url + "-hover-" + i.toString())}>
					{emoji}
				</button>
				<div
					class="card variant-filled-secondary p-2"
					data-popup={script.url + "-hover-" + i.toString()}
				>
					{script.tooltip_names[i]}
					<div class="arrow variant-filled-secondary" />
				</div>
			{/each}
		</footer>
	</div>
{:else}
	<div class="card w-64 h-96 shadow-sm card-hover flex flex-col justify-between">
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
			<section class="flex flex-col mx-3">
				<header class="flex flex-col h-fit">
					<span
						class="font-semibold text-primary-600 dark:text-primary-500 whitespace-break-spaces"
					>
						Loading...
					</span>
					<span class="text-xs text-primary-600 dark:text-secondary-500 drop-shadow">
						by Loading...
					</span>
				</header>
				<article
					class="h-full my-4 dark:text-surface-300 text-surface-600 text-sm break-words overflow-y-auto"
				>
					Loading...
				</article>
			</section>
		</div>
		<footer class="card-footer flex h-8 w-full justify-end" />
	</div>
{/if}
