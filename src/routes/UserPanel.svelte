<script lang="ts">
	import { profile, logout } from "$lib/stores/authStore"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { API_URL } from "$lib/utils"
	import { onMount } from "svelte"
	import { supabase } from "$lib/database/supabase"

	fetch(API_URL + "/discord/refresh/" + $profile.discord_id, { method: "GET" })

	onMount(async () => {
		const realtimeProfile = supabase.from(`profiles_protected:id=eq.${supabase.auth.user()?.id}`).on("UPDATE", async (entry) => {
		let tmp = $profile
		tmp.premium = entry.new.premium
		tmp.vip = entry.new.vip
		tmp.moderator = entry.new.moderator
		tmp.tester = entry.new.tester
		tmp.developer = entry.new.developer

		profile.set(tmp)
		}).subscribe()

		return () => realtimeProfile.unsubscribe()
	})
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
		
					<RoleBadges profile={$profile} />
	
			</div>

			<button
				class="w-full shadow-sm rounded bg-orange-500 hover:bg-orange-400 dark:bg-orange-400 dark:hover:bg-amber-300 text-white py-2 px-4 my-4"
				on:click={logout}
			>
				Log Out
			</button>
		</div>
	
</div>
