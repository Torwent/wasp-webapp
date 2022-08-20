<script lang="ts">
	export let header
	export let duration
	export let price
	let buttonText

	if (duration === "Permanent") {
		buttonText = "Buy"
	} else {
		buttonText = "Subscribe"
	}
</script>

<div class="bg-stone-100 dark:bg-stone-800 shadow-sm rounded-md w-80 mx-auto my-4">
	<header class="py-4">
		<h4>{header}</h4>
	</header>

	<p class="py-2">Duration: <span class="text-amber-400">{duration}</span>.</p>
	<p class="py-2">Price: <span class="text-amber-400">{price}€</span>.</p>

	<div class="flex justify-center py-4">
		<button
			type="button"
			data-mdb-ripple="true"
			data-mdb-ripple-color="light"
			class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
		>
			<a href="/" class="px-2">{buttonText}</a>
		</button>
	</div>
</div>
