<script lang="ts">
	export let title: string
	export let value: string
	export let error: string[] | undefined
</script>

<label for={title.toLowerCase()} class="label my-2">
	<span>{title}:</span>
	<textarea
		id={title.toLowerCase()}
		name={title.toLowerCase()}
		class="textarea h-64"
		class:input-error={error}
		bind:value
	/>
	{#if error}
		<small class="text-error-500">{error}</small>
	{:else}
		<div class="m-0 h-5" />
	{/if}
</label>
