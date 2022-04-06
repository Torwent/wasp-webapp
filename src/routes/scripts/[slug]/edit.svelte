<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	import { supabase } from "$lib/supabase.js"
	export let script

	const handleSubmit = async () => {
		let id = script.id
		const { error } = await supabase
			.from("posts")
			.update({ title: script.title, description: script.description, content: script.content })
			.match({ id })

		if (error) {
			return console.error(error)
		}
	}
</script>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	<form class="form my-6" on:submit|preventDefault={handleSubmit}>
		<div class="flex flex-col text-sm mb-2">
			<label for="title" class="font-bold mb-2 text-gray-800 "> Title: </label>
			<input
				type="text"
				name="title"
				class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				bind:value={script.title}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="description" class="font-bold mb-2 text-gray-800 "> Description: </label>

			<input
				type="text"
				name="description"
				class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				bind:value={script.description}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="content" class="font-bold mb-2 text-gray-800 "> Content: </label>
			<textarea
				type="text"
				name="content"
				class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				bind:value={script.content}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<details>
				<summary>Preview</summary>
				<div>{script.title}</div>
				<div>{script.description}</div>
				<article class="markdown-body">
					<Markdown src={script.content} />
				</article>
			</details>
		</div>
		<button
			type="submit"
			class="w-full shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
		>
			Update
		</button>
	</form>
</div>
