<script lang="ts">
	let { index = $bindable(), total = $bindable() } = $props()
	const versions = $derived(Array.from({ length: total }, (_, i) => i + 1).reverse())
</script>

<select
	name="Versions"
	id="versions"
	aria-label="Open the versions list"
	class="select"
	bind:value={index}
>
	{#each versions as version (version)}
		<option class="flex" value={total - version}>Version {version}</option>
	{/each}
</select>
