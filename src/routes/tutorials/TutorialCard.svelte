<script lang="ts">
	import { goto } from "$app/navigation"
	import { encodeSEO } from "$lib/utils"

	const { tutorial } = $props()

	const link = $derived(
		"/tutorials/" + (tutorial ? encodeSEO(tutorial.title + " by " + tutorial.username) : "")
	)
</script>

{#if tutorial}
	<button
		class="m-4 block w-[40rem] rounded-md ring-2 preset-filled-surface-100-900 hover:preset-tonal-surface {tutorial.level ===
		0
			? 'ring-sky-400 dark:ring-sky-500'
			: tutorial.level === 1
				? 'ring-orange-400 dark:ring-orange-500'
				: 'ring-red-400 dark:ring-red-500'}"
		onclick={async () => await goto(link)}
	>
		<div>
			<div class="flex flex-col p-3">
				<div class="text-md text-shadow truncate font-semibold text-primary-500">
					{tutorial.title}
					{#if !tutorial.published}<small class="text-error-500">Unpublished</small>{/if}
				</div>

				<small class="mt-1 truncate text-xs text-surface-400">
					by <a
						href="/scripters/{encodeSEO(tutorial.username)}"
						class="permalink text-shadow font-semibold text-secondary-500"
					>
						{tutorial.username}
					</a>
				</small>

				<div class="mb-1 mt-4 text-sm text-surface-600 dark:text-surface-300">
					{tutorial.description}
				</div>
			</div>

			<div class="flex">
				<span
					class="inline-block rounded-bl-md rounded-tr-md px-2.5 py-1 text-center text-xs font-bold text-white
				{tutorial.level === 0 ? 'bg-sky-500' : tutorial.level === 1 ? 'bg-orange-500 ' : 'bg-red-500 '}"
				>
					{#if tutorial.level === 0}Basic{:else if tutorial.level === 1}Intermediate{:else}Advanced{/if}
					tutorial
				</span>
			</div>
		</div>
	</button>
{:else}
	<button
		class="m-4 w-[40rem] animate-pulse rounded-md ring-2 ring-surface-500 preset-filled-surface-100-900"
	>
		<div>
			<div class="flex flex-col p-3">
				<div class="text-md text-shadow truncate font-semibold text-primary-500"></div>
				<small class="mt-1 truncate text-xs text-surface-400">by Loading...</small>
				<div class="mb-1 mt-4 text-sm text-surface-600 dark:text-surface-300">Loading...</div>
			</div>

			<div class="flex">
				<span
					class="inline-block rounded-bl-md rounded-tr-md bg-surface-500 px-2.5 py-1 text-center text-xs font-bold text-white"
				>
					Loading...
				</span>
			</div>
		</div>
	</button>
{/if}
