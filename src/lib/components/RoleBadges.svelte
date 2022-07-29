<script lang="ts">
	export let profile: {dev: boolean, premium: boolean, vip: boolean, tester: boolean}
</script>

<div>
	{#if profile.dev}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-sky-500 dark:bg-sky-400 text-white rounded-full"
		>
			Developer
		</span>
	{:else}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-stone-500 dark:bg-stone-400 text-white rounded-full"
		>
			OSRS Botter
		</span>
	{/if}
	{#if profile.premium}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-500 dark:bg-orange-400 text-white rounded-full"
		>
			Premium
		</span>
	{/if}
	{#if profile.vip}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-600 dark:bg-red-500 text-white rounded-full"
		>
			VIP
		</span>
	{/if}
	{#if profile.tester}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 dark:bg-green-400 text-white rounded-full"
		>
			Tester
		</span>
	{/if}
</div>
