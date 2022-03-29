<script>
	import { fade, fly } from "svelte/transition"
	import { scripts } from "../../stores/scriptsStore.js"
	import Checkbox from "../../components/Checkbox.svelte"
	import Card from "../../components/Card.svelte"
</script>

<div class="flex" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div
		class="w-64 border-r border-stone-800"
		in:fly={{ duration: 600, delay: 600, x: -100 }}
		out:fly={{ duration: 300, x: -100 }}
	>
		<h4 class="text-center py-6">Filters</h4>
		<div class="flex justify-center">
			<div>
				<Checkbox label="Premium" />
				<Checkbox label="Free" />
			</div>
		</div>

		<h4 class="text-center py-6">Skills</h4>
		<div class="flex justify-center">
			<div>
				<Checkbox label="Combat" />
				<Checkbox label="Magic" />
			</div>
		</div>
	</div>
	<div
		class="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 sm:px-20 container gap-6 mx-auto my-2 xl:max-w-full lg:max-w-6xl md:max-w-4xl sm:max-w-xl content-start pt-10 xl:px-12"
	>
		{#each $scripts as script}
			<Card {script} />
		{/each}
	</div>
	<!--div class="h-full w-64" /-->
</div>
