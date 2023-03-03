<script lang="ts">
	import markdownIt from "markdown-it"
	import hljs from "highlight.js"
	//import "highlight.js/styles/github-dark.css"

	export let src: string

	const md = new markdownIt("commonmark", {
		langPrefix: true,
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

	$: html = md.render(src)
</script>

{@html html}
