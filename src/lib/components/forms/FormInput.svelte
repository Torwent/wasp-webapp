<script lang="ts">
	let { title, extraTitle = "", value = $bindable(), errors, type = "text" } = $props()

	if (type === "text" && !value) value = ""
	else if (type === "number" && !value) value = 0

	function typeAction(e: HTMLInputElement) {
		e.type = type
	}
</script>

<label for={title.toLowerCase()} class="label w-fit">
	<span class="label-text">{title + extraTitle}:</span>
	<input
		use:typeAction
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="input"
		class:input-error={errors}
		bind:value
	/>
</label>
