<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import { FileDropzone, focusTrap } from "@skeletonlabs/skeleton"
	import { convertTime, cropString, formatRSNumber } from "$lib/utils.js"
	import { fade, slide } from "svelte/transition"
	import Markdown from "$lib/Markdown.svelte"
	import { scriptSchema, type Script } from "$lib/backend/types.js"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import MultiSelect from "$lib/components/forms/MultiSelect.svelte"
	import { FileCode, ImagePlus } from "lucide-svelte"
	import ScriptCardBase from "../../ScriptCardBase.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"

	export let data

	const { categories, subcategories } = data
	let script = data.script as Script
	const { form, errors, enhance, validate } = superForm(data.form, {
		multipleSubmits: "prevent",
		clearOnSubmit: "errors",
		taintedMessage: "Are you sure you want to leave?",
		validators: scriptSchema
	})

	$form.id = script.id
	$form.title = script.title
	$form.description = script.description
	$form.categories = script.categories
	$form.subcategories = script.subcategories
	$form.content = script.content
	$form.min_xp = script.min_xp
	$form.max_xp = script.max_xp
	$form.min_gp = script.min_gp
	$form.max_gp = script.max_gp

	const defaultBanner = script.scripts_protected.assets_path + "/banner.jpg"
	let coverElement: HTMLImageElement
	let bannerElement: HTMLImageElement

	let coverFiles: FileList
	let bannerFiles: FileList
	let scriptFiles: FileList

	let showScriptPage: boolean = false
	let showScriptCard: boolean = false
	let showSearchResult: boolean = false

	let isFocused: boolean = true

	function getStyle(style: string, value: any, error: any) {
		if (!value) return ""
		if (!(error && error.length > 0)) return style + "-success-500"
		return style + "-error-500"
	}

	$: if ($form.categories) validate("categories")
	$: if ($form.subcategories) validate("subcategories")
	$: if ($form.min_xp) validate("min_xp")
	$: if ($form.max_xp) validate("max_xp")

	$: if (coverFiles) {
		$form.cover = coverFiles[0]
		validate("cover").then((result) => {
			if (result) return

			let reader = new FileReader()
			reader.onload = function () {
				coverElement.src = reader.result as string
			}
			reader.readAsDataURL(coverFiles[0])
		})
	}

	$: if (bannerFiles) {
		$form.banner = bannerFiles[0]
		validate("banner").then((result) => {
			if (result) {
				bannerElement.src = defaultBanner
				return
			}
			let reader = new FileReader()
			reader.onload = function () {
				bannerElement.src = reader.result as string
			}
			reader.readAsDataURL(bannerFiles[0])
		})
	}

	$: if (scriptFiles) {
		$form.script = scriptFiles[0]
		validate("script")
	}
</script>

<svelte:head>
	<MetaTags title="Edit Script" description="Edit Script." robots="noindex" />
