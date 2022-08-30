<script lang="ts">
	import { fade } from "svelte/transition"
	export let emoji: { tooltip: string; icon: string }

	let show = false
</script>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	{#if show}
		<div
			class="absolute bottom-12 px-4 py-2 bg-stone-200/90 dark:bg-stone-700/90 rounded-md z-40 overflow-visible"
		>
			{emoji.tooltip}
		</div>
	{/if}
	<div
		on:mouseover={() => (show = true)}
		on:focus={() => (show = true)}
		on:mouseleave={() => (show = false)}
	>
		{emoji.icon}
	</div>
</div>
