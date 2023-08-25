<script lang="ts">
	export let title: string
	export let extraTitle: string = ""
	export let value: string | null | undefined
	export let errors: string[] | undefined = undefined
	export let h: string

	if (!value) value = ""
</script>

<label for={title.toLowerCase()} class="label my-2">
	<span>{title + extraTitle}:</span>
	<textarea
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="textarea {h}"
		class:input-error={errors}
		bind:value
	/>
	{#if errors}
		<small class="text-error-500">{errors}</small>
	{:else}
		<div class="m-0 h-5" />
	{/if}
</label>
