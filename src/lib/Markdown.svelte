<script lang="ts">
	import markdownIt from "markdown-it"
	import hljs from "highlight.js"
	//import "highlight.js/styles/github-dark.css"

	export let src: string

	function mdHighLight(str: string, lang: string) {
		lang = lang.toLowerCase()
		if (lang.includes("simba") || lang.includes("freepascal") || lang.includes("lape"))
			lang = "pascal"

		if (hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(str, { language: lang }).value
			} catch (error) {
				console.error(error)
			}
		}

		return ""
	}

	const options: markdownIt.Options = {
		langPrefix: "language-",
		highlight: mdHighLight
	}

	const md = new markdownIt("commonmark", options)

	$: html = md.render(src)
</script>

{@html html}
