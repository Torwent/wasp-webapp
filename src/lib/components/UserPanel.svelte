<script>
	import { profile, logout } from "$lib/stores/authStore.js"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import Discord from "$lib/components/Discord.svelte"
</script>

<div class="px-4 py-2">
	<div class="my-4 justify-end">
		<h3 class="text-center py-2">Roles</h3>
		<div class="flex justify-center">
			{#if $profile}
				<RoleBadges profile={$profile} />
			{:else}
				Loading roles...
			{/if}
		</div>
		<button
			class="w-full inline-block text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out mt-4 mb-4"
			on:click={logout}
		>
			<Discord label="Update Profile" />
		</button>

		<button
			href="/"
			class="w-full shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-2"
			on:click={logout}
		>
			Log Out
		</button>
	</div>
</div>
