<script lang="ts">
	import markdownit from "markdown-it"
	import { storeHighlightJs } from "@skeletonlabs/skeleton"
	import { full as emoji } from "markdown-it-emoji"
	import { imgLazyload } from "@mdit/plugin-img-lazyload"

	let data = $props()
	let src: string = $state(data.src)

	function highlight(str: string, lang: string) {
		lang = lang.toLowerCase()
		if (lang === "simba" || lang === "freepascal" || lang === "lape") lang = "pascal"

		if ($storeHighlightJs.getLanguage(lang)) {
			try {
				return $storeHighlightJs.highlight(str, { language: lang, ignoreIllegals: true }).value
			} catch (error) {
				console.error("Failed to highlight " + lang + ": " + error)
			}
		}

		return ""
	}

	const md = new markdownit("commonmark", {
		langPrefix: "language-",
		linkify: true,
		typographer: true,
		highlight: highlight
	})
		.use(emoji)
		.use(imgLazyload)
</script>

{@html md.render(src)}
