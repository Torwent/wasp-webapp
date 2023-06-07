<script lang="ts">
	import type { Profile } from "$lib/backend/types"

	export let profile: Profile
</script>

<div class="w-full">
	{#if profile.profiles_protected.developer}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-sky-500 text-white rounded-full"
		>
			Developer
		</span>
	{:else}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-stone-500 text-white rounded-full"
		>
			OSRS Botter
		</span>
	{/if}
	{#if profile.profiles_protected.premium}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-yellow-500 text-white rounded-full"
		>
			Premium
		</span>
	{/if}
	{#if profile.profiles_protected.vip}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded-full"
		>
			VIP
		</span>
	{/if}
	{#if profile.profiles_protected.tester}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded-full"
		>
			Tester
		</span>
	{/if}
	{#if profile.profiles_protected.scripter}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-teal-500 text-white rounded-full"
		>
			Scripter
		</span>
	{/if}
	{#if profile.profiles_protected.moderator}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-purple-500 text-white rounded-full"
		>
			Mod
		</span>
	{/if}
	{#if profile.profiles_protected.administrator}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-500 text-white rounded-full"
		>
			Admin
		</span>
	{/if}
</div>
