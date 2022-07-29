<script lang="ts">
	import { onMount } from "svelte"
	import hljs from "highlight.js"
	import "highlight.js/styles/github-dark.css"

	export let src
	let html
	let md
	$: if (md) html = md.render(src)
	onMount(async () => {
		const MarkdownIt = (await import("markdown-it")).default

		md = new MarkdownIt("commonmark", {
			highlight: function (code, lang, callback) {
				if (lang && hljs.getLanguage(lang)) {
					try {
						return hljs.highlight(code, { language: lang }).value
					} catch (__) {}
				}

				return "" // use external default escaping
			}
		})
	})
</script>

{@html html}
