<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import { slide } from "svelte/transition"
	import { getSignedURL } from "$lib/backend/data"
	import { pad } from "$lib/utils"

	import { browser } from "$app/environment"
	import { ChevronDown, FileDown } from "lucide-svelte"
	import { page } from "$app/stores"
	import type { ScriptPublic } from "$lib/types/collection"

	export let script: ScriptPublic
	export let rev: number
	export let noDownload: boolean = false

	const revisions = Array.from({ length: rev }, (_, i) => i + 1).reverse()

	async function download() {
		if (noDownload) return
		const url = await getSignedURL(
			$page.data.supabaseClient,
			"scripts",
			script.id + "/" + pad(rev, 9),
			"script.simba"
		)
		if (!url || !browser) return

		const response = await fetch(url)
		const blobObject = await response.blob()

		const blob = window.URL.createObjectURL(blobObject)
		const anchor = document.createElement("a")
		anchor.style.display = "none"
		anchor.href = blob
		anchor.download = script.title.toLowerCase().replace(/\s/g, "_") + ".simba"
		document.body.appendChild(anchor)
		anchor.click()
		window.URL.revokeObjectURL(blob)
	}

	let popupSettings: PopupSettings = {
		event: "click",
		target: "revisionsDropDown"
	}
</script>

<div class="btn-group text-black fill-black">
	<button
		name={script.title}
		aria-label="Download {script.title} revision {rev}"
		class="variant-filled-primary hover:variant-filled-primary uppercase"
		on:click|preventDefault={download}
	>
		<FileDown />
		<span class="border-0">{script.title}</span>
	</button>
	<button
		name="Revisions"
		aria-label="Open the revisions list"
		class="variant-filled-secondary hover:variant-filled-secondary uppercase"
		use:popup={popupSettings}
	>
		<span class="flex">rev. {rev}<ChevronDown class="ml-2" /></span>
	</button>
</div>

<div
	class="z-10 bg-surface-800"
	data-popup="revisionsDropDown"
	in:slide={{ duration: 700 }}
	out:slide={{ duration: 300 }}
>
	<div class="arrow bg-surface-800" />
	<ul class="overflow-y-auto max-h-48 py-1 text-sm mt-2">
		{#each revisions as r}
			<li
				class="block py-2 px-4 hover:bg-primary-100 dark:hover:bg-primary-300 dark:hover:text-surface-900"
			>
				<button on:click={() => (rev = r)}>
					Revision {r}
				</button>
			</li>
		{/each}
	</ul>
</div>
