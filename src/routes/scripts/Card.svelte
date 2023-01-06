<script lang="ts">
	import type { EmojiTooltip } from "$lib/database/types"
	import { fade } from "svelte/transition"
	import EmojiTooltipComponent from "$lib/components/EmojiTooltip.svelte"

	export let img: string
	export let altImg: string = "Asset missing"
	export let title: string
	export let author: string | undefined
	export let description: string
	export let tooltips: EmojiTooltip[]

	if (author == null) author = ""

	if (description.length > 80) {
		description.substring(0, 80) + "..." //crop description at 80 characters.
	}

	let fallback =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/default/cover.jpg"

	const handleError = (ev: Event) => {
		/*ev.target.src = fallback)*/
	}
</script>

<div
	class="flex flex-col shadow-md cursor-pointer duration-300 w-72 rounded-md
		   hover:shadow-xl hover:shadow-black/20 hover:-translate-y-2"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<!-- Preview -->
	<div class="inline relative group h-48">
		<!-- Thumbnail -->
		<img
			class="absolute rounded-t object-cover h-full w-full"
			src={img}
			alt={altImg}
			on:error={handleError}
		/>

		<!-- Hover Effect -->
		<div
			class="flex flex-row absolute justify-end
                    h-16 w-full bottom-0 px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-black/20 via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
		/>
	</div>
	<!-- Body -->
	<div class="flex flex-col bg-stone-100 dark:bg-stone-800 rounded-b p-3 h-[11.5rem]">
		<!-- Title -->
		<span class="text-md font-semibold text-amber-500 hover:underline truncate">
			{title}
		</span>

		<!-- Author - Category -->
		<span class="text-xs text-stone-400 truncate mt-1">
			by

			<!-- Author -->
			<span class="font-semibold hover:underline">
				{author}
			</span>
		</span>

		<!-- content -->
		<div class="text-sm text-stone-500 my-2 h-16 break-words overflow-clip">
			{description}
		</div>

		<div class="grid grid-cols-12 mt-auto">
			{#each tooltips as emoji}
				<EmojiTooltipComponent {emoji} />
			{/each}
		</div>
	</div>
</div>
