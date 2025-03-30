<script lang="ts">
	const { headers } = $props()
</script>

<thead class="text-sm font-bold preset-filled-surface-100-900 sm:text-base md:text-lg">
	<tr>
		{#each headers as header}
			<th><span class="flex justify-center text-center">{header}</span></th>
		{/each}
	</tr>
</thead>
