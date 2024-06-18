<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import JsZip from "jszip"
	import { WaspProfile, canDownload, getSignedURL } from "$lib/client/supabase"
	import { pad } from "$lib/client/utils"
	import { slide } from "svelte/transition"
	import { ChevronDown, FileArchive } from "lucide-svelte"
	import { page } from "$app/stores"
	import { error } from "@sveltejs/kit"
	import { formatError } from "$lib/utils"

	export let id: string | null = null
	export let noDownload: boolean = false

	const { supabaseClient, profile, roles } = $page.data

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

	const permissionsPromise = canDownload(supabaseClient, roles, id)

	let dismissed = false
	$: WaspProfile.getWarning(supabaseClient, profile?.id).then((state) => (dismissed = state))

	let zipName = "Loading..."
	let permited = false
	$: permissionsPromise.then((awaited) => {
		permited = awaited
		zipName = permited ? "wasp-premium.zip" : "wasp-free.zip"
	})

	async function getScripts() {
		let query = supabaseClient
			.schema("scripts")
			.from("scripts")
			.select(`id, title, categories, protected!inner (revision)`)
			.order("title", { ascending: true })
			.eq("published", true)
			.eq("protected.broken", false)

		const { data, error: err } = await query

		if (err) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.scripts failed!\n\n" +
					formatError(err)
			)
		}

		if (data.length === 0) {
			error(
				500,
				"Server error, this is probably not an issue on your end!\n" +
					"SELECT scripts.scripts returned empty!\n\n"
			)
		}
		return data
	}

	const scripts = getScripts()

	function availableZIPs(hasPermissions: boolean, dismissed: boolean) {
		let zips: string[] = ["wasp-free.zip"]
		if (dismissed) zips = ["wasp-free.zip", "community-free.zip", "all-free.zip"]
		if (hasPermissions) zips = ["wasp-premium.zip", "wasp-free.zip", "wasp-all.zip"]
		if (hasPermissions && dismissed) zips = ALL_ZIPS

		return zips
	}

	$: zipsAvailable = availableZIPs(permited, dismissed)

	let progress: number = -1

	const popupSettings: PopupSettings = {
		event: "click",
		target: "zipDropDown"
	}

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
		progress = 1
		setTimeout(async () => (progress = -1), 2000)
		const { saveAs } = await import("file-saver")
		return saveAs(zipBlob, zipName)
	}

	async function downloadAndZip() {
		let awaitedScripts = await scripts

		awaitedScripts = awaitedScripts.filter((script) => {
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
		})

		let urls: (string | false)[] = []
		let promises = []
		let scriptIds = []

		for (const script of awaitedScripts) {
			console.log(script.title)
			promises.push(
				new Promise<string | false>(async (resolve) => {
					if (!script.protected?.revision) {
						error(500, "Failed to get script revision of script id: " + script.id)
					}

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

		const { blobs, fileNames } = await downloadGroup(awaitedScripts, urls)
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

{#if zipsAvailable.length > 0}
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
{/if}
