<script>
	export let label
	export let checked = false
</script>

<div class="form-check">
	<input
		class="form-check-input h-4 w-4 border border-stone-300 rounded-sm bg-white checked:bg-amber-500 checked:border-amber-500 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer accent-amber-500"
		type="checkbox"
		value=""
		id="flexCheckDefault"
		bind:checked
	/>
	<label
		class="form-check-label inline-block cursor-pointer"
		for="flexCheckDefault"
		class:text-amber-500={checked}
	>
		{label}
	</label>
</div>
