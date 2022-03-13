<script>
	import { user, avatar, reloadAvatar, profile } from "../stores/authStore.js"
	reloadAvatar()
</script>

<div class="flex place-items-center">
	{#if $user}
		<span class="font-semibold place-items-center px-4">{$profile.display_name}</span>
	{/if}
	<div
		class="rounded-full w-12 h-12 shadow-lg  border-yellow-600 hover:bg-white hover:border-yellow-400 border-2 flex place-items-center"
	>
		{@html avatar}
	</div>
</div>
