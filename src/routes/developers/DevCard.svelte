<script lang="ts">
	import type { DeveloperWithUsername } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"
	import { Avatar } from "@skeletonlabs/skeleton"
	export let developer: DeveloperWithUsername
</script>

<div class="card-hover rounded-md variant-ghost-surface m-4">
	<a href="/developers/{encodeSEO(developer.profiles_public.username)}">
		<div class="flex text-md font-semibold text-primary-600 dark:text-primary-500 truncate">
			<Avatar
				class="flex m-4 border-4 border-surface-300-600-token"
				src={developer.profiles_public.avatar_url}
				width="w-16	"
				rounded="rounded-full"
				loading="lazy"
			/>
			<span class="mx-8 my-auto">
				{developer.profiles_public.username}
				{#if developer.realname}
					<!-- Name -->
					<small class="text-xs text-surface-400 truncate">
						A.K.A {developer.realname}
					</small>
				{/if}
			</span>
		</div>
		<div class="flex flex-col p-3 h-24">
			<!-- content -->
			<div class="text-sm text-stone-500 mt-4 mb-1 truncate">{developer.description || ""}</div>
		</div>
	</a>
</div>
