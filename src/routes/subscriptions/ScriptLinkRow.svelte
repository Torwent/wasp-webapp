<script lang="ts">
	import { goto } from "$app/navigation"
	import { ExternalLink } from "lucide-svelte"

	export let url: string
	export let title: string
</script>

<tr class="flex h-full w-full cursor-pointer" on:click={() => goto("/scripts/" + url)}>
	<td class="text-xs">
		<div class="flex align-items-center ml-3">
			<ExternalLink size={16} class="mr-4" />
			{title}
		</div>
	</td>
</tr>
