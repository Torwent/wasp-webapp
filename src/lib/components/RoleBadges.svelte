<script lang="ts">
	import { page } from "$app/stores"

	let { roles } = $page.data
	$: ({ roles } = $page.data)
</script>

<div class="flex w-full justify-evenly">
	<span
		class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-stone-500 text-white rounded-full"
	>
		OSRS Botter
	</span>
	{#if roles}
		{#if roles.premium}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-yellow-500 text-white rounded-full"
			>
				Premium
			</span>
		{/if}
		{#if roles.vip}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded-full"
			>
				VIP
			</span>
		{/if}
		{#if roles.tester}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 text-white rounded-full"
			>
				Tester
			</span>
		{/if}
		{#if roles.scripter}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-teal-500 text-white rounded-full"
			>
				Scripter
			</span>
		{/if}
		{#if roles.moderator}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-purple-500 text-white rounded-full"
			>
				Mod
			</span>
		{/if}
		{#if roles.administrator}
			<span
				class="text-xs inline-block py-1 px-2.5 xl:py-5 xl:px-7 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-500 text-white rounded-full"
			>
				Admin
			</span>
		{/if}
	{/if}
</div>
