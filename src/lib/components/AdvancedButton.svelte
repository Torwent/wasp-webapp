<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import { slide } from "svelte/transition"
	import { getSignedURL } from "$lib/client/supabase"
	import { pad } from "$lib/client/utils"
	import { browser } from "$app/environment"
	import { ChevronDown, FileDown } from "lucide-svelte"
	import { page } from "$app/stores"

	export let id: string | null = null
	export let title: string
	export let rev: number = 0

	let revisions = Array.from({ length: rev }, (_, i) => i + 1).reverse()

	async function download() {
		if (!browser) return
		if (!id) return

		const url = await getSignedURL(
			$page.data.supabaseClient,
			"scripts",
			id + "/" + pad(rev, 9),
			"script.simba"
		)

		if (!url) return

		const response = await fetch(url)
		const blobObject = await response.blob()

		const blob = window.URL.createObjectURL(blobObject)
		const anchor = document.createElement("a")
		anchor.style.display = "none"
		anchor.href = blob
		anchor.download = title.toLowerCase().replace(/\s/g, "_") + ".simba"
		document.body.appendChild(anchor)
		anchor.click()
		window.URL.revokeObjectURL(blob)
		await fetch("/api/script/download", {
			body: JSON.stringify({ id: id }),
			method: "POST"
		}).catch((err) => console.error(err))
	}

	let popupSettings: PopupSettings = {
		event: "click",
		target: "revisionsDropDown"
	}
</script>

<div class="btn-group text-black fill-black">
	<button
		name={title}
		aria-label="Download {title} revision {rev}"
		class="variant-filled-primary hover:variant-filled-primary uppercase"
		on:click|preventDefault={download}
	>
		<FileDown />
		<span class="border-0">{title}</span>
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

{#if revisions.length > 0}
	<div
		class="z-10 bg-surface-800"
		data-popup="revisionsDropDown"
		in:slide={{ duration: 300 }}
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
{/if}
