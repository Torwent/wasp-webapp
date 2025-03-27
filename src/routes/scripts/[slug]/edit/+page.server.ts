import { superValidate, setError } from "sveltekit-superforms/server"
import { redirect } from "@sveltejs/kit"
import { updateScriptServerSchema } from "$lib/server/schemas.server"
import { canEdit } from "$lib/client/supabase"
import { doLogin, updateImgFile, updateScriptFile, uploadFile } from "$lib/server/supabase.server"
import { UUID_V4_REGEX } from "$lib/utils"
import { zod } from "sveltekit-superforms/adapters"
import { getScriptByID, getScriptByURL, updateScript } from "$lib/server/scripts.server"
import { pad } from "$lib/client/utils"

export const load = async ({ locals: { supabaseServer, user, session }, parent }) => {
	if (!user || !session) {
		return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
	}

	const { script } = await parent()

	const form = await superValidate(
		{
			published: script.published,
			status: script.metadata.status === "official",
			type: script.metadata.type === "premium",
			title: script.title,
			description: script.description,
			content: script.content,
			categories: script.metadata.categories,
			xp_min: script.stats_limits.xp_min,
			xp_max: script.stats_limits.xp_max,
			gp_min: script.stats_limits.gp_min,
			gp_max: script.stats_limits.gp_max
		},
		zod(updateScriptServerSchema),
		{ allowFiles: true, errors: false }
	)

	return { form }
}

export const actions = {
	default: async ({
		request,
		params: { slug },
		locals: { supabaseServer, user, session, getRoles }
	}) => {
		if (!user || !session) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		const promises = await Promise.all([
			getRoles(),
			superValidate(request, zod(updateScriptServerSchema), { allowFiles: true })
		])

		const roles = promises[0]
		const form = promises[1]

		if (!roles) {
			return await doLogin(supabaseServer, origin, new URLSearchParams("login&provider=discord"))
		}

		if (!form.valid) {
			console.error("Form is not valid " + JSON.stringify(form.errors))
			return setError(form, "", "Form is not valid \n" + JSON.stringify(form.errors))
		}

		const isUUID = UUID_V4_REGEX.test(slug)
		const script = isUUID ? await getScriptByID(slug) : await getScriptByURL(slug)

		if (!script) {
			return setError(form, "", "Script not found!")
		}

		if (script.metadata.status === "official" && !roles.administrator) {
			return setError(form, "", "You cannot edit an official script!")
		}

		if (form.data.status === true && !roles.administrator) {
			return setError(form, "", "You cannot a script official!")
		}

		if (!canEdit(user.id, roles, script.protected.author_id)) {
			return setError(form, "", "You can't edit a script that doesn't belong to you!")
		}

		console.log("📜 Updating script: ", script.title, " (", script.id + ")")

		const updates = []
		updates.push(
			supabaseServer
				.schema("scripts")
				.from("scripts")
				.update({
					title: form.data.title,
					description: form.data.description,
					content: form.data.content,
					published: form.data.published
				})
				.eq("id", script.id)
				.select("url")
				.single()
		)

		updates.push(
			supabaseServer
				.schema("scripts")
				.from("stats_limits")
				.update({
					xp_min: form.data.xp_min,
					xp_max: form.data.xp_max,
					gp_min: form.data.gp_min,
					gp_max: form.data.gp_max
				})
				.eq("id", script.id)
		)

		updates.push(
			supabaseServer
				.schema("scripts")
				.from("metadata")
				.update({
					status: form.data.status ? "official" : "community",
					type: form.data.type ? "premium" : "free",
					categories: form.data.categories
				})
				.eq("id", script.id)
		)

		const awaitedUpdates = await Promise.all(updates)
		const { data, error: errScript } = awaitedUpdates[0]
		if (errScript)
			return setError(form, "", "UPDATE scripts.scripts failed\n\n" + JSON.stringify(errScript))
		const { error: errLimits } = awaitedUpdates[1]
		if (errLimits)
			return setError(
				form,
				"",
				"UPDATE scripts.stats_limits failed\n\n" + JSON.stringify(errLimits)
			)
		const { error: errMetadata } = awaitedUpdates[2]
		if (errMetadata)
			return setError(form, "", "UPDATE scripts.metadata failed\n\n" + JSON.stringify(errMetadata))

		const files = []

		let revision = script.protected.revision

		if (form.data.script) {
			revision = revision + 1
			console.log("Updating script revision to ", revision)
			form.data.script = await updateScriptFile(form.data.script, script.id, revision)
			const path = script.id + "/" + pad(revision, 9) + "/script.simba"
			files.push(uploadFile(supabaseServer, "scripts", path, form.data.script))
		}

		if (form.data.cover) {
			console.log("Updating script cover")
			files.push(
				updateImgFile(
					supabaseServer,
					"imgs",
					"scripts/" + script.id + "/cover.jpg",
					form.data.cover
				)
			)
		}

		if (form.data.banner) {
			console.log("Updating script banner")
			files.push(
				updateImgFile(
					supabaseServer,
					"imgs",
					"scripts/" + script.id + "/banner.jpg",
					form.data.banner
				)
			)
		}

		const awaitedFiles = files.length > 0 ? await Promise.all(files) : []
		let fileErrors: string | undefined
		for (let i = 0; i < awaitedFiles.length; i++) {
			if (awaitedFiles[i]) {
				fileErrors += "File upload failed!\n" + JSON.stringify(promises[i]) + "\n\n"
			}
		}

		if (fileErrors) return setError(form, "", fileErrors)

		await updateScript(script.id)

		redirect(303, "/scripts/" + data!.url)
	}
}
