<script>
	import { onMount } from "svelte"
	export let src
	let html
	let md
	$: if (md) html = md.render(src)
	onMount(async () => {
		const MarkdownIt = (await import("markdown-it")).default
		md = new MarkdownIt()
	})
</script>

{@html html}

<style>
	@import "github-markdown-css/github-markdown.css";
</style>
