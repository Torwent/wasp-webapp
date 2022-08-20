<script lang="ts">
	import { onMount } from "svelte"
	import hljs from "highlight.js"
	import "highlight.js/styles/github-dark.css"

	export let src: string
	let html: string
	let md: any

	onMount(async () => {
		const MarkdownIt = (await import("markdown-it")).default

		md = new MarkdownIt("commonmark", {
			highlight: function (code: string, lang: string, callback: void) {
				if (lang && hljs.getLanguage(lang)) {
					try {
						return hljs.highlight(code, { language: lang }).value
					} catch (error) {
						console.error(error)
					}
				}

				return "" // use external default escaping
			}
		})
	})

	$: if (md) html = md.render(src)
</script>

{@html html}
