<script lang="ts">
	import { user, avatar, reloadAvatar, profile } from "$lib/stores/authStore"
	reloadAvatar()
</script>

<div class="flex place-items-center">
	{#if $user}
		<span class="font-semibold place-items-center px-4">{$profile.username}</span>
	{/if}
	<div
		class="rounded-full w-12 h-12 shadow-lg bg-amber-50 border-amber-600 hover:bg-white hover:border-amber-400 border-2 flex place-items-center"
	>
		{@html avatar}
	</div>
</div>
