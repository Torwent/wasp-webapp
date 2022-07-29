import { getPackage } from "$lib/packages"

export const get = async () => {
	return getPackage("free")
}
