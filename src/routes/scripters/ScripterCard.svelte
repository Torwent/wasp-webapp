<script lang="ts">
	import type { ScripterBase } from "$lib/types/collection"
	import { Avatar } from "@skeletonlabs/skeleton"
	export let scripter: ScripterBase | null = null
</script>

{#if scripter}
	<div class="card-hover rounded-md variant-ghost-surface m-4">
		<a href="/scripters/{scripter.url}">
			<div class="flex text-md font-semibold text-primary-600 dark:text-primary-500 truncate">
				<Avatar
					class="flex m-4 border-4 border-surface-300-600-token"
					src={scripter.profiles.avatar}
					width="w-16	"
					rounded="rounded-full"
					loading="lazy"
				/>
				<span class="mx-8 my-auto">
					{scripter.profiles.username}
					{#if scripter.realname}
						<!-- Name -->
						<small class="text-xs text-surface-400 truncate">
							A.K.A {scripter.realname}
						</small>
					{/if}
				</span>
			</div>
			<div class="flex flex-col p-3 h-24">
				<!-- content -->
				<div class="text-sm text-stone-500 mt-4 mb-1 truncate">{scripter.description ?? ""}</div>
			</div>
		</a>
	</div>
{:else}
	<div class="card-hover rounded-md variant-ghost-surface m-4 animate-pulse">
		<div>
			<div class="flex text-md font-semibold text-primary-600 dark:text-primary-500 truncate">
				<Avatar
					class="flex m-4 border-4 border-surface-300-600-token"
					width="w-16	"
					rounded="rounded-full"
				/>
				<span class="mx-8 my-auto"> Loading... </span>
			</div>
			<div class="flex flex-col p-3 h-24">
				<div class="text-sm text-stone-500 mt-4 mb-1 truncate">Loading...</div>
			</div>
		</div>
	</div>
{/if}
