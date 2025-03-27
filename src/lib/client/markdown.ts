import markdownit from "markdown-it"
import Shiki from "@shikijs/markdown-it"
import { full as emoji } from "markdown-it-emoji"
import { imgLazyload } from "@mdit/plugin-img-lazyload"

const shikiHighlighter = await Shiki({
	themes: { light: "github-light", dark: "github-dark" },
	langs: ["javascript", "typescript", "bash", "cmd", "yml", "yaml", "pascal", "java"]
})

export const mardownRenderer = new markdownit("commonmark", {
	linkify: true,
	typographer: true
})
	.use(shikiHighlighter)
	.use(emoji)
	.use(imgLazyload)
