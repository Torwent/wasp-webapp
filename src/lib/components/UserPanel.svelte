<script lang="ts">
	import { onMount } from "svelte"
	import { profile, logout, updateRoles } from "$lib/stores/authStore"
	import RoleBadges from "$lib/components/RoleBadges.svelte"

	let ws
	onMount(() => {
		let protocol = "ws://"
		if (window.location.protocol === "https:") {
			protocol = "wss://"
		}

		let wsUri = protocol + "waspscripts.com/wss"

		ws = new WebSocket(wsUri)
		ws.addEventListener("open", () => {
			console.log("Connection open to wasp-discord!")
			let id = $profile.discord_id

			if (id !== "") ws.send(id)
		})

		ws.addEventListener("message", async ({ data }) => {
			console.log("Received a reply from wasp-discord!", data)
			let hasDev = data.includes("864744526894333963")
			let hasPremium = data.includes("820985772140134440")
			let hasVip = data.includes("931167526681972746")
			let hasTester = data.includes("907209408860291113")

			updateRoles($profile.id, hasDev, hasTester, hasPremium, hasVip)
			console.log("Closing the connection to wasp-discord...")
			ws.close()
		})

		ws.addEventListener("close", () => {
			console.log("Connection to wasp-discord closed!")
		})
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
