<script lang="ts">
	let { title, extraTitle = "", value = $bindable(""), errors, type = "text" } = $props()
</script>

<label for={title.toLowerCase()} class="label my-2">
	<span class="label-text">{title + extraTitle}:</span>
	<textarea
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="textarea"
		class:input-error={errors}
		bind:value
	>
	</textarea>
</label>
