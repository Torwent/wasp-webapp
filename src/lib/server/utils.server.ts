import sharp from "sharp"

export async function checkServerImageDimensions(
	file: File,
	width: number,
	height: number
): Promise<boolean> {
	if (file == null) return false
	try {
		const image = sharp(Buffer.from(await file.arrayBuffer()))
		const metadata = await image.metadata()
		return metadata.width === width && metadata.height === height
	} catch (error) {
		console.error("checkServerImageDimensions() failed: " + JSON.stringify(error))
		return false
	}
}
