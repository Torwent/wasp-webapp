<script lang="ts">
	import { page } from "$app/state"
	const roles = $derived(page.data.roles)
</script>

<div class="flex w-full flex-col justify-evenly gap-2 sm:flex-row">
	<span
		class="inline-block rounded-full bg-stone-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
	>
		OSRS Botter
	</span>
	{#if roles}
		{#if roles.premium}
			<span
				class="inline-block rounded-full bg-yellow-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				Premium
			</span>
		{/if}
		{#if roles.vip}
			<span
				class="inline-block rounded-full bg-red-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				VIP
			</span>
		{/if}
		{#if roles.tester}
			<span
				class="inline-block rounded-full bg-green-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				Tester
			</span>
		{/if}
		{#if roles.scripter}
			<span
				class="inline-block rounded-full bg-teal-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				Scripter
			</span>
		{/if}
		{#if roles.moderator}
			<span
				class="inline-block rounded-full bg-purple-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				Mod
			</span>
		{/if}
		{#if roles.administrator}
			<span
				class="inline-block rounded-full bg-orange-500 px-2.5 py-1 text-center align-baseline text-xs leading-none font-bold whitespace-nowrap text-white xl:px-7 xl:py-5"
			>
				Admin
			</span>
		{/if}
	{/if}
</div>
