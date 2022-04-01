<script>
	export let label
	export let checked = false
</script>

<div class="form-check">
	<input
		class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-amber-500"
		type="checkbox"
		value=""
		id={label}
		bind:checked
	/>
	<label
		class="form-check-label inline-block cursor-pointer dark:hover:text-amber-100 hover:text-orange-400"
		for={label}
		class:text-amber-500={checked}
	>
		{label}
	</label>
</div>
