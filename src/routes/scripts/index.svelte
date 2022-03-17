<script>
	import { fade } from "svelte/transition"
	import Checkbox from "../../components/Checkbox.svelte"
</script>

<div class="flex" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div class="h-full w-64 border-r border-stone-800">
		<h4 class="text-center py-6">Filters</h4>
		<div class="flex justify-center">
			<div>
				<Checkbox label="Premium" />
				<Checkbox label="Free" />
			</div>
		</div>
	</div>
	<div class="container mx-auto my-6 max-w-2xl flex-grow">
		<div class="flex justify-between">
			<div class="py-16 px-16 rounded-md shadow-md hover:shadow-lg bg-stone-800 hover:bg-stone-700">
				Free scripts
			</div>
			<div class="py-16 px-16 rounded-md shadow-md hover:shadow-lg bg-stone-800 hover:bg-stone-700">
				Free scripts
			</div>
		</div>
	</div>
	<div class="h-full w-64" />
</div>
