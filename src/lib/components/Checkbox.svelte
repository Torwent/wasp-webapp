<script>
	export let checkbox
</script>

<div id={"checkboxdiv" + checkbox.id} class:font-thin={!checkbox.main}>
	<input
		class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-amber-500"
		type="checkbox"
		id={"checkbox" + checkbox.id}
		bind:checked={checkbox.checked}
	/>
	<label
		class="form-check-label inline-block cursor-pointer dark:hover:text-amber-100 hover:text-orange-400"
		for={"checkbox" + checkbox.id}
		class:text-amber-500={checkbox.checked}
	>
		{checkbox.name}
	</label>
</div>
