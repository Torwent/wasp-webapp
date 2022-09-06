import { getPackage } from "$lib/packages"
import { supabase } from "$lib/supabase"

export const GET = async ({ params }: { params: { slug: string } }) => {
	const { slug } = params
	let name = slug

	const { data, error } = await supabase.from("packages").select("*").eq("name", name)

	if (error)
		return {
			status: 404,
			error: new Error(`packages/${slug} not found.`)
		}

	const pkg = data[0]
	if (pkg != null) return getPackage(pkg.name)
}
