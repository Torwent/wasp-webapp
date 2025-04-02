<script lang="ts">
	import { goto } from "$app/navigation"
	import type { Tutorial } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"

	const { tutorial }: { tutorial: Tutorial } = $props()

	const link = $derived(
		"/tutorials/" + (tutorial ? encodeSEO(tutorial.title + " by " + tutorial.username) : "")
	)
</script>

<button
	class="preset-filled-surface-100-900 hover:preset-tonal-surface m-4 block w-[40rem] rounded-md ring-2 {tutorial.level ===
	0
		? 'ring-sky-400 dark:ring-sky-500'
		: tutorial.level === 1
			? 'ring-orange-400 dark:ring-orange-500'
			: 'ring-red-400 dark:ring-red-500'}"
	onclick={async () => await goto(link)}
>
	<div>
		<div class="flex flex-col p-3">
			<div class="text-md text-shadow text-primary-500 truncate font-semibold">
				{tutorial.title}
				{#if !tutorial.published}<small class="text-error-500">Unpublished</small>{/if}
			</div>

			<small class="text-surface-400 mt-1 truncate text-xs">
				by <a
					href="/scripters/{encodeSEO(tutorial.username)}"
					class="permalink text-shadow text-secondary-500 font-semibold"
				>
					{tutorial.username}
				</a>
			</small>

			<div class="text-surface-600 dark:text-surface-300 mt-4 mb-1 text-sm">
				{tutorial.description}
			</div>
		</div>

		<div class="flex">
			<span
				class="inline-block rounded-tr-md rounded-bl-md px-2.5 py-1 text-center text-xs font-bold text-white
				{tutorial.level === 0 ? 'bg-sky-500' : tutorial.level === 1 ? 'bg-orange-500 ' : 'bg-red-500 '}"
			>
				{#if tutorial.level === 0}Basic{:else if tutorial.level === 1}Intermediate{:else}Advanced{/if}
				tutorial
			</span>
		</div>
	</div>
</button>
