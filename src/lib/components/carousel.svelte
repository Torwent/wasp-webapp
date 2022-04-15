<script>
	import { supabase } from "$lib/supabase"
	import { writable } from "svelte/store"

	export const gallery = writable([])

	export let bucket
	export let folder

	export const loadFiles = async () => {
		const { data, error } = await supabase.storage.from(bucket).list(folder, {
			limit: 20,
			offset: 0,
			sortBy: { column: "name", order: "asc" }
		})

		if (error) {
			return console.error(error)
		}

		let imgURLs = []

		for (let i of data) {
			const { publicURL, errorUrl } = supabase.storage
				.from(bucket)
				.getPublicUrl(folder + "/" + i.name)

			if (errorUrl) {
				return console.error(error)
			}

			imgURLs.push(publicURL.replaceAll(" ", "%20"))
		}

		gallery.set(imgURLs)
		console.log($gallery)
	}
	loadFiles()

	let index = 0

	const handleControls = (next) => {
		if (next) {
			index++
		} else {
			index--
		}

		if (index < 0) {
			index = $gallery.length - 1
		} else if (index > $gallery.length - 1) {
			index = 0
		}
	}

	const handleSlider = (i) => {
		index = i
	}
</script>

{#if $gallery}
	<div id="indicators-carousel" class="rounded-md h-96  relative" data-carousel="static">
		<!-- Carousel wrapper -->
		<div class="overflow-hidden relative h-48 rounded-lg sm:h-64 xl:h-80 2xl:h-96">
			<!-- Item {obj.index} -->
			<div class="duration-700 ease-in-out text-center" data-carousel-item="active">
				<img src={$gallery[index]} alt="missing img" />
			</div>
		</div>

		<!-- Slider indicators -->
		<div class="flex absolute bottom-5 left-1/2 z-30 space-x-3 -translate-x-1/2">
			{#each $gallery as img, i}
				<button
					type="button"
					class="w-3 h-3 rounded-full bg-stone-600 hover:bg-orange-400 dark:hover:bg-orange-500 opacity-50"
					on:click={() => handleSlider(i)}
					class:bg-amber-400={index === i}
					class:dark:bg-amber-500={index === i}
				/>
			{/each}
		</div>

		<!-- Button controls -->
		<button
			type="button"
			class="flex absolute top-0 left-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none"
			on:click={() => handleControls(false)}
		>
			<span
				class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-stone-800/30 group-hover:bg-white/50 dark:group-hover:bg-stone-800/60 group-focus:ring-2 group-focus:ring-amber-400/70 dark:group-focus:ring-amber-500/70 group-focus:outline-none"
			>
				<svg
					class="w-5 h-5 text-orange-400 dark:text-orange-500 sm:w-6 sm:h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/></svg
				>
				<span class="hidden">Previous</span>
			</span>
		</button>
		<button
			type="button"
			class="flex absolute top-0 right-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none"
			on:click={() => handleControls(true)}
		>
			<span
				class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-stone-800/30 group-hover:bg-white/50 dark:group-hover:bg-stone-800/60 group-focus:ring-2 group-focus:ring-amber-400/70 dark:group-focus:ring-amber-500/70 group-focus:outline-none"
			>
				<svg
					class="w-5 h-5 text-orange-400 dark:text-orange-500 sm:w-6 sm:h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5l7 7-7 7"
					/></svg
				>
				<span class="hidden">Next</span>
			</span>
		</button>
	</div>
{/if}
