<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { supabase } from "$lib/supabase"
	import { user } from "$lib/stores/authStore"
	export let post

	const handleSubmit = async () => {
		const { error } = await supabase
			.from("posts")
			.update({
				title: post.title,
				description: post.description,
				level: post.level,
				content: post.content
			})
			.match({ id: post.id })

		if (error) {
			return console.error(error)
		}

		location.reload()
	}
</script>

<div class="container mx-auto my-6 max-w-2xl flex-grow">
	{#if $user.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
		<form class="form my-6" on:submit|preventDefault={handleSubmit}>
			<div class="flex flex-col text-sm mb-2">
				<details>
					<summary>Preview</summary>
					<h1 class="mb-4 font-bold text-3xl">{post.title}</h1>
					<h2 class="font-semibold leading-normal mb-4">{post.description}</h2>
					<article
						class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800"
					>
						<Markdown src={post.content} />
					</article>
				</details>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="title" class="font-bold mb-2"> Title: </label>
				<input
					type="text"
					name="title"
					class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={post.title}
				/>
			</div>
			<div class="flex flex-col text-sm mb-2">
				<label for="description" class="font-bold mb-2"> Description: </label>

				<input
					type="text"
					name="description"
					class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={post.description}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="level" class="font-bold mb-2"> Level (0-2): </label>
				<textarea
					type="text"
					name="level"
					class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={post.level}
				/>
			</div>

			<div class="flex flex-col text-sm mb-2">
				<label for="content" class="font-bold mb-2"> Content: </label>
				<textarea
					type="text"
					name="content"
					class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black h-64"
					bind:value={post.content}
				/>
			</div>

			<div class="flex justify-between">
				<a href="/blog/{encodeURI(post.title)}">
					<button
						type="button"
						class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
					>
						<span class="px-2">Back</span>
					</button>
				</a>

				<button
					type="submit"
					class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
				>
					<span class="px-2">Update</span>
				</button>
			</div>
		</form>
	{:else}
		You don't have permission to edit this post.
	{/if}
</div>
