import { supabase } from "../lib/supabase.js"
import { writable } from "svelte/store"

export const posts = writable([])

export const loadPosts = async () => {
	const { data, error } = await supabase.from("posts").select()

	if (error) {
		return console.error(error)
	}

	posts.set(data)
}
loadPosts()

export const addPost = async (title, content, user_id) => {
	const { data, error } = await supabase
		.from("posts")
		.insert([{ title: title, content: content, user_id: user_id }])

	if (error) {
		return console.error(error)
	}

	posts.update((cur) => [...cur, data[0]])
}

export const deletePost = async (id) => {
	const { error } = await supabase.from("posts").delete().match({ id })

	if (error) {
		return console.error(error)
	}

	posts.update((posts) => posts.filter((Post) => Post.id !== id))
}

export const togglePostCompleted = async (id, currentState) => {
	const { error } = await supabase.from("posts").update({ completed: !currentState }).match({ id })

	if (error) {
		return console.error(error)
	}

	posts.update((posts) => {
		let index = -1
		for (let i = 0; i < posts.length; i++) {
			if (posts[i].id === id) {
				index = i
				break
			}
		}

		if (index !== -1) {
			posts[index].completed = !posts[index].completed
		}

		return posts
	})
}
