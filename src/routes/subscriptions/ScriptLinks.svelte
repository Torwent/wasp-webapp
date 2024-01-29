<script lang="ts">
	import type { ScriptSimple } from "$lib/types/collection"
	import ScriptLinkRow from "./ScriptLinkRow.svelte"

	export let scripts: ScriptSimple[]
	export let colspan: number
</script>

<tr class="table-row">
	<td {colspan}>
		<table class="table table-compact">
			<tbody>
				{#each scripts as script}
					<ScriptLinkRow url={script.url} title={script.title} />
				{/each}
			</tbody>
		</table>
	</td>
</tr>
