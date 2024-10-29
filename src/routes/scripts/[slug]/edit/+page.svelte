<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import { FileDropzone, SlideToggle, focusTrap } from "@skeletonlabs/skeleton"
	import { cropString } from "$lib/utils"
	import { replaceScriptContent } from "$lib/client/utils"
	import { updateScriptClientSchema } from "$lib/client/schemas"
	import FormInput from "$lib/components/forms/FormInput.svelte"
	import FormTextarea from "$lib/components/forms/FormTextarea.svelte"
	import MultiSelect from "$lib/components/forms/MultiSelect.svelte"
	import { FileCode, ImagePlus } from "lucide-svelte"
	import { browser } from "$app/environment"
	import { page } from "$app/stores"
	import AdvancedButton from "$lib/components/AdvancedButton.svelte"
	import ZipDownload from "$lib/components/ZIPDownload.svelte"
	import ScriptHeader from "../../ScriptHeader.svelte"
	import ScriptArticle from "../../ScriptArticle.svelte"
	import ScriptCardBase from "$lib/components/ScriptCardBase.svelte"
	import { zodClient } from "sveltekit-superforms/adapters"

	export let data

	let { script, categories, subcategories, profile } = data
	$: ({ script, categories, subcategories, profile } = data)

	const { form, errors, enhance, validate } = superForm(data.form, {
		dataType: "form",
		multipleSubmits: "prevent",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(updateScriptClientSchema)
	})

	let defaultBanner = "/banner.jpg"

	$form.title = script.title
	$form.description = script.description
	$form.categories = script.categories
	$form.subcategories = script.subcategories
	$form.content = script.content
	$form.min_xp = script.min_xp
	$form.max_xp = script.max_xp
	$form.min_gp = script.min_gp
	$form.max_gp = script.max_gp
	$form.published = script.published
	defaultBanner = script.protected.assets + "/banner.jpg"

	let coverElement: HTMLImageElement | undefined
	let bannerElement: HTMLImageElement | undefined

	let coverFiles: FileList
	let bannerFiles: FileList
	let scriptFiles: FileList

	let coverStyle: 0 | 1 | 2 = 0
	let bannerStyle: 0 | 1 | 2 = 0
	let scriptStyle: 0 | 1 | 2 = 0

	let showScriptPage: boolean = false
	let showScriptCard: boolean = false
	let showSearchResult: boolean = false

	let isFocused: boolean = true

	const scriptBase = {
		title: $form.title,
		description: $form.description,
		published: $form.published,
		url: "",
		tooltip_emojis: [],
		tooltip_names: [],
		protected: {
			assets: "",
			username: profile?.username ?? "",
			avatar: profile?.avatar ?? ""
		}
	}

	$: scriptBase.title = $form.title
	$: scriptBase.description = $form.description
	$: scriptBase.published = $form.published

	function onChangeCover(e: Event): void {
		if (coverFiles.length === 0) {
			coverStyle = 0
			return
		}

		$form.cover = coverFiles[0]
		validate("cover").then((result) => {
			if (!browser) return
			if (result) {
				coverStyle = 2
				return
			}
			coverStyle = 1
			let reader = new FileReader()
			reader.onload = function () {
				if (!coverElement) coverElement = new Image()
				coverElement.src = reader.result as string
			}
			reader.readAsDataURL(coverFiles[0])
		})
	}

	function onChangeBanner(e: Event): void {
		if (bannerFiles.length === 0) {
			bannerStyle = 0
			return
		}
		$form.banner = bannerFiles[0]
		validate("banner").then((result) => {
			if (!browser) return
			if (!bannerElement) bannerElement = new Image()
			if (result) {
				bannerElement.src = defaultBanner
				bannerStyle = 2
				return
			}
			bannerStyle = 1

			let reader = new FileReader()
			reader.onload = function () {
				if (!bannerElement) bannerElement = new Image()
				bannerElement.src = reader.result as string
			}
			reader.readAsDataURL(bannerFiles[0])
		})
	}

	function onChangeScript(e: Event): void {
		if (scriptFiles.length === 0) {
			scriptStyle = 0
			return
		}
		$form.script = scriptFiles[0]
		validate("script").then((result) => {
			if (result) {
				scriptStyle = 2
				return
			}
			scriptStyle = 1
		})
	}
</script>

