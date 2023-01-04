<script lang="ts">
	import type { Developer } from "$lib/database/types"
	import { fly } from "svelte/transition"
	export let dev: Developer
</script>

<div
	in:fly={{ duration: 600, delay: 900, x: 500 }}
	out:fly={{ duration: 600, x: -500 }}
	class="flex flex-col shadow-md my-8 cursor-pointer hover:-translate-y-1 duration-300 w-full bg-stone-100 dark:bg-stone-800 rounded-md"
>
	<a href="/devs/{dev.username}">
		<div class="flex flex-col p-3">
			<!-- Title -->
			<div class="text-md font-semibold text-amber-500 hover:underline truncate">
				{dev.username}
			</div>

			{#if dev.real_name}
				<!-- Name -->
				<span class="text-stone-400 truncate mt-1font-semibold hover:underline">
					{dev.real_name}
				</span>
			{/if}

			<!-- content -->
			<div class="text-sm text-stone-500 mt-4 mb-1">{dev.description}</div>
		</div>
	</a>
</div>
