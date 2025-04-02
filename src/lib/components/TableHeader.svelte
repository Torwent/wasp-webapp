<script lang="ts">
	const { headers }: { headers: string[] } = $props()
</script>

<thead class="preset-filled-surface-100-900 text-sm font-bold sm:text-base md:text-lg">
	<tr>
		{#each headers as header (header)}
			<th><span class="flex justify-center text-center">{header}</span></th>
		{/each}
	</tr>
</thead>
