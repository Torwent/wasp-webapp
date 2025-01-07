<script lang="ts">
	import { goto } from "$app/navigation"
	import { ExternalLink } from "lucide-svelte"

	export let url: string
	export let title: string
</script>

<tr>
	<button class="flex permalink h-full w-full" on:click={() => goto("/scripts/" + url)}>
		<td class="text-xs">
			<div class="flex align-items-center ml-3">
				<ExternalLink size={16} class="mr-4" />
				{title}
			</div>
		</td>
	</button>
</tr>
