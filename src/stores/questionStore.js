import { supabase } from "../lib/supabase.js"
import { writable } from "svelte/store"

export const questions = writable([])
export const commonErrors = writable([])

export const loadQuestions = async () => {
	const { data, error } = await supabase.from("faq").select()

	if (error) {
		return console.error(error)
	}

	questions.set(data)
	console.log(data)
}
loadQuestions()

export const loadErrors = async () => {
	const { data, error } = await supabase.from("common_errors").select()

	if (error) {
		return console.error(error)
	}

	commonErrors.set(data)
}
loadErrors()
