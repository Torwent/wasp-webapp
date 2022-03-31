<script>
	import { fade, fly } from "svelte/transition"
	import { scripts } from "$lib/stores/scriptsStore.js"
	import Checkbox from "$lib/components/Checkbox.svelte"
	import Card from "$lib/components/Card.svelte"

	import { categories, subcategories } from "$lib/stores/categoryStore.js"
</script>

<div class="flex" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div
		class="w-64 border-r dark:border-stone-800 sticky bottom-0"
		in:fly={{ duration: 600, delay: 600, x: -100 }}
		out:fly={{ duration: 300, x: -100 }}
	>
		<h4 class="text-center py-6">Categories</h4>
		<div class="flex justify-center font-semibold text-sm">
			<div>
				<Checkbox label="Premium👑" />
				<Checkbox label="Free🎈" />
				<br />
				{#each $categories as category}
					<Checkbox label={category.name + category.emoji} />
					<div class="flex pb-3">
						<div class="w-4" />
						<div class="font-thin">
							{#each $subcategories as subcategory}
								{#if subcategory.category === category.name}
									<Checkbox label={subcategory.name + subcategory.emoji} />
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="overflow-y-scroll no-scrollbar max-h-screen">
		<div
			class="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 sm:px-20 container gap-6 mx-auto xl:max-w-full lg:max-w-6xl md:max-w-4xl sm:max-w-xl content-start pt-10 xl:px-12"
		>
			{#each $scripts as script}
				<Card {script} />
			{/each}
		</div>
		<div class="h-24 w-72" />
	</div>
</div>
