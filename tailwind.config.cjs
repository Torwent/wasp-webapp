const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	media: false,
	darkMode: "class",
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						"max-width": "100%",
						"--tw-prose-headings": colors.amber[500],
						"--tw-prose-bold": colors.amber[900],
						a: {
							"text-decoration": "none",
							strong: {
								color: colors.amber[500],
								"&:hover": {
									"text-decoration": "underline",
									color: colors.amber[400]
								}
							}
						},
						blockquote: {
							borderLeftColor: colors.amber[100],
							color: colors.stone[600]
						},
						"ul > li::marker": {
							color: colors.amber[100]
						},
						"--tw-prose-pre-bg": colors.stone[600]
					}
				},
				invert: {
					css: {
						"max-width": "100%",
						"--tw-prose-headings": colors.amber[100],
						"--tw-prose-bold": colors.amber[100],
						a: {
							"text-decoration": "none",
							strong: {
								color: colors.amber[400],
								"&:hover": {
									"text-decoration": "underline",
									color: colors.amber[300]
								}
							}
						},
						blockquote: {
							borderLeftColor: colors.amber[100],
							color: colors.stone[300]
						},
						"ul > li::marker": {
							color: colors.amber[100]
						},
						"--tw-prose-pre-bg": colors.stone[800]
					}
				}
			}
		}
	},
	plugins: [require("@tailwindcss/typography")]
}
