<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import { slide } from "svelte/transition"
	import { ChevronDown } from "lucide-svelte"

	export let index: number
	export let total: number

	const versions = Array.from({ length: total }, (_, i) => i + 1).reverse()

	let popupSettings: PopupSettings = {
		event: "click",
		target: "versionsDropDown"
	}
</script>

<button
	name="Versions"
	aria-label="Open the versions list"
	class="btn variant-filled-secondary hover:variant-filled-secondary uppercase"
	use:popup={popupSettings}
>
	<span class="flex">Version {versions[index]}<ChevronDown class="ml-2" /></span>
</button>

<div
	class="z-10 bg-surface-300 dark:bg-surface-700 rounded-md"
	data-popup="versionsDropDown"
	in:slide={{ duration: 300 }}
	out:slide={{ duration: 300 }}
>
	<ul class="overflow-y-auto max-h-48 text-sm mt-2 rounded-md">
		{#each versions as r, i}
			<li class="py-2 px-4 hover:bg-primary-500">
				<button on:click={() => (index = i)}>
					Version {r}
				</button>
			</li>
		{/each}
	</ul>
</div>
