<script lang="ts">
	import { Tooltip } from "@skeletonlabs/skeleton-svelte"
	import { cropString, encodeSEO } from "$lib/utils"
	import { onMount } from "svelte"

	let { script, imgElement = undefined } = $props()

	const tooltipStates = $state(new Array(script.tooltip_emojis.length).fill(false))
	const defaultCover = "/cover.jpg"

	function getCover(path: string | undefined) {
		if (!path) return ""
		if (path.endsWith(".jpg")) return path
		return path + "cover.jpg"
	}

	let imgLink = $state(getCover(script?.protected.assets))

	onMount(async () => {
		if (imgLink !== "") {
			const response = await fetch(imgLink)
			if (response.status != 200) imgLink = defaultCover
		} else imgLink = defaultCover
	})
</script>

{#if script}
	<div
		class="card card-hover flex h-96 w-64 flex-col justify-between shadow-sm preset-filled-surface-200-800"
	>
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
		</div>
		<footer class="card-footer flex h-8 w-full justify-end">
			{#each script.tooltip_emojis as emoji, i}
				<Tooltip
					bind:open={tooltipStates[i]}
					positioning={{ placement: "top" }}
					triggerBase="underline"
					contentBase="card preset-filled p-4"
					openDelay={200}
				>
					{#snippet trigger()}{emoji}{/snippet}
					{#snippet content()}{script.tooltip_names[i]}{/snippet}
				</Tooltip>
			{/each}
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
