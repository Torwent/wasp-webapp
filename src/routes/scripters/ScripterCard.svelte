<script lang="ts">
	import type { ScripterBase } from "$lib/types/collection"
	import { Avatar } from "@skeletonlabs/skeleton-svelte"

	let { scripter }: { scripter: ScripterBase } = $props()
</script>

<a
	href="/scripters/{scripter.url}"
	class="card card-hover preset-filled-surface-200-800 border-surface-300-700 hover:border-primary-300-700 m-4 mx-auto mx-auto w-full max-w-md min-w-xs rounded-md border-2"
>
	<div class="text-md text-primary-600 dark:text-primary-500 flex truncate font-semibold">
		<Avatar
			src={scripter.profiles.avatar}
			name={scripter.profiles.username}
			classes="border-surface-300-700 m-4 flex border-2"
		/>
		<span class="mx-8 my-auto">
			{scripter.profiles.username}
			{#if scripter.realname}
				<!-- Name -->
				<small class="text-surface-400 truncate text-xs">
					A.K.A {scripter.realname}
				</small>
			{/if}
		</span>
	</div>
	<div class="flex h-24 flex-col p-3">
		<!-- content -->
		<div class="mt-4 mb-1 truncate text-sm text-stone-500">{scripter.description ?? ""}</div>
	</div>
</a>
