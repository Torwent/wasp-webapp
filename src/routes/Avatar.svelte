<script lang="ts">
	import type { Profile } from "$lib/database/types"
	import { user, avatar, reloadAvatar, getProfile } from "$lib/stores/authStore"
	const profilePromise = getProfile() as Promise<Profile>
	reloadAvatar()
</script>

<div class="flex place-items-center">
	{#if $user}
		{#await profilePromise}
			<div role="status" class="max-w-sm animate-pulse">
				<div class="h-2.5 bg-stone-200 rounded-full dark:bg-stone-700 w-48 mx-4" />

				<span class="sr-only">Loading...</span>
			</div>
		{:then profile}
			<span class="font-semibold place-items-center px-4">{profile.username}</span>
		{/await}
	{/if}
	<div
		class="rounded-full w-12 h-12 shadow-lg bg-amber-50 border-amber-600 hover:bg-white hover:border-amber-400 border-2 flex place-items-center"
	>
		{@html avatar}
	</div>
</div>
