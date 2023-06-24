import { z } from "zod"
import Jimp from "jimp"
import { ACCEPTED_IMAGE_TYPES, MB_SIZE } from "$lib/utils"

async function checkServerImageDimensions(
	file: File,
	width: number,
	height: number
): Promise<boolean> {
	if (file == null) return false
	try {
		const data = Buffer.from(await file.arrayBuffer())
		const { bitmap } = await Jimp.read(data)
		return bitmap.width === width && bitmap.height === height
	} catch (error) {
		console.error("checkServerImageDimensions() failed: ")
		console.error(error)
		return false
	}
}

export const filesSchema = z.object({
	cover: z
		.any()
		.refine((file) => file?.size <= 3 * MB_SIZE, "Max image size is 3MB.")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg formats are allwoed.")
		.refine(
			async (file) => file && (await checkServerImageDimensions(file, 300, 200)),
			"The image must be 300 by 200 pixels."
		),
	banner: z
		.any()
		.refine((file) => file?.size <= 5 * MB_SIZE, "Max image size is 5MB.")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg formats are allowed.")
		.refine(
			async (file) => file && (await checkServerImageDimensions(file, 1920, 768)),
			"The image must be 1920 by 768 pixels."
		),
	script: z
		.any()
		.refine((file) => file?.size <= 2 * MB_SIZE, `Max script size is 2MB.`)
		.refine((file) => file?.name.endsWith(".simba"), "Only .simba files are allowed.")
})

export const filesEditSchema = z.object({
	cover: z
		.any()
		.refine((file) => file?.size <= 3 * MB_SIZE, "Max image size is 3MB.")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg formats are allwoed.")
		.refine(
			async (file) => file && (await checkServerImageDimensions(file, 300, 200)),
			"The image must be 300 by 200 pixels."
		)
		.optional(),
	banner: z
		.any()
		.refine((file) => file?.size <= 5 * MB_SIZE, "Max image size is 5MB.")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg formats are allowed.")
		.refine(
			async (file) => file && (await checkServerImageDimensions(file, 1920, 768)),
			"The image must be 1920 by 768 pixels."
		)
		.optional(),
	script: z
		.any()
		.refine((file) => file?.size <= 2 * MB_SIZE, `Max script size is 2MB.`)
		.refine((file) => file?.name.endsWith(".simba"), "Only .simba files are allowed.")
		.optional()
})
