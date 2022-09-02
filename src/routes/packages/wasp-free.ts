import { getPackage } from "$lib/packages"

export const GET = async () => {
	return getPackage("free")
}
