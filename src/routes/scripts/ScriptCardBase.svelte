<script lang="ts">
	import { popup } from "@skeletonlabs/skeleton"
	import type { PopupSettings } from "@skeletonlabs/skeleton"
	import type { IScriptCard } from "$lib/backend/types"
	import { cropString } from "$lib/utils"
	import { onMount } from "svelte"
	import { browser } from "$app/environment"
	export let script: IScriptCard

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

	let imgLink: string = getCover(script.scripts_protected.assets_path)
	$: imgLink = getCover(script.scripts_protected.assets_path)

	onMount(async () => {
		const response = await fetch(imgLink)
		if (response.status != 200) imgLink = defaultCover
	})
</script>

<div
	class="card w-[300px] shadow-sm hover:shadow-md hover:shadow-black/20 hover:-translate-y-2 duration-300"
>
	<header class="group h-[200px] p-0">
		<img
			bind:this={imgElement}
			src={imgLink}
			alt={script.scripts_protected.assets_alt}
			class="rounded-t"
		/>
	</header>
	<section class="p-4">
		<header class="h-12">
			<h5 class="font-semibold text-primary-700 dark:text-primary-500 whitespace-nowrap">
				{script.title}
			</h5>
			<span class="dark:text-surface-200 text-surface-600 text-xs whitespace-nowrap">
				by {script.scripts_protected.author}
				{#if !script.published}<small class="text-secondary-500">Hidden</small>{/if}
			</span>
		</header>
		<article class="h-20 mt-4 dark:text-surface-300 text-surface-600 text-sm break-all">
			{cropString(script.description, 80)}
		</article>
	</section>
	<footer class="card-footer flex h-8 w-full justify-end">
		{#if script.emojiTooltips != null}
			{#each script.emojiTooltips as tooltip, i}
				<button use:popup={getPopup(script.id + "-hover-" + i.toString())}>
					{tooltip.icon}
				</button>
				<div
					class="card variant-filled-secondary p-2"
					data-popup={script.id + "-hover-" + i.toString()}
				>
					{tooltip.tooltip}
					<div class="arrow variant-filled-secondary" />
				</div>
			{/each}
		{:else}
			{#each Array(10) as _i}
				<div class="placeholder-circle w-4 mx-1" />
			{/each}
		{/if}
	</footer>
</div>
