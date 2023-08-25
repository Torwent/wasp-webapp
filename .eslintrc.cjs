module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: ["plugin:svelte/recommended"],
	plugins: ["svelte", "@typescript-eslint"],
	ignorePatterns: ["*.cjs"],
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser"
			}
		}
	],
	settings: { "svelte/typescript": () => require("typescript") },
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"] // This is a required setting in `@typescript-eslint/parser` v4.24.0.
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
}
