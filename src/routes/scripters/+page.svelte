<script lang="ts">
	import { page } from "$app/state"
	//import ScripterCard from "./ScripterCard.svelte"
	import Paginator from "$lib/components/Paginator.svelte"
	import { replaceQuery } from "$lib/client/utils"
	import Head from "$lib/components/Head.svelte"

	let { data } = $props()

	let { scripters, count, amount } = $derived(data)

	const pageStr = page.url.searchParams.get("page") || "-1"
	let currentPage = Number(pageStr) < 0 || Number.isNaN(Number(pageStr)) ? 0 : Number(pageStr)

	let search: string
</script>

<Head
	title="Scripters"
	description="List of scripters and developers that are behind the project directly and/or indirerectly."
	keywords="Scripters, Developers"
/>
