<script lang="ts">
	import Card from "./Card.svelte"
	import type { ScriptCard } from "$lib/database/types"

	export let script: ScriptCard
</script>

<!-- Product Card -->
<div class="flex items-center justify-center">
	<a href="/scripts/{encodeURI(script.title) + '&' + script.id}" class="contents">
		<Card
			bind:img={script.assets_path}
			altImg={script.assets_alt}
			title={script.title}
			author={script.author}
			description={script.description}
			tooltips={script.emojiTooltip}
		/>
	</a>
</div>
