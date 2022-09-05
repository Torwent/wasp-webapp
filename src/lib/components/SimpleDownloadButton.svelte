<script lang="ts">
	import { getScripts, getSignedURL } from "$lib/supabaseStorage"
	import Promise from "bluebird"
	import JsZip from "jszip"
	import FileSaver from "file-saver"
	import type { Script } from "$lib/supabase"
	import { pad } from "$lib/utils"
	let progress: number = -1

	const downloadFile = async (url: string, length: number) => {
		const resp = await fetch(url)
		return await resp.blob()
	}

	const downloadByGroup = (urls: string[], files_per_group = 5) => {
		return Promise.map(
			urls,
			async (url: string) => {
				return await downloadFile(url, urls.length)
			},
			{ concurrency: files_per_group }
		)
	}

	const exportZip = (blobs: Blob[], scripts: Script[]) => {
		const zip = JsZip()
		blobs.forEach((blob, i) => {
			zip.file(scripts[i].title.toLowerCase().replaceAll(" ", "_") + ".simba", blob)
		})
		zip.generateAsync({ type: "blob" }).then((zipFile) => {
			const fileName = `wasp-premium.zip`
			progress = 1
			setTimeout(async () => {
				progress = -1
			}, 2000)
			return FileSaver.saveAs(zipFile, fileName)
		})
	}

	export const downloadAndZip = async () => {
		let scripts: Script[] | void = await getScripts()

		if (scripts == null) return

		scripts = scripts.filter((script) => script.categories.includes("Premium"))

		let urls: string[] = []

		for (let script of scripts) {
			let url = await getSignedURL(
				"scripts",
				script.id + "/" + pad(script.revision, 9),
				"script.simba"
			)
			progress += 1 / (scripts.length + 1)

			if (url != null) urls.push(url)
		}

		const blobs = await downloadByGroup(urls, 5)
		return exportZip(blobs, scripts)
	}

	const download = () => {
		progress = 0
		downloadAndZip()
	}
</script>

<div class="flex justify-center text-white text-xs font-semibold">
	<button
		type="button"
		class="relative leading-tight uppercase rounded transition duration-300 ease-in-out justify-start shadow-md hover:shadow-lg
			 bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 outline-orange-300 active:outline"
		on:click|preventDefault={download}
	>
		<div class="flex px-6 py-2.5">
			<span class="mx-4 my-auto">wasp-premium.zip</span>
			<svg
				class="h-5 w-5 animate-bounce"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>

		{#if progress > -1}
			<div class="absolute w-full h-1 rounded-b bottom-0 ease-in-out">
				<div
					class="h-1 rounded-b ease-in-out"
					style="width: {progress * 100}%"
					class:bg-red-400={progress <= 0.2}
					class:bg-orange-300={progress > 0.2 && progress <= 0.4}
					class:bg-amber-300={progress > 0.4 && progress <= 0.6}
					class:bg-lime-400={progress > 0.6 && progress <= 0.8}
					class:bg-green-400={progress > 0.8}
				/>
			</div>
		{/if}
	</button>
</div>
