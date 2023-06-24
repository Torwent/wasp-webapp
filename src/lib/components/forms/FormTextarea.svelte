<script lang="ts">
	export let title: string
	export let extraTitle: string = ""
	export let value: string | null | undefined
	export let error: string[] | undefined
	export let h: string

	if (!value) value = ""
</script>

<label for={title.toLowerCase()} class="label my-2">
	<span>{title + extraTitle}:</span>
	<textarea
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="textarea {h}"
		class:input-error={error}
		bind:value
	/>
	{#if error}
		<small class="text-error-500">{error}</small>
	{:else}
		<div class="m-0 h-5" />
	{/if}
</label>
