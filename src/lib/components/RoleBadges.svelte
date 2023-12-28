<script lang="ts">
	import type { Profile } from "$lib/types/collection"

	export let profile: Profile
</script>

<div class="w-full">
	<span
		class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-stone-500 text-white rounded-full"
	>
		OSRS Botter
	</span>

	{#if profile.roles.tester}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded-full"
		>
			Tester
		</span>
	{/if}
	{#if profile.roles.scripter}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-teal-500 text-white rounded-full"
		>
			Scripter
		</span>
	{/if}
	{#if profile.roles.moderator}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-purple-500 text-white rounded-full"
		>
			Mod
		</span>
	{/if}
	{#if profile.roles.administrator}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-500 text-white rounded-full"
		>
			Admin
		</span>
	{/if}
</div>
