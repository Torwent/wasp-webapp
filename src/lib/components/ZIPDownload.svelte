<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import JsZip from "jszip"
	import { saveAs } from "file-saver"
	import { canDownload, getScripts, getSignedURL } from "$lib/backend/data"
	import type { Profile } from "$lib/types/collection"
	import { pad } from "$lib/utils"
	import { slide } from "svelte/transition"
	import { ChevronDown, FileArchive } from "lucide-svelte"
	import { page } from "$app/stores"
	import type { Script } from "$lib/types/collection"

	export let profile: Profile
	export let noDownload: boolean = false

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

	$: isPremium = canDownload(profile)
	$: dismissed = profile.private.warning
	$: zipName = isPremium ? "wasp-premium.zip" : "wasp-free.zip"

	function availableZIPs(isPremium: boolean, dismissed: boolean) {
		let zips: string[] = ["wasp-free.zip"]
		if (dismissed) zips = ["wasp-free.zip", "community-free.zip", "all-free.zip"]
		if (isPremium) zips = ["wasp-premium.zip", "wasp-free.zip", "wasp-all.zip"]
		if (isPremium && dismissed) zips = ALL_ZIPS

		return zips
	}

	$: zipsAvailable = availableZIPs(isPremium, dismissed)

	let progress: number = -1

	const popupSettings: PopupSettings = {
		event: "click",
		target: "zipDropDown"
	}

	async function downloadFile(url: string) {
		const response = await fetch(url)
		return await response.blob()
	}

	async function downloadGroup(scripts: Script[], urls: (string | false)[]) {
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
		progress = 1
		setTimeout(async () => (progress = -1), 2000)

		return saveAs(zipBlob, zipName)
	}

	async function downloadAndZip() {
		let scripts = await getScripts($page.data.supabaseClient)
		if (!scripts) return console.error("Failed to retrieve scripts information!")

		scripts = scripts.filter((script) => {
			if (script.protected && !script.protected.broken) {
				if (ALL_ZIPS[0] === zipName) {
					return script.categories.includes("Official") && script.categories.includes("Premium")
				} else if (ALL_ZIPS[1] === zipName)
					return script.categories.includes("Official") && script.categories.includes("Free")
				else if (ALL_ZIPS[2] === zipName) return script.categories.includes("Official")
				else if (ALL_ZIPS[3] === zipName)
					return script.categories.includes("Community") && script.categories.includes("Premium")
				else if (ALL_ZIPS[4] === zipName)
					return script.categories.includes("Community") && script.categories.includes("Free")
				else if (ALL_ZIPS[5] === zipName) return script.categories.includes("Premium")
				else if (ALL_ZIPS[6] === zipName) return script.categories.includes("Free")
				else return true
			}
		})

		let urls: (string | false)[] = []
		let promises = []
		let scriptIds = []

		for (let script of scripts) {
			console.log(script.title)
			promises.push(
				new Promise<string | false>(async (resolve) => {
					const result = await getSignedURL(
						$page.data.supabaseClient,
						"scripts",
						script.id + "/" + pad(script.protected.revision, 9),
						"script.simba"
					)
					progress += 1
					resolve(result)
				})
			)
			scriptIds.push(script.id)
		}

		urls = await Promise.all(promises)

		const { blobs, fileNames } = await downloadGroup(scripts, urls)
		await fetch("/api/scripts", { body: JSON.stringify({ ids: scriptIds }), method: "POST" }).catch(
			(error) => console.error(error)
		)
		return await exportZip(blobs, fileNames)
	}

	const download = async () => {
		if (noDownload) return
		const start = performance.now()
		progress = 0
		await downloadAndZip()
		console.log("Took ", performance.now() - start, "ms to download all files 🚀")
	}
</script>

<div class="btn-group text-black fill-black">
	<button
		name={zipName}
		aria-label="Download {zipName}"
		class="variant-filled-primary hover:variant-filled-primary uppercase"
		on:click|preventDefault={download}
	>
		<FileArchive />
		<span class="border-0">{zipName}</span>
	</button>
	<button
		name="Zips"
		aria-label="Open the zips list"
		class="variant-filled-secondary hover:variant-filled-secondary uppercase"
		use:popup={popupSettings}
	>
		<ChevronDown />
	</button>
</div>

<div
	class="z-10 bg-surface-800"
	data-popup="zipDropDown"
	in:slide={{ duration: 300 }}
	out:slide={{ duration: 300 }}
>
	<div class="arrow bg-surface-800" />
	<ul class="overflow-y-auto max-h-48 py-1 text-sm mt-2">
		{#each zipsAvailable as zip}
			<li
				class="block py-2 px-4 hover:bg-primary-100 dark:hover:bg-primary-300 dark:hover:text-surface-900"
			>
				<button on:click={() => (zipName = zip)}>
					{zip}
				</button>
			</li>
		{/each}
	</ul>
</div>
