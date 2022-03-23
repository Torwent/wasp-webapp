<script>
	export let profile
</script>

<div>
	{#if profile.dev_state}
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
	{#if profile.premium_state}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-500 dark:bg-orange-400 text-white rounded-full"
		>
			Premium
		</span>
	{/if}
	{#if profile.vip_state}
		<span
			class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-rose-500 dark:bg-rose-400 text-white rounded-full"
		>
			VIP
		</span>
	{/if}
</div>
