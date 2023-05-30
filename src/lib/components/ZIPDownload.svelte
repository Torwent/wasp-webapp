<script lang="ts">
	import { popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import JsZip from "jszip"
	import { saveAs } from "file-saver"
	import { getScripts, getSignedURL } from "$lib/backend/data"
	import type { Profile, Script } from "$lib/backend/types"
	import { pad } from "$lib/utils"
	import { slide } from "svelte/transition"

	export let profile: Profile

	let progress: number = -1

	const popupSettings: PopupSettings = {
		event: "click",
		target: "zipDropDown"
	}

	let isPremium =
		profile.profiles_protected.premium ||
		profile.profiles_protected.vip ||
		profile.profiles_protected.tester

	function availableZIPs(isPremium: boolean) {
		return isPremium
			? [
					"wasp-premium.zip",
					"wasp-free.zip",
					"wasp-community-premium.zip",
					"wasp-community-free.zip",
					"wasp-all-premium.zip",
					"wasp-all-free.zip",
					"wasp-all.zip"
			  ]
			: ["wasp-free.zip", "wasp-community-free.zip", "wasp-all-free.zip"]
	}

	let zipName: string = isPremium ? "wasp-premium.zip" : "wasp-free.zip"

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

	const downloadAndZip = async () => {
		let scripts = await getScripts()

		if (!scripts) {
			console.error("Can't read scripts from the database.")
			return false
		}

		scripts = scripts.filter((script) => {
			if (availableZIPs(isPremium)[0].match(zipName))
				return script.categories.includes("Official") && script.categories.includes("Premium")
			else if (availableZIPs(isPremium)[1].match(zipName))
				return script.categories.includes("Official") && script.categories.includes("Free")
			else if (availableZIPs(isPremium)[2].match(zipName))
				return script.categories.includes("Community") && script.categories.includes("Premium")
			else if (availableZIPs(isPremium)[3].match(zipName))
				return script.categories.includes("Community") && script.categories.includes("Free")
			else if (availableZIPs(isPremium)[4].match(zipName))
				return script.categories.includes("Premium")
			else if (availableZIPs(isPremium)[5].match(zipName)) return script.categories.includes("Free")
			else return true
		})

		let urls: (string | false)[] = []
		let promises = []

		for (let script of scripts) {
			promises.push(
				new Promise<string | false>(async (resolve) => {
					const result = await getSignedURL(
						"scripts",
						script.id + "/" + pad(script.scripts_protected.revision, 9),
						"script.simba"
					)
					progress += 1
					resolve(result)
				})
			)
		}

		urls = await Promise.all(promises)

		const { blobs, fileNames } = await downloadGroup(scripts, urls)
		return await exportZip(blobs, fileNames)
	}

	const download = async () => {
		const start = performance.now()
		progress = 0
		await downloadAndZip()
		console.log("Took ", performance.now() - start, "ms to download all files 🚀")
	}

	$: isPremium =
		profile.profiles_protected.premium ||
		profile.profiles_protected.vip ||
		profile.profiles_protected.tester
	$: zipName = isPremium ? "wasp-premium.zip" : "wasp-free.zip"
</script>

<div class="btn-group text-black fill-black">
	<button
		class="variant-filled-primary hover:variant-filled-primary uppercase"
		on:click|preventDefault={download}
	>
		<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
		</svg>
		<span class="border-0">{zipName}</span>
	</button>
	<button
		class="variant-filled-secondary hover:variant-filled-secondary uppercase"
		use:popup={popupSettings}
	>
		<svg class="h-5 w-5 border-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
			/>
		</svg>
	</button>
</div>

<div
	class="bg-surface-800"
	data-popup="zipDropDown"
	in:slide={{ duration: 700 }}
	out:slide={{ duration: 300 }}
>
	<div class="arrow bg-surface-800" />
	<ul class="overflow-y-auto max-h-48 py-1 text-sm mt-2">
		{#each availableZIPs(isPremium) as z}
			<li
				class="block py-2 px-4 hover:bg-primary-100 dark:hover:bg-primary-300 dark:hover:text-surface-900"
			>
				<button on:click={() => (zipName = z)}>
					{z}
				</button>
			</li>
		{/each}
	</ul>
</div>
