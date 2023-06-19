<script lang="ts">
	import type { Developer } from "$lib/backend/types"
	import { encodeSEO } from "$lib/utils"
	import { fly } from "svelte/transition"
	export let developer: Developer
</script>

<div
	in:fly={{ duration: 600, delay: 900, x: 500 }}
	out:fly={{ duration: 600, x: -500 }}
	class="card variant-ghost-surface m-4"
>
	<a href="/developers/{encodeSEO(developer.username)}">
		<div class="flex flex-col p-3">
			<!-- Title -->
			<div class="text-md font-semibold text-primary-600 dark:text-primary-500 truncate">
				{developer.username}
				{#if developer.real_name}
					<!-- Name -->
					<small class="text-xs text-surface-400 truncate">
						A.K.A {developer.real_name}
					</small>
				{/if}
			</div>

			<!-- content -->
			<div class="text-sm text-stone-500 mt-4 mb-1">{developer.description}</div>
		</div>
	</a>
</div>
