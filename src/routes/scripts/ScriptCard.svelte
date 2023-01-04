<script lang="ts">
	import Card from "./Card.svelte"
	import type { Script } from "$lib/database/types"

	export let script: Script

	let author = script.author != null ? script.author : ""
</script>

<!-- Product Card -->
<a href="/scripts/{encodeURI(script.title) + '&' + script.id}">
	<Card
		bind:img={script.assets_path}
		altImg={script.assets_alt}
		title={script.title}
		{author}
		description={script.description}
		exportedCategories={script.categories}
		exportedSubcategories={script.subcategories}
	/>
</a>
