<script lang="ts">
	export let title: string
	export let extraTitle: string = ""
	export let value: string | number | null | undefined
	export let errors: string[] | undefined = undefined
	export let type: string = "text"

	if (type === "text" && !value) value = ""
	else if (type === "number" && !value) value = 0

	function typeAction(e: HTMLInputElement) {
		e.type = type
	}
</script>

<label for={title.toLowerCase()} class="label my-2">
	<span>{title + extraTitle}:</span>
	<input
		use:typeAction
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="input h-10"
		class:input-error={errors}
		bind:value
	/>
	{#if errors}
		<small class="text-error-500">{errors}</small>
	{:else}
		<div class="m-0 h-5" />
	{/if}
</label>
