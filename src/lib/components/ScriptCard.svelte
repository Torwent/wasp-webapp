<script lang="ts">
	import Card from "$lib/components/Card.svelte"
	import type { Script } from "$lib/database/types"

	export let script: Script

	let img =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/" +
		script.id +
		"/cover.jpg"

	let author = script.author != null ? script.author : ""
</script>

<!-- Product Card -->
<a href="/scripts/{encodeURI(script.title) + '&' + script.id}">
	<Card
		{img}
		altImg={script.assets_alt}
		title={script.title}
		{author}
		description={script.description}
		exportedCategories={script.categories}
		exportedSubcategories={script.subcategories}
	/>
</a>
