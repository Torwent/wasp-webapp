<script lang="ts">
	import type { Category, Script, SubCategory } from "$lib/database/types"
	import { getData } from "$lib/database/supabase"
	export let data: Script //data fetched from ../+page.ts

	import Dropzone from "svelte-file-dropzone"
	import Markdown from "$lib/Markdown.svelte"
	import MultiSelect from "$lib/components/MultiSelect.svelte"
	import { updateScript } from "$lib/database/storage"
	import Card from "../../Card.svelte"

	let cover: string =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/" +
		data.id +
		"/cover.jpg"
	let coverFile: File | undefined
	const handleCoverSelect = (e: { detail: { acceptedFiles: File[] } }) => {
		const { acceptedFiles } = e.detail

		if (acceptedFiles.length === 0) return

		coverFile = acceptedFiles[acceptedFiles.length - 1]

		if (coverFile.size > 250000) {
			coverFile = undefined
			return alert("This file is too large.")
		}

		let reader = new FileReader()
		reader.readAsDataURL(coverFile)
		reader.onload = (e) => {
			if (e.target == null || e.target.result == null) return
			cover = e.target.result as string

			let img = new Image()

			img.onload = function () {
				if (img.width !== 300 || img.height !== 200) {
					coverFile = undefined
					return alert("The cover image has to be 300x200")
				}
			}

			img.src = cover
		}
	}

	let banner: string =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/" +
		data.id +
		"/banner.jpg"
	let bannerFile: File | undefined
	const handleBannerSelect = (e: { detail: { acceptedFiles: File[] } }) => {
		const { acceptedFiles } = e.detail

		if (acceptedFiles.length === 0) return

		bannerFile = acceptedFiles[acceptedFiles.length - 1]

		if (bannerFile.size > 625000) {
			bannerFile = undefined
			return alert("This file is too large.")
		}

		let reader = new FileReader()
		reader.readAsDataURL(bannerFile)
		reader.onload = (e) => {
			if (e.target == null || e.target.result == null) return
			banner = e.target.result as string

			let img = new Image()

			img.onload = function () {
				if (img.width !== 1920 || img.height !== 768) {
					bannerFile = undefined
					return alert("The banner image has to be 1920x768")
				}
			}

			img.src = banner
		}
	}

	let file: File | undefined
	const handleFileSelect = (e: { detail: { acceptedFiles: File[] } }) => {
		const { acceptedFiles } = e.detail

		if (acceptedFiles.length === 0) return

		file = acceptedFiles[acceptedFiles.length - 1]

		if (file.size > 125000) {
			file = undefined
			return alert("This simba file is abnormally large.")
		}
	}

	const handleSubmit = async () => {
		await updateScript(data, file, coverFile, bannerFile)
		location.reload()
	}

	const categories = getData("scripts_categories") as unknown as Category[]
	const subcategories = getData("scripts_subcategories") as unknown as SubCategory[]
</script>

<div class="container mx-auto my-6 max-w-3xl flex-grow">
	<!-- Preview -->
	<div>
		<div class="group w-full absolute left-0 top-16">
			<img class="inset-0 z-0 object-none h-96 w-full" src={banner} alt="Missing banner" />

			<header
				class="text-center w-full h-32 absolute inset-0 z-10 top-64 text-amber-500 text-shadow"
			>
				<h1 class="mb-4 font-bold text-4xl">{data.title}</h1>
				<h2 class="font-semibold leading-normal mb-4">{data.description}</h2>
			</header>
			<!-- Hover Effect -->
			<div
				class="absolute top-80
                    h-16 w-full px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-white/20 via-white-800/20 dark:from-black/20 dark:via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
			/>
		</div>

		<details class="container mx-auto mt-96 mb-6 max-w-2xl flex-grow">
			<summary>Preview script page</summary>
			<div class="container mx-auto max-w-2xl flex-grow">
				<h2 class="text-amber-500 dark:text-amber-200 text-center py-6">Description:</h2>
				<article class="prose dark:prose-invert py-6">
					<Markdown src={data.content} />
				</article>
			</div>
		</details>
	</div>

	<!-- Form -->
	<form class="form my-6" on:submit|preventDefault={handleSubmit}>
		<!-- Card Preview -->
		<div class="2xl:absolute left-20">
			<Card
				img={cover}
				title={data.title}
				author={data.author}
				description={data.description}
				tooltips={[]}
			/>
		</div>

		<!-- Images -->
		<h4>Cover image:</h4>
		<Dropzone accept={".jpg"} on:drop={handleCoverSelect} />
		<h4>Banner image:</h4>
		<Dropzone accept={".jpg"} on:drop={handleBannerSelect} />

		<!-- Title n Description -->
		<div class="pt-4 flex flex-col text-sm mb-2">
			<label for="title" class="font-bold mb-2"> Title: </label>
			<input
				type="text"
				name="title"
				class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
				bind:value={data.title}
			/>
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="description" class="font-bold mb-2"> Description: </label>

			<input
				type="text"
				name="description"
				class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
				bind:value={data.description}
			/>
		</div>

		<!-- Categories -->
		<div class="flex flex-col text-sm mb-2">
			<label for="categories" class="font-bold mb-2"> Categories: </label>
			{#await categories}
				<MultiSelect id="cats" />
			{:then categories}
				<MultiSelect id="cats" bind:value={data.categories}>
					{#each categories as cat}
						<option value={cat.name}>{cat.emoji}{cat.name}</option>
					{/each}
				</MultiSelect>
			{/await}
		</div>
		<div class="flex flex-col text-sm mb-2">
			<label for="categories" class="font-bold mb-2"> Subcategories: </label>
			{#await subcategories}
				<MultiSelect id="subcats" />
			{:then subcategories}
				<MultiSelect id="subcats" bind:value={data.subcategories}>
					{#each subcategories as subcat}
						<option value={subcat.name}>{subcat.emoji}{subcat.name}</option>
					{/each}
				</MultiSelect>
			{/await}
		</div>

		<!-- Content -->
		<div class="flex flex-col text-sm mb-2">
			<label for="content" class="font-bold mb-2"> Content: </label>
			<textarea
				name="content"
				class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black h-64"
				bind:value={data.content}
			/>
		</div>

		<!-- File -->
		<div class="flex flex-col text-sm mt-4 mb-2">
			<span class="font-bold mb-2">Script revision: {data.revision}</span>
			<Dropzone accept={".simba"} on:drop={handleFileSelect} />
			<ol>
				{#if file}
					<li>{file.name}</li>
				{/if}
			</ol>
		</div>

		<!-- Buttons -->
		<div class="flex justify-between">
			<a href="./">
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
				<span class="px-2">
					{#if file}
						Add revision
					{:else}
						Update
					{/if}
				</span>
			</button>
		</div>
	</form>
</div>
