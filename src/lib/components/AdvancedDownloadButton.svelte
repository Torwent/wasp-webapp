<script lang="ts">
	import { slide } from "svelte/transition"
	import { getSignedURL } from "$lib/supabaseStorage"
	import { pad } from "$lib/utils"
	import type { Script } from "$lib/supabase"

	export let script: Script

	export let rev = script.revision != null ? script.revision : 1

	let menu: boolean = false,
		revisions: number[] = []

	for (let i = rev; i > 0; i--) {
		revisions.push(i)
	}

	const download = () => {
		menu = false
		getSignedURL("scripts", script.id + "/" + pad(rev, 9), "script.simba").then((url) => {
			if (url == null) return

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
</script>

<div class="flex justify-center text-white text-xs font-semibold">
	<div
		class="relative leading-tight inline-flex outline-orange-300 shadow-md hover:shadow-lg active:outline rounded"
		role="group"
	>
		<button
			type="button"
			class="px-6 py-2.5 uppercase rounded-l transition duration-300 ease-in-out flex justify-start
				 bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500"
			on:click|preventDefault={download}
		>
			<svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
			</svg>

			<span class="my-auto">{script.title}</span>
		</button>

		<button
			type="button"
			class="pr-2 pl-3 py-2.5 uppercase rounded-r transition duration-300 ease-in-out flex justify-end
				 bg-orange-400 hover:bg-orange-600 dark:bg-orange-300 dark:hover:bg-orange-500"
			on:click={() => (menu = !menu)}
		>
			<span class="my-auto">rev. {rev}</span>
			<svg
				class="h-5 w-5"
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
		</button>

		{#if menu}
			<div
				id="dropdown"
				class="absolute top-12 right-0 z-10 w-44 rounded divide-y-2 divide-orange-100 shadow-md bg-stone-100 dark:bg-stone-800"
				in:slide={{ duration: 700 }}
				out:slide={{ duration: 300 }}
			>
				<ul class="overflow-y-auto max-h-48 py-1 text-sm text-stone-700 dark:text-stone-200">
					{#each revisions as r}
						<li
							class="block py-2 px-4 hover:bg-orange-100 dark:hover:bg-orange-300 dark:hover:text-stone-900"
							on:click={() => {
								menu = !menu
								rev = r
							}}
						>
							Revision {r}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>
