<script lang="ts">
	import type { DeveloperWithUsername } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"
	import { fly } from "svelte/transition"
	export let developer: DeveloperWithUsername
</script>

<div
	in:fly={{ duration: 600, delay: 900, x: 500 }}
	out:fly={{ duration: 600, x: -500 }}
	class="card variant-ghost-surface m-4"
>
	<a href="/developers/{encodeSEO(developer.profiles_public.username)}">
		<div class="flex flex-col p-3 h-24">
			<!-- Title -->
			<div class="text-md font-semibold text-primary-600 dark:text-primary-500 truncate">
				{developer.profiles_public.username}
				{#if developer.realname}
					<!-- Name -->
					<small class="text-xs text-surface-400 truncate">
						A.K.A {developer.realname}
					</small>
				{/if}
			</div>

			<!-- content -->
			<div class="text-sm text-stone-500 mt-4 mb-1 truncate">{developer.description || ""}</div>
		</div>
	</a>
</div>
