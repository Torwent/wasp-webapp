<script lang="ts">
	import { ExternalLink } from "lucide-svelte"

	export let url: string
	export let title: string
</script>

<tr>
	<a href="/scripts/{url}" class="flex permalink h-full w-full">
		<td class="text-xs">
			<div class="flex align-items-center ml-3">
				<ExternalLink size={16} class="mr-4" />
				{title}
			</div>
		</td>
	</a>
</tr>