<svelte:head>
	{#if script}
		<title>{"Edit " + script.title + " - WaspScripts"}</title>
		<meta name="description" content={"Edit " + script.title} />
		<meta
			name="keywords"
			content={"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
				script.subcategories}
		/>
		<meta name="author" content={script.protected.username} />
		<meta name="robots" content="noindex" />

		<!-- OpenGraph tags -->
		<meta property="og:type" content="website" />
		<meta property="og:title" content={"Edit " + script.title + " - WaspScripts"} />
		<meta property="og:url" content={$page.url.href} />
		<meta property="og:image" content={script.protected.assets + "banner.jpg"} />
		<meta property="og:image:type" content="image/jpeg" />
		<meta property="og:image:alt" content="WaspScripts Logo" />
		<meta property="og:description" content={"Edit " + script.title} />

		<!-- Twitter tags -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta property="twitter:domain" content={$page.url.host} />
		<meta name="twitter:title" content={"Edit " + script.title + " - WaspScripts"} />
		<meta name="twitter:description" content={"Edit " + script.title} />
		<meta name="twitter:image" content={script?.protected.assets + "banner.jpg"} />
	{/if}
</svelte:head>

<main>
	{#if showScriptPage}
		<main class="w-[90%] flex-col mx-auto">
			<ScriptHeader
				id={script?.id}
				title={script?.title}
				username={script?.protected.username}
				description={script?.description}
			>
				<img
					class="rounded-md {!script ? 'animate-pulse' : ''}"
					src={script ? script.protected.assets + "banner.jpg" : "/banner.jpg"}
					alt="Script banner"
					loading="lazy"
				/>
			</ScriptHeader>

			<div class="container mx-auto mb-6 max-w-lg md:max-w-5xl flex-grow">
				{#if profile}
					<div class="text-center">
						<div class="py-12 grid justify-center justify-items-center gap-8">
							<AdvancedButton title={$form.title} rev={1} />
							<ZipDownload noDownload={true} />
						</div>

						<h4 class="pt-4">
							You should move this script to
							<b class="text-primary-500">/Simba/Scripts/</b>
							and place it in the respective folder.
						</h4>
					</div>
				{/if}

				<ScriptArticle content={script ? replaceScriptContent(script) : "Loading..."} />
			</div>
		</main>
	{/if}

	{#if showScriptCard}
		<div class="max-w-2x m-8">
			<div class="grid grid-cols-1 justify-items-center">
				<ScriptCardBase script={scriptBase} bind:imgElement={coverElement} />
			</div>
		</div>
	{/if}

	{#if showSearchResult}
		<div class="max-w-2x m-8">
			<div class="text-left w-[36rem] bg-zinc-200 dark:bg-zinc-900 rounded-md mx-auto p-8">
				<div class="flex">
					<div
						class="h-8 w-8 my-auto mr-3 rounded-full bg-white overflow-clip grid justify-center content-center"
					>
						<img
							src="/favicon.png"
							alt="WaspScripts Logo"
							class="h-5 align-middle"
							loading="lazy"
						/>
					</div>
					<div class="block">
						<span class="block">WaspScripts</span>
						<small class="block">https://waspscripts.com > scripts</small>
					</div>
				</div>
				<div>
					<span class="text-lg font-semibold text-blue-400">{$form.title} - WaspScripts</span>
					<p>{cropString("RuneScape OSRS Color Bot - " + $form.description, 160)}</p>
				</div>
			</div>
			<div class="w-[40rem] my-8 mx-auto">
				* this is not a real search result, just an example of what you might expect to see in
				google/bing/duckduckgo
			</div>
		</div>
	{/if}

	<div class="container my-8 mx-auto mb-6 max-w-2x flex flex-col">
		<div class="btn-group-vertical md:btn-group variant-filled-secondary mx-auto">
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

		<article class="variant-ringed-surface p-8 my-8 mx-auto xs:w-full md:w-6/7 lg:w-3/4 rounded-md">
			<header class="text-center my-8">
				<h3>Add Script</h3>
			</header>
			<form method="POST" enctype="multipart/form-data" use:focusTrap={isFocused} use:enhance>
				<div class="flex justify-evenly">
					<FormInput title="Title" bind:value={$form.title} bind:errors={$errors.title} />

					<div class="my-8">
						<SlideToggle
							name="published"
							bind:checked={$form.published}
							background="bg-error-500"
							active="bg-primary-500"
						>
							{#if $form.published}Public{:else}Hidden{/if}
						</SlideToggle>
					</div>
				</div>

				<FormTextarea
					title="Description"
					extraTitle=" (recommended 60-80 characters)"
					bind:value={$form.description}
					bind:errors={$errors.description}
					h={"h-18"}
				/>

				<FormTextarea
					title="Content"
					bind:value={$form.content}
					bind:errors={$errors.content}
					h={"h-64"}
				/>

				<MultiSelect
					title="Categories"
					bind:values={$form.categories}
					errors={$errors.categories?._errors}
					bind:tooltips={categories}
				/>

				<MultiSelect
					title="Subcategories"
					bind:values={$form.subcategories}
					errors={$errors.subcategories?._errors}
					bind:tooltips={subcategories}
				/>

				<header class="text-center my-8">
					<h5>Files</h5>
				</header>
				<div class="flex justify-between gap-4">
					<FileDropzone
						name="cover"
						bind:files={coverFiles}
						accept="image/jpeg"
						on:change={onChangeCover}
					>
						<svelte:fragment slot="lead">
							{#if coverStyle === 0}
								<ImagePlus class="mx-auto" />
							{:else if coverStyle === 1}
								<ImagePlus class="mx-auto stroke-success-500" />
							{:else}
								<ImagePlus class="mx-auto stroke-error-500" />
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="message">
							{#if coverStyle === 0}
								<span class="mx-auto">Cover image</span>
							{:else if coverStyle === 1}
								<span class="mx-auto text-success-500">Cover image</span>
							{:else}
								<span class="mx-auto text-error-500">Cover image</span>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if coverStyle === 0}
								<span>Must be exactly 300x200 pixels and JPG format.</span>
							{:else if coverStyle === 1}
								<span class="text-success-500">{$form.cover?.name}</span>
							{:else if $errors.cover}
								<small class="flex justify-center text-error-500">{$errors.cover}</small>
							{/if}
						</svelte:fragment>
					</FileDropzone>

					<FileDropzone
						name="banner"
						bind:files={bannerFiles}
						accept="image/jpeg"
						on:change={onChangeBanner}
					>
						<svelte:fragment slot="lead">
							{#if bannerStyle === 0}
								<ImagePlus class="mx-auto" />
							{:else if bannerStyle === 1}
								<ImagePlus class="mx-auto stroke-success-500" />
							{:else}
								<ImagePlus class="mx-auto stroke-error-500" />
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="message">
							{#if bannerStyle === 0}
								<span class="mx-auto">Banner image</span>
							{:else if bannerStyle === 1}
								<span class="mx-auto text-success-500">Banner image</span>
							{:else}
								<span class="mx-auto text-error-500">Banner image</span>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if bannerStyle === 0}
								<span>Must be exactly 1920x768 pixels and JPG format.</span>
							{:else if bannerStyle === 1}
								<span class="text-success-500">{$form.banner?.name}</span>
							{:else if $errors.banner}
								<small class="flex justify-center text-error-500">{$errors.banner}</small>
							{/if}
						</svelte:fragment>
					</FileDropzone>

					<FileDropzone
						name="script"
						bind:files={scriptFiles}
						accept=".simba"
						on:change={onChangeScript}
					>
						<svelte:fragment slot="lead">
							{#if scriptStyle === 0}
								<FileCode class="mx-auto" />
							{:else if scriptStyle === 1}
								<FileCode class="mx-auto stroke-success-500" />
							{:else}
								<FileCode class="mx-auto stroke-error-500" />
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="message">
							{#if scriptStyle === 0}
								<span class="mx-auto">Simba script</span>
							{:else if scriptStyle === 1}
								<span class="mx-auto text-success-500">Simba script</span>
							{:else}
								<span class="mx-auto text-error-500">Simba script</span>
							{/if}
						</svelte:fragment>
						<svelte:fragment slot="meta">
							{#if scriptStyle === 0}
								<span>Must be a Simba script file.</span>
							{:else if scriptStyle === 1}
								<span class="text-success-500">{$form.script?.name}</span>
							{:else if $errors.script}
								<small class="flex justify-center text-error-500">{$errors.script}</small>
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</div>

				<div class="variant-soft-surface p-8 my-8 mx-auto rounded-md">
					<header class="text-center my-8">
						<h5>Stats limits (every 5 minutes)</h5>
					</header>
					<div class="flex justify-between gap-4">
						<label for="min_xp" class="label my-2">
							<span>Minimum Experience:</span>
							<input
								type="number"
								id="min_xp"
								name="min_xp"
								class="input h-10"
								class:input-error={$errors.min_xp}
								bind:value={$form.min_xp}
							/>

							{#if $errors.min_xp}
								<small class="text-error-500">{$errors.min_xp}</small>
							{:else}
								<div class="m-0 h-5" />
							{/if}
						</label>

						<label for="max_xp" class="label my-2">
							<span>Maximum Experience:</span>
							<input
								type="number"
								id="max_xp"
								name="max_xp"
								class="input h-10"
								class:input-error={$errors.max_xp}
								bind:value={$form.max_xp}
							/>

							{#if $errors.min_xp}
								<small class="text-error-500">{$errors.min_xp}</small>
							{:else}
								<div class="m-0 h-5" />
							{/if}
						</label>

						<label for="min_gp" class="label my-2">
							<span>Minimum Gold:</span>
							<input
								type="number"
								id="min_gp"
								name="min_gp"
								class="input h-10"
								class:input-error={$errors.min_gp}
								bind:value={$form.min_gp}
							/>

							{#if $errors.min_gp}
								<small class="text-error-500">{$errors.min_gp}</small>
							{:else}
								<div class="m-0 h-5" />
							{/if}
						</label>

						<label for="max_gp" class="label my-2">
							<span>Maximum Gold:</span>
							<input
								type="number"
								id="max_gp"
								name="max_gp"
								class="input h-10"
								class:input-error={$errors.max_gp}
								bind:value={$form.max_gp}
							/>

							{#if $errors.max_gp}
								<small class="text-error-500">{$errors.max_gp}</small>
							{:else}
								<div class="m-0 h-5" />
							{/if}
						</label>
					</div>
				</div>

				{#if $errors._errors && $errors._errors.length > 0}
					<div class="my-8">
						{#each $errors._errors as error}
							<div class="flex justify-center text-error-500">{error}</div>
						{/each}
					</div>
				{/if}

				<div class="flex justify-between">
					<a href="./">
						<button class="btn variant-filled-secondary">Back</button>
					</a>

					<button type="submit" class="btn variant-filled-secondary">Submit</button>
				</div>
			</form>
		</article>
	</div>
</main>
