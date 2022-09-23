<script lang="ts">
	import { onMount } from "svelte"
	import { profile, logout } from "$lib/stores/authStore"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	onMount(async () => {
        const response = await fetch(location.origin + "/updateuser/" + $profile.id,
            { method: 'GET' }
        )
        await response.json();
    });
</script>

<div class="px-4 py-2">
	<div class="my-4 justify-end">
		<a href="/user/{$profile.id}">
			<button
				class="w-full shadow-sm rounded py-2 px-4 my-4 text-white
				     bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300"
			>
				Profile
			</button>
		</a>

		<h3 class="text-center py-2">Roles</h3>
		<div class="flex justify-center pt-2 pb-8">
			{#if $profile}
				<RoleBadges profile={$profile} />
			{:else}
				Loading roles...
			{/if}
		</div>

		<button
			href="/"
			class="w-full shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-4"
			on:click={logout}
		>
			Log Out
		</button>
	</div>
</div>
