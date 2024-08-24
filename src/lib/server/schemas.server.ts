import { bannerImage, baseScriptSchema, coverImage, scriptFile } from "$lib/client/schemas"
import { checkServerImageDimensions } from "./utils.server"

export const addScriptServerSchema = baseScriptSchema
	.extend({
		cover: coverImage.refine(
			async (file) => await checkServerImageDimensions(file, 300, 200),
			"The image must be 300 by 200 pixels."
		),
		banner: bannerImage.refine(
			async (file) => await checkServerImageDimensions(file, 1920, 768),
			"The image must be 1920 by 768 pixels."
		),
		script: scriptFile
	})
	.refine(
		(schema) => schema.min_xp <= schema.max_xp,
		"Minimum experience cannot exceed the maximum experience."
	)
	.refine(
		(schema) => schema.min_gp <= schema.max_gp,
		"Minimum gold cannot exceed the maximum gold."
	)

export const updateScriptServerSchema = baseScriptSchema
	.extend({
		cover: coverImage
			.refine(
				async (file) => await checkServerImageDimensions(file, 300, 200),
				"The image must be 300 by 200 pixels."
			)
			.optional(),
		banner: bannerImage
			.refine(
				async (file) => await checkServerImageDimensions(file, 1920, 768),
				"The image must be 1920 by 768 pixels."
			)
			.optional(),
		script: scriptFile.optional()
	})
	.refine(
		(schema) => schema.min_xp <= schema.max_xp,
		"Minimum experience cannot exceed the maximum experience."
	)
	.refine(
		(schema) => schema.min_gp <= schema.max_gp,
		"Minimum gold cannot exceed the maximum gold."
	)
