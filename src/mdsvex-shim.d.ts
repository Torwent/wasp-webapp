declare module "mdsvex" {
	import type { CompileOptions } from "mdsvex/dist/main.cjs"

	export function compile(
		markdown: string,
		options?: CompileOptions
	): Promise<{
		code: string
		data: Record<string, unknown>
		map: unknown
	}>

	export function escapeSvelte(str: string): string

	// Re-export other types if needed
	export type { CompileOptions }
}
