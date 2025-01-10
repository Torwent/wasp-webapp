import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

import { skeleton, contentPath } from "@skeletonlabs/skeleton/plugin";
import * as themes from "@skeletonlabs/skeleton/themes";

export default {
	darkMode: "selector",
	content: ["./src/**/*.{html,js,svelte,ts}", contentPath(import.meta.url, "svelte")],
	theme: { extend: {} },
	plugins: [
		typography,
		forms,
		containerQueries,
		skeleton({ themes: [themes.fennec, themes.cerberus, themes.modern, themes.concord] })
	]
} satisfies Config;