</svelte:head>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	{#if showScriptPage}
		<div in:slide={{ duration: 300, delay: 300 }} out:slide={{ duration: 300 }}>
			<div class="absolute inset-0 container min-w-full h-96 mx-0 flex flex-col">
				<img
					bind:this={bannerElement}
					class="z-0 absolute object-cover h-full w-full"
					src={defaultBanner}
					alt="Asset is missing!"
				/>
				<!-- Title and Description Hover Effect -->
				<header class="left-0 mt-auto z-[1] text-center h-32 text-primary-500 text-shadow">
					<div
						class="absolute mx-0 h-32 w-full opacity-100 bg-gradient-to-t from-white/20 via-white-800/20
					dark:from-black/60 dark:via-gray-800/20 to-transparent"
					/>
					<h2 class="mx-8 mb-4 font-bold text-4xl">{$form.title}</h2>
					<h5 class="font-semibold leading-normal mb-4">{$form.description}</h5>
				</header>
			</div>

			<div class="container mt-80 mx-auto mb-6 max-w-2xl flex-grow">
				<header class="text-center">
					<h3>
						Total Experience Gained:
						{#await formatRSNumber(2500000)}...{:then value}{value}{/await}
					</h3>

					<h3>
						Total Gold Gained:
						{#await formatRSNumber(3450000)}...{:then value}{value}{/await}
					</h3>
					<h3>
						Total Runtime:
						{#await convertTime(24 * 60 * 55 * 15)}...{:then value}{value}{/await}
					</h3>
				</header>

				<h5 class="text-primary-500 text-center my-6">Description:</h5>
				<div class="variant-ghost-surface max-h-[50rem] overflow-auto">
					<article class="py-6 m-auto prose dark:prose-invert">
						<Markdown src={$form.content} />
					</article>
				</div>
			</div>
		</div>
	{/if}

	{#if showScriptCard}
		<div
			in:slide={{ duration: 300, delay: 300 }}
			out:slide={{ duration: 300 }}
			class="max-w-2x m-8"
		>
			<div class="grid grid-cols-1 justify-items-center">
				<ScriptCardBase bind:script bind:imgElement={coverElement} />
			</div>
		</div>
	{/if}

	{#if showSearchResult}
		<div
			in:slide={{ duration: 300, delay: 300 }}
			out:slide={{ duration: 300 }}
			class="max-w-2x m-8"
		>
			<div class="text-left w-[36rem] bg-zinc-200 dark:bg-zinc-900 rounded-md mx-auto p-8">
				<div class="flex">
					<div
						class="h-8 w-8 my-auto mr-3 rounded-full bg-white overflow-clip grid justify-center content-center"
					>
						<img src="/favicon.svg" alt="WS" class="h-5 align-middle" />
					</div>
					<div class="block">
						<span class="block">WaspScripts</span>
						<small class="block">https://waspscripts.com > scripts</small>
					</div>
				</div>
				<div>
					<span class="text-lg font-semibold text-blue-400">
						{script.title} - 2007 OSRS Colour Bot | WaspScripts
					</span>
					<p>
						{cropString("RuneScape OSRS Color Bot - " + script.description, 160)}
					</p>
				</div>
			</div>
			<div class="w-[40rem] my-8 mx-auto">
				* This is not a real search result, just an example of what you might expect to see in
				google/bing/duckduckgo
			</div>
		</div>
	{/if}

	<div class="container my-8 mx-auto mb-6 max-w-2x flex flex-col">
		<div class="btn-group variant-filled-secondary mx-auto">
			<button
				on:click={() => {
					showScriptPage = !showScriptPage
					showScriptCard = false
					showSearchResult = false
				}}
			>
				{#if showScriptPage}Hide{:else}Show{/if} script page
			</button>
			<button
				on:click={() => {
					showScriptCard = !showScriptCard
					showScriptPage = false
					showSearchResult = false
				}}
			>
				{#if showScriptCard}Hide{:else}Show{/if} script card
			</button>
			<button
				on:click={() => {
					showSearchResult = !showSearchResult
					showScriptPage = false
					showScriptCard = false
				}}
			>
				{#if showSearchResult}Hide{:else}Show{/if} search result example
			</button>
		</div>

		<article class="variant-ringed-secondary p-8 my-8 mx-auto w-3/4">
			{#if $errors._errors && $errors._errors.length > 0}
				{#each $errors._errors as error}
					<div class="flex justify-center">{error}</div>
				{/each}
			{/if}
			<header class="text-center my-8">
				<h3>Update Script</h3>
			</header>
			<form method="POST" enctype="multipart/form-data" use:focusTrap={isFocused} use:enhance>
				<label for="cover" class="my-4">
					<span>Cover:</span>
					<FileDropzone
						name="cover"
						bind:files={coverFiles}
						slotMessage="mx-auto {getStyle('text', $form.cover, $errors.cover)}"
						slotMeta="mx-auto {getStyle('text', $form.cover, $errors.cover)}"
					>
						<svelte:fragment slot="lead">
							<ImagePlus class="mx-auto {getStyle('stroke', $form.cover, $errors.cover)}" />
						</svelte:fragment>
						<svelte:fragment slot="message">Cover image</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if $errors.cover && $errors.cover.length > 0}
								{#each $errors.cover as error}
									{#if error}
										<small class="flex justify-center">{error}</small>
									{/if}
								{/each}
							{:else}
								Must be exactly 300x200 pixels and JPG format.
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<label for="banner" class="my-4">
					<span>Banner:</span>
					<FileDropzone
						name="banner"
						bind:files={bannerFiles}
						slotMessage="mx-auto {getStyle('text', $form.banner, $errors.banner)}"
						slotMeta="mx-auto {getStyle('text', $form.banner, $errors.banner)}"
					>
						<svelte:fragment slot="lead">
							<ImagePlus class="mx-auto {getStyle('stroke', $form.banner, $errors.banner)}" />
						</svelte:fragment>
						<svelte:fragment slot="message">Banner image</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if $errors.banner && $errors.banner.length > 0}
								{#each $errors.banner as error}
									{#if error}
										<div class="flex justify-center">{error}</div>
									{/if}
								{/each}
							{:else}
								Must be exactly 1920x768 pixels and JPG format.
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<FormInput title="Title" bind:value={$form.title} bind:error={$errors.title} />

				<FormInput
					title="Description"
					extraTitle=" (recommended 60-80 characters)"
					bind:value={$form.description}
					bind:error={$errors.description}
				/>

				<MultiSelect
					title="Categories"
					bind:value={$form.categories}
					bind:error={$errors.categories}
					entries={categories}
				/>

				<MultiSelect
					title="Subcategories"
					bind:value={$form.subcategories}
					bind:error={$errors.subcategories}
					entries={subcategories}
				/>

				<FormTextarea title="Content" bind:value={$form.content} bind:error={$errors.content} />

				<div class="flex flex-col text-sm mt-8 mb-2">
					<h5 class="text-center">Stats limits (every 5 minutes)</h5>
					<div class="grid grid-cols-2 gap-8">
						<FormInput
							title="Minimum Experience"
							bind:value={$form.min_xp}
							bind:error={$errors.min_xp}
							type={"number"}
						/>
						<FormInput
							title="Maximum Experience"
							bind:value={$form.max_xp}
							bind:error={$errors.max_xp}
							type={"number"}
						/>
					</div>
					<div class="grid grid-cols-2 gap-8">
						<FormInput
							title="Minimum Gold"
							bind:value={$form.min_gp}
							bind:error={$errors.min_gp}
							type={"number"}
						/>
						<FormInput
							title="Maximum Gold"
							bind:value={$form.max_gp}
							bind:error={$errors.max_gp}
							type={"number"}
						/>
					</div>
				</div>

				<label for="script_file" class="my-4">
					<span>Script:</span>
					<FileDropzone
						name="script"
						bind:files={scriptFiles}
						slotMessage="mx-auto {getStyle('text', $form.script, $errors.script)}"
						slotMeta="mx-auto {getStyle('text', $form.script, $errors.script)}"
					>
						<svelte:fragment slot="lead">
							<FileCode class="mx-auto {getStyle('stroke', $form.script, $errors.script)}" />
						</svelte:fragment>
						<svelte:fragment slot="message">Simba Script</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if $errors.cover && $errors.cover.length > 0}
								{#each $errors.cover as error}
									{#if error}
										<div class="flex justify-center">{error}</div>
									{/if}
								{/each}
							{:else}
								Must be a Simba script file.
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<div class="flex justify-between">
					<a href="./">
						<button class="btn variant-filled-secondary">Back</button>
					</a>

					<button type="submit" class="btn variant-filled-secondary">Submit</button>
				</div>
			</form>
		</article>
	</div>
</div>
