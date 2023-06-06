<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import { slide } from "svelte/transition"
	import { getSignedURL } from "$lib/backend/data"
	import { pad } from "$lib/utils"
	import type { Script } from "$lib/backend/types"
	import { browser } from "$app/environment"
	import { ChevronDown, FileDown } from "lucide-svelte"

	export let script: Script
	export let rev = script.scripts_protected.revision

	const revisions = Array.from({ length: rev }, (_, i) => i + 1).reverse()

	function download() {
		getSignedURL("scripts", script.id + "/" + pad(rev, 9), "script.simba").then((url) => {
			if (!url || !browser) return

			fetch(url)
				.then((resp) => resp.blob())
				.then((blobobject) => {
					const blob = window.URL.createObjectURL(blobobject)
					const anchor = document.createElement("a")
					anchor.style.display = "none"
					anchor.href = blob
					anchor.download = script.title.toLowerCase().replace(/\s/g, "_") + ".simba"
					document.body.appendChild(anchor)
					anchor.click()
					window.URL.revokeObjectURL(blob)
				})
				.catch(() => console.log("An error occured while downloading the file, sorry!"))
		})
	}

	let popupSettings: PopupSettings = {
		event: "click",
		target: "revisionsDropDown"
	}
</script>

<div class="btn-group text-black fill-black">
	<button
		class="variant-filled-primary hover:variant-filled-primary uppercase"
		on:click|preventDefault={download}
	>
		<FileDown />
		<span class="border-0">{script.title}</span>
	</button>
	<button
		class="variant-filled-secondary hover:variant-filled-secondary uppercase"
		use:popup={popupSettings}
	>
		<span class="flex">rev. {rev}<ChevronDown class="ml-2" /></span>
	</button>
</div>

<div
	class="bg-surface-800"
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
