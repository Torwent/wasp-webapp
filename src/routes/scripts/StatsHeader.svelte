<script lang="ts">
	import type { StatsSimba } from "$lib/types/collection"
	import { convertTime, formatRSNumber } from "$lib/utils"

	export let stats: StatsSimba
</script>

<header class="text-center">
	<h4>Total Experience Gained: {formatRSNumber(stats.experience)}</h4>
	<h4>Total Gold Gained: {formatRSNumber(stats.gold)}</h4>
	<h4>Total Runtime: {convertTime(stats.runtime)}</h4>
</header>
