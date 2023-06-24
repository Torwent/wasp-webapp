<script lang="ts">
	import { convertTime, formatRSNumber } from "$lib/utils"

	export let experience: number | null
	export let gold: number | null
	export let runtime: number | null
</script>

{#if experience || gold || runtime}
	<header class="text-center">
		{#if experience}
			<h4>Total Experience Gained: {formatRSNumber(experience)}</h4>
		{/if}
		{#if gold}
			<h4>Total Gold Gained: {formatRSNumber(gold)}</h4>
		{/if}
		{#if runtime}
			<h4>Total Runtime: {convertTime(runtime)}</h4>
		{/if}
	</header>
{/if}
