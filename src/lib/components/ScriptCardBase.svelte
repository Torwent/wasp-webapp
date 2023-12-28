<script lang="ts">
	import { popup } from "@skeletonlabs/skeleton"
	import type { PopupSettings } from "@skeletonlabs/skeleton"
	import { cropString, encodeSEO } from "$lib/utils"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	import type { Script } from "$lib/types/collection"

	export let script: Script
	export let imgElement: HTMLImageElement | undefined = browser ? new Image() : undefined

	const defaultCover =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/default/cover.jpg"

	const getPopup = (target: string): PopupSettings => {
		return {
			event: "hover",
			target: target,
			placement: "top"
		}
	}

	function getCover(path: string) {
		if (path.endsWith(".jpg")) return path
		return path + "cover.jpg"
	}

	let imgLink: string = getCover(script.protected.assets)
	$: imgLink = getCover(script.protected.assets)
	$: script = script

	onMount(async () => {
		const response = await fetch(imgLink)
		if (response.status != 200) imgLink = defaultCover
	})
</script>

<div class="card w-[300px] shadow-sm card-hover">
	<header class="group h-[200px] p-0">
		<img bind:this={imgElement} src={imgLink} alt="Script cover" class="rounded-t" loading="lazy" />
	</header>
	<section class="p-4">
		<header class="h-12">
			<h5 class="font-semibold text-primary-600 dark:text-primary-500 whitespace-nowrap">
				{script.title}
			</h5>
			<span class="text-xs whitespace-nowrap text-primary-600 dark:text-secondary-500 drop-shadow">
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
		<article class="h-20 mt-4 dark:text-surface-300 text-surface-600 text-sm break-words">
			{cropString(script.description, 80)}
		</article>
	</section>
	<footer class="card-footer flex h-8 w-full justify-end">
		{#each script.tooltip_emojis as emoji, i}
			<button use:popup={getPopup(script.id + "-hover-" + i.toString())}>
				{emoji}
			</button>
			<div
				class="card variant-filled-secondary p-2"
				data-popup={script.id + "-hover-" + i.toString()}
			>
				{script.tooltip_names[i]}
				<div class="arrow variant-filled-secondary" />
			</div>
		{/each}
	</footer>
</div>
