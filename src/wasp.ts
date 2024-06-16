import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin"
export const wasp: CustomThemeConfig = {
	name: "wasp",
	properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-family-heading": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "6px",
		"--theme-rounded-container": "4px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "255 255 255",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #ff9500
		"--color-primary-50": "255 239 217", // #ffefd9
		"--color-primary-100": "255 234 204", // #ffeacc
		"--color-primary-200": "255 229 191", // #ffe5bf
		"--color-primary-300": "255 213 153", // #ffd599
		"--color-primary-400": "255 181 77", // #ffb54d
		"--color-primary-500": "255 149 0", // #ff9500
		"--color-primary-600": "230 134 0", // #e68600
		"--color-primary-700": "191 112 0", // #bf7000
		"--color-primary-800": "153 89 0", // #995900
		"--color-primary-900": "125 73 0", // #7d4900
		// secondary | #ffdd00
		"--color-secondary-50": "255 250 217", // #fffad9
		"--color-secondary-100": "255 248 204", // #fff8cc
		"--color-secondary-200": "255 247 191", // #fff7bf
		"--color-secondary-300": "255 241 153", // #fff199
		"--color-secondary-400": "255 231 77", // #ffe74d
		"--color-secondary-500": "255 221 0", // #ffdd00
		"--color-secondary-600": "230 199 0", // #e6c700
		"--color-secondary-700": "191 166 0", // #bfa600
		"--color-secondary-800": "153 133 0", // #998500
		"--color-secondary-900": "125 108 0", // #7d6c00
		// tertiary | #fbff00
		"--color-tertiary-50": "254 255 217", // #feffd9
		"--color-tertiary-100": "254 255 204", // #feffcc
		"--color-tertiary-200": "254 255 191", // #feffbf
		"--color-tertiary-300": "253 255 153", // #fdff99
		"--color-tertiary-400": "252 255 77", // #fcff4d
		"--color-tertiary-500": "251 255 0", // #fbff00
		"--color-tertiary-600": "226 230 0", // #e2e600
		"--color-tertiary-700": "188 191 0", // #bcbf00
		"--color-tertiary-800": "151 153 0", // #979900
		"--color-tertiary-900": "123 125 0", // #7b7d00
		// success | #82c918
		"--color-success-50": "236 247 220", // #ecf7dc
		"--color-success-100": "230 244 209", // #e6f4d1
		"--color-success-200": "224 242 197", // #e0f2c5
		"--color-success-300": "205 233 163", // #cde9a3
		"--color-success-400": "168 217 93", // #a8d95d
		"--color-success-500": "130 201 24", // #82c918
		"--color-success-600": "117 181 22", // #75b516
		"--color-success-700": "98 151 18", // #629712
		"--color-success-800": "78 121 14", // #4e790e
		"--color-success-900": "64 98 12", // #40620c
		// warning | #065d93
		"--color-warning-50": "218 231 239", // #dae7ef
		"--color-warning-100": "205 223 233", // #cddfe9
		"--color-warning-200": "193 215 228", // #c1d7e4
		"--color-warning-300": "155 190 212", // #9bbed4
		"--color-warning-400": "81 142 179", // #518eb3
		"--color-warning-500": "6 93 147", // #065d93
		"--color-warning-600": "5 84 132", // #055484
		"--color-warning-700": "5 70 110", // #05466e
		"--color-warning-800": "4 56 88", // #043858
		"--color-warning-900": "3 46 72", // #032e48
		// error | #ac2020
		"--color-error-50": "243 222 222", // #f3dede
		"--color-error-100": "238 210 210", // #eed2d2
		"--color-error-200": "234 199 199", // #eac7c7
		"--color-error-300": "222 166 166", // #dea6a6
		"--color-error-400": "197 99 99", // #c56363
		"--color-error-500": "172 32 32", // #ac2020
		"--color-error-600": "155 29 29", // #9b1d1d
		"--color-error-700": "129 24 24", // #811818
		"--color-error-800": "103 19 19", // #671313
		"--color-error-900": "84 16 16", // #541010
		// surface | #464749
		"--color-surface-50": "227 227 228", // #e3e3e4
		"--color-surface-100": "218 218 219", // #dadadb
		"--color-surface-200": "209 209 210", // #d1d1d2
		"--color-surface-300": "181 181 182", // #b5b5b6
		"--color-surface-400": "126 126 128", // #7e7e80
		"--color-surface-500": "70 71 73", // #464749
		"--color-surface-600": "63 64 66", // #3f4042
		"--color-surface-700": "53 53 55", // #353537
		"--color-surface-800": "42 43 44", // #2a2b2c
		"--color-surface-900": "34 35 36" // #222324
	}
}
