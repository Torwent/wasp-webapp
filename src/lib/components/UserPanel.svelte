<script>
	import { onMount } from "svelte"
	import { profile, logout, updateRoles } from "$lib/stores/authStore.js"
	import RoleBadges from "$lib/components/RoleBadges.svelte"

	let ws
	onMount(() => {
		ws = new WebSocket("wss://wasp-discord:4100")
		ws.addEventListener("open", () => {
			console.log("Connection open!")
			let id = $profile.discord_id

			if (id !== "") ws.send(id)
		})

		ws.addEventListener("message", async ({ data }) => {
			let hasDev = data.includes("864744526894333963")
			let hasPremium = data.includes("820985772140134440")
			let hasVip = data.includes("931167526681972746")
			let hasTester = data.includes("907209408860291113")

			updateRoles($profile.id, hasDev, hasTester, hasPremium, hasVip)
			ws.close()
		})
	})
</script>

<div class="px-4 py-2">
	<div class="my-4 justify-end">
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
