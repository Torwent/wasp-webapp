<script lang="ts">
	import { onMount } from "svelte"
	import { logout, getProfile } from "$lib/stores/authStore"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import type { Profile } from "$lib/database/types"

	let finalProfile: Profile

	onMount(async () => {
		const profile = (await getProfile()) as unknown as Profile
		if (profile == null) return

		finalProfile = profile

		await fetch(location.origin + "/api/user/update/" + profile.id, { method: "GET" })
		setTimeout(async () => {
			finalProfile = (await getProfile()) as unknown as Profile
		}, 1000)
	})
</script>

<div class="px-4 py-2">
	{#if finalProfile}
		<div class="my-4 justify-end">
			<a href="/user/{finalProfile.id}">
				<button
					class="w-full shadow-sm rounded py-2 px-4 my-4 text-white
				     bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300"
				>
					Profile
				</button>
			</a>

			<h3 class="text-center py-2">Roles</h3>
			<div class="flex justify-center pt-2 pb-8">
				<RoleBadges profile={finalProfile} />
			</div>

			<button
				href="/"
				class="w-full shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-4"
				on:click={logout}
			>
				Log Out
			</button>
		</div>
	{/if}
</div>
