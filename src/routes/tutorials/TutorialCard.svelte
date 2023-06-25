<script lang="ts">
	import type { TutorialWithAuthor } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"
	export let tutorial: TutorialWithAuthor

	$: link = "/tutorials/" + encodeSEO(tutorial.title + " by " + tutorial.profiles_public.username)
</script>

<div
	class="rounded-md variant-ghost-surface m-4 shadow-none hover:shadow-sm {tutorial.level === 0
		? 'ring-sky-400 dark:ring-sky-500 shadow-sky-500'
		: tutorial.level === 1
		? 'ring-orange-400 dark:ring-orange-500 shadow-orange-500'
		: 'ring-red-400 dark:ring-red-500 shadow-red-500'}"
>
	<a href={link}>
		<div class="flex flex-col p-3">
			<div class="text-md font-semibold text-primary-500 text-shadow truncate">
				{tutorial.title}
			</div>

			<small class="text-xs text-surface-400 truncate mt-1">
				by <a
					href="/developers/{encodeSEO(tutorial.profiles_public.username)}"
					class="permalink text-secondary-500 font-semibold text-shadow"
				>
					{tutorial.profiles_public.username}
				</a>
			</small>

			<div class="text-sm text-surface-600 dark:text-surface-300 mt-4 mb-1">
				{tutorial.description}
			</div>
		</div>

		<span
			class="text-xs inline-block py-1 px-2.5 text-center font-bold text-white rounded-tr-md rounded-bl-md
				{tutorial.level === 0 ? 'bg-sky-500' : tutorial.level === 1 ? 'bg-orange-500 ' : 'bg-red-500 '}"
		>
			{#if tutorial.level === 0}Basic{:else if tutorial.level === 1}Intermediate{:else}Advanced{/if}
			tutorial
		</span>
	</a>
</div>
