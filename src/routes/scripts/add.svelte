<script>
	import Markdown from "$lib/Markdown.svelte"
	import { supabase } from "$lib/supabase.js"
	let script = { title: "", description: "", content: "", categoires: [], subcategories: [] }

	const handleSubmit = async () => {
		/*let id = script.id
		const { error } = await supabase
			.from("posts")
			.update({ title: script.title, description: script.description, content: script.content })
			.match({ id })

		if (error) {
			return console.error(error)
		}
        */
		console.log("This is a placeholder and serves no purpose right now!")
	}
</script>

<div class="container mx-auto my-6 max-w-3xl flex-grow">
	<header>
		<h1 class="text-center text-orange-400">
			THIS IS A PLACEHOLDER AND SERVES NO PURPOSE RIGHT NOW!
		</h1>
		<h2 class="text-center">THIS IS A PLACEHOLDER AND SERVES NO PURPOSE RIGHT NOW!</h2>
		<h3 class="text-center text-orange-400">
			THIS IS A PLACEHOLDER AND SERVES NO PURPOSE RIGHT NOW!
		</h3>
		<h2 class="text-center">THIS IS A PLACEHOLDER AND SERVES NO PURPOSE RIGHT NOW!</h2>
		<h1 class="text-center text-orange-400">
			THIS IS A PLACEHOLDER AND SERVES NO PURPOSE RIGHT NOW!
		</h1>
	</header>

	<form class="form my-6" on:submit|preventDefault={handleSubmit}>
		<div class="flex flex-col text-sm mb-2">
			<label for="title" class="font-bold mb-2"> Title: </label>
			<input
				type="text"
				name="title"
				class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
				bind:value={script.title}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="description" class="font-bold mb-2"> Description: </label>

			<input
				type="text"
				name="description"
				class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
				bind:value={script.description}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="content" class="font-bold mb-2"> Content (Markdown): </label>
			<textarea
				type="text"
				name="content"
				class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
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
		<div class="flex justify-center">
			<button
				type="submit"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				<span class="px-2">Upload</span>
			</button>
		</div>
	</form>
</div>
