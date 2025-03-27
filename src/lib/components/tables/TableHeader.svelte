<script lang="ts">
	const { headers } = $props()
</script>

<thead class="text-lg font-bold preset-filled-surface-100-900">
	<tr>
		{#each headers as header}
			<th><span class="flex justify-center text-center">{header}</span></th>
		{/each}
	</tr>
</thead>
