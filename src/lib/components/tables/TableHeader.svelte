<script lang="ts">
	export let headers: string[]
</script>

<thead class="font-bold text-lg">
	<tr>
		{#each headers as header}
			<th><span class="flex justify-center text-center">{header}</span></th>
		{/each}
	</tr>
</thead>
