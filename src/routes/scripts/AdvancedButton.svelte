<script lang="ts">
	import { getSignedURL } from "$lib/client/supabase"
	import { pad } from "$lib/client/utils"
	import { browser } from "$app/environment"
	import { FileDown } from "svelte-lucide"
	import { page } from "$app/state"

	const data = $props()
	const id: string | null = $derived(data.id)
	const title: string = $derived(data.title)
	let rev: number = $state(data.rev ?? 0)

	const revisions = Array.from({ length: data.rev }, (_, i) => i + 1).reverse()

	async function download() {
		if (!browser) return
		if (!id) return

		const url = await getSignedURL(
			page.data.supabaseClient,
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
</script>

<div class="flex">
	<button
		name={title}
		aria-label="Download {title} revision {rev}"
		class="btn h-full rounded-r-none uppercase preset-filled-primary-500 hover:preset-tonal-primary"
		onclick={download}
	>
		<FileDown />
		<span class="border-0">{title}</span>
	</button>
	<select
		name="revision"
		id="revision-select"
		class="select rounded-l-none uppercase preset-filled-surface-500 hover:preset-tonal-surface"
		bind:value={rev}
	>
		{#each revisions as r}
			<option value={r} selected={rev === r}> Revision {r}</option>
		{/each}
	</select>
</div>
