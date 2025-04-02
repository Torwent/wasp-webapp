<script lang="ts">
	import JsZip from "jszip"
	import { WaspProfile, canDownload, getSignedURL } from "$lib/client/supabase"
	import { pad } from "$lib/client/utils"
	import { FileArchive } from "svelte-lucide"
	import { page } from "$app/state"
	import { error } from "@sveltejs/kit"
	import { onMount } from "svelte"
	import type { ScriptMetaData, ScriptPublic } from "$lib/types/collection"

	const data = $props()
	const noDownload: boolean = $derived(data.noDownload ?? false)

	const { supabaseClient, profile, roles } = page.data

	const ALL_ZIPS = [
		"wasp-premium.zip",
		"wasp-free.zip",
		"wasp-all.zip",
		"community-premium.zip",
		"community-free.zip",
		"all-premium.zip",
		"all-free.zip",
		"all.zip"
	]

	const permissionsPromise = canDownload(supabaseClient, roles, data.id)
	let dismissed = $state(false)
	let zipName = $state("Loading...")
	let permited = $state(false)

	type ScriptResponse = ScriptPublic & {
		protected: { revision: number }
		metadata: ScriptMetaData
	}

	async function getScripts() {
		let { data, error: err } = await supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(
				`id, title, categories, protected!inner (revision), metadata!inner (status, type, categories)`
			)
			.order("title", { ascending: true })
			.eq("published", true)
			.eq("protected.broken", false)
			.overrideTypes<ScriptResponse[]>()

		if (err) {
			console.error(error)
			return []
		}

		if (!data) return []

		return data
	}

	const scripts = getScripts()

	let zipsAvailable: string[] = $state(["wasp-free.zip"])

	onMount(async () => {
		dismissed = await WaspProfile.getWarning(supabaseClient, profile?.id)
		permited = (await permissionsPromise) ? true : false
		zipName = permited ? "wasp-premium.zip" : "wasp-free.zip"

		if (dismissed) zipsAvailable = ["wasp-free.zip", "community-free.zip", "all-free.zip"]
		if (permited) zipsAvailable = ["wasp-premium.zip", "wasp-free.zip", "wasp-all.zip"]
		if (permited && dismissed) zipsAvailable = ALL_ZIPS
	})

	async function downloadFile(url: string) {
		const response = await fetch(url)
		return await response.blob()
	}

	async function downloadGroup(
		scripts: Awaited<ReturnType<typeof getScripts>>,
		urls: (string | false)[]
	) {
		let promises = []
		let fileNames = []
		for (let i = 0; i < urls.length; i++) {
			const url = urls[i]
			if (url) {
				promises.push(downloadFile(url))
				fileNames.push(scripts[i].title.toLowerCase().replaceAll(" ", "_") + ".simba")
			} else console.error("Failed to download " + scripts[i].title + ".")
		}

		return { blobs: await Promise.all(promises), fileNames }
	}

	async function exportZip(blobs: Blob[], fileNames: string[]) {
		const zip = JsZip()

		for (let i = 0; i < blobs.length; i++) {
			zip.file(fileNames[i], blobs[i])
		}

		const zipBlob = await zip.generateAsync({ type: "blob" })

		const { saveAs } = await import("file-saver")
		return saveAs(zipBlob, zipName)
	}

	async function downloadAndZip() {
		let awaitedScripts = await scripts

		awaitedScripts = awaitedScripts.filter((script) => {
			if (ALL_ZIPS[0] === zipName)
				return script.metadata.status === "official" && script.metadata.type === "premium"
			else if (ALL_ZIPS[1] === zipName)
				return script.metadata.status === "official" && script.metadata.type === "free"
			else if (ALL_ZIPS[2] === zipName) return script.metadata.status === "official"
			else if (ALL_ZIPS[3] === zipName)
				return script.metadata.status === "community" && script.metadata.type === "premium"
			else if (ALL_ZIPS[4] === zipName)
				return script.metadata.status === "community" && script.metadata.type === "free"
			else if (ALL_ZIPS[5] === zipName) return script.metadata.type === "premium"
			else if (ALL_ZIPS[6] === zipName) return script.metadata.type === "free"
			else return true
		})

		let urls: (string | false)[] = []
		let promises = []
		let scriptIds = []

		for (const script of awaitedScripts) {
			console.log(script.title)
			promises.push(
				new Promise<string | false>(async (resolve) => {
					if (!script.protected.revision) {
						error(500, "Failed to get script revision of script id: " + script.id)
					}

					const result = await getSignedURL(
						supabaseClient,
						"scripts",
						script.id + "/" + pad(script.protected.revision, 9),
						"script.simba"
					)
					resolve(result)
				})
			)
			scriptIds.push(script.id)
		}

		urls = await Promise.all(promises)

		const { blobs, fileNames } = await downloadGroup(awaitedScripts, urls)
		await fetch("/api/scripts", { body: JSON.stringify({ ids: scriptIds }), method: "POST" }).catch(
			(error) => console.error(error)
		)
		return await exportZip(blobs, fileNames)
	}

	async function download() {
		if (noDownload) return
		const start = performance.now()
		await downloadAndZip()
		console.log("Took ", performance.now() - start, "ms to download all files 🚀")
	}
</script>

<div class="flex">
	<button
		name={zipName}
		aria-label="Download zip"
		class="btn preset-filled-primary-500 hover:preset-tonal-primary h-full rounded-r-none uppercase"
		onclick={download}
	>
		<FileArchive />
		<span class="border-0">{zipName}</span>
	</button>
	<select
		name="revision"
		id="revision-select"
		class="select preset-filled-surface-500 hover:preset-tonal-surface rounded-l-none uppercase"
		bind:value={zipName}
	>
		{#each zipsAvailable as zip (zip)}
			<option value={zip} selected={zipName === zip}> {zip}</option>
		{/each}
	</select>
</div>
