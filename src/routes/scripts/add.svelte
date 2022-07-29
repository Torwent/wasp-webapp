<script lang="ts">
	import Dropzone from "svelte-file-dropzone"
	import Markdown from "$lib/Markdown.svelte"
	//import { supabase } from "$lib/supabase"
	import { categories, subcategories, loadData } from "$lib/stores/stores"
	import MultiSelect from "$lib/components/MultiSelect.svelte"

	let script = { title: "", description: "", content: "", categoires: [], subcategories: [] }

	let categoriesValue: { name: string; emoji: string }[] = []
	let subcategoriesValue: { name: string; emoji: string }[] = []

	let file: any

	function handleFilesSelect(e: any) {
		console.log(e.detail)
		const { acceptedFiles } = e.detail

		if (acceptedFiles.length > 0) {
			console.log(acceptedFiles[acceptedFiles.length - 1])
			file = acceptedFiles[acceptedFiles.length - 1]
		}
	}

	loadData("categories", categories)
	loadData("subcategories", subcategories)

	const handleSubmit = async () => {
		/*const { error } = await supabase.from("scripts_test").insert({
			title: script.title,
			description: script.description,
			content: script.content,
			categories: categoriesValue,
			subcategories: subcategoriesValue
		})

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
			<details>
				<summary>Preview</summary>
				<h1 class="mb-4 font-bold text-3xl">{script.title}</h1>
				<h2 class="font-semibold leading-normal mb-4">{script.description}</h2>
				<article
					class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800"
				>
					<Markdown src={script.content} />
				</article>
			</details>
		</div>

		<!-- Title n Description -->
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

		<!-- Categories -->
		<div class="flex flex-col text-sm mb-2">
			<label for="categories" class="font-bold mb-2"> Categories: </label>
			<MultiSelect id="cats" bind:value={categoriesValue}>
				{#each $categories as cat}
					<option value={cat.name}>{cat.emoji}{cat.name}</option>
				{/each}
			</MultiSelect>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="categories" class="font-bold mb-2"> Subcategories: </label>
			<MultiSelect id="subcats" bind:value={subcategoriesValue}>
				{#each $subcategories as subcat}
					<option value={subcat.name}>{subcat.emoji}{subcat.name}</option>
				{/each}
			</MultiSelect>
		</div>

		<!-- Content -->
		<div class="flex flex-col text-sm mb-2">
			<label for="content" class="font-bold mb-2"> Content (Markdown): </label>
			<textarea
				type="text"
				name="content"
				class="p-2 rounded-lg appearance-none shadow-sm border focus:outline-none
                border-orange-200 focus:border-orange-600 text-black h-64"
				bind:value={script.content}
			/>
		</div>

		<!-- File -->
		<div class="flex flex-col text-sm mt-4 mb-2">
			<Dropzone accept={".simba"} on:drop={handleFilesSelect} />
			<ol>
				{#if file}
					<li>{file.name}</li>
				{/if}
			</ol>
		</div>

		<div class="flex justify-between">
			<a href="/scripts">
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
				<span class="px-2">Upload</span>
			</button>
		</div>
	</form>
</div>
