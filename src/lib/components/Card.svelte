<script>
	import { fade } from "svelte/transition"
	import { categories, subcategories } from "$lib/stores/categoryStore.js"
	import EmojiTooltip from "$lib/components/EmojiTooltip.svelte"
	export let script

	let emojis = []

	$: for (let c of script.categories) {
		for (let c2 of $categories) {
			if (c === c2.name) {
				emojis.push({ tooltip: c2.name, icon: c2.emoji })
			}
		}
	}

	$: for (let c of script.subcategories) {
		for (let sub of $subcategories) {
			if (c === sub.name) {
				emojis.push({ tooltip: sub.name, icon: sub.emoji })
			}
		}
	}
</script>

<!-- Product Card -->
<div
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
	class="flex flex-col shadow-md cursor-pointer hover:-translate-y-1 duration-300 w-72"
>
	<!-- Preview -->
	<div class="inline relative group h-48">
		<!-- Thumbnail -->
		<img class="absolute rounded-t object-cover h-full w-full" src={script.cover_img} alt="" />

		<!-- Hover Bar -->
		<div
			class="flex flex-row absolute justify-end
                    h-16 w-full bottom-0 px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-black/20 via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
		>
			<!-- Add to Favorites Button -->
			<button
				class="bg-gray-50/10 rounded-full 
                        px-1 h-9 w-9 my-auto hover:bg-gray-50/20
                        transition-colors duration-200"
			>
				<i
					class="mdi mdi-heart text-xl text-gray-200 p-1
                            hover:text-white transition-all duration-200"
					title="Add to Favorites"
				/>
			</button>
		</div>
	</div>

	<!-- Body -->
	<div class="flex flex-col bg-stone-100 dark:bg-stone-800 rounded-b p-3">
		<!-- Title -->
		<div class="text-md font-semibold text-amber-500 hover:underline truncate">
			{script.title}
		</div>

		<!-- Author - Category -->
		<div class="text-xs text-stone-400 truncate mt-1">
			by

			<!-- Author -->
			<a href="/user/{script.user_id}" class="font-semibold hover:underline">
				{script.author}
			</a>
		</div>

		<!-- content -->
		<div class="text-sm text-stone-500 my-2 h-16">
			{script.description}
		</div>

		<div class="grid grid-cols-12">
			{#each emojis as emoji}
				<EmojiTooltip {emoji} />
			{/each}
		</div>
	</div>
</div>
