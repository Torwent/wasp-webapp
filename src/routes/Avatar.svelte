<script lang="ts">
	import type { Profile } from "$lib/database/types"
	import { user, avatar, reloadAvatar, getProfile } from "$lib/stores/authStore"
	const profilePromise = getProfile() as unknown as Profile
	reloadAvatar()
</script>

<div class="flex place-items-center">
	{#if $user}
		{#await profilePromise}
			<span class="font-semibold place-items-center px-4">Loading</span>
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
