<script lang="ts">
	import { superForm } from "sveltekit-superforms/client"
	import { FileDropzone, focusTrap } from "@skeletonlabs/skeleton"
	import { cropString } from "$lib/utils"
	import { scriptSchema } from "$lib/backend/schemas"
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
	import StatsHeader from "../../StatsHeader.svelte"
	import ScriptCardBase from "$lib/components/ScriptCardBase.svelte"
	import { addToolTips } from "$lib/backend/data"

	export let data

	const { categories, subcategories } = data

	let { script, profile } = data
	$: ({ script, profile } = data)

	const { form, errors, enhance, validate } = superForm(data.form, {
		dataType: "form",
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

	$: if ($form.categories) validate()
	$: if ($form.subcategories) validate()
	$: if ($form.min_xp) validate("min_xp")
	$: if ($form.max_xp) validate("max_xp")

	$: {
		script.categories = $form.categories
		script.subcategories = $form.subcategories
		addToolTips(script, categories, subcategories)
	}

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
			console.log(coverStyle)
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

	const headTitle = "Edit " + script.title + " - WaspScripts"
	const headDescription = "Edit " + script.title
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
		script.subcategories
	const headAuthor = script.scripts_protected.profiles_public.username
	const headImage = script?.scripts_protected.assets_path + "banner.jpg"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="noindex" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={headTitle} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content={$page.url.host} />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div>
	{#if showScriptPage}
		<div>
			<ScriptHeader
				title={$form.title}
				username={script.scripts_protected.profiles_public.username}
				hasLink={false}
			>
				<img
					bind:this={bannerElement}
					class="z-0 absolute object-cover h-full w-full"
					src={defaultBanner}
					alt="{script.title} header image"
					loading="lazy"
				/>
			</ScriptHeader>

			<div class="container mt-80 mx-auto mb-6 max-w-2xl flex-grow">
				<header class="my-8">
					<h3 class="text-center text-secondary-500 text-shadow drop-shadow-2xl">
						{$form.description}
					</h3>
				</header>

				<StatsHeader
					experience={script.stats_scripts.experience}
					gold={script.stats_scripts.gold}
					runtime={script.stats_scripts.runtime}
				/>

				{#if profile}
					<div class="text-center">
						<div class="py-12 grid justify-center justify-items-center gap-8">
							<AdvancedButton {script} noDownload={true} rev={script.scripts_protected.revision} />
							<ZipDownload bind:profile noDownload={true} />
						</div>

						<h4 class="pt-4">
							You should move this script to
							<b class="text-primary-500">/Simba/Scripts/</b>
							and place it in the respective folder.
						</h4>
					</div>
				{/if}

				<ScriptArticle content={$form.content} />
			</div>
		</div>
	{/if}

	{#if showScriptCard}
		<div class="max-w-2x m-8">
			<div class="grid grid-cols-1 justify-items-center">
				<ScriptCardBase bind:script bind:imgElement={coverElement} />
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
					<span class="text-lg font-semibold text-blue-400">
						{script.title} - WaspScripts
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

		<article class="variant-ringed-secondary p-8 my-8 mx-auto xs:w-4/5 md:w-4/5 lg:w-3/4">
			<header class="text-center my-8">
				<h3>Update Script</h3>
			</header>
			<form method="POST" enctype="multipart/form-data" use:focusTrap={isFocused} use:enhance>
				<input type="text" id="id" name="id" class="hidden" bind:value={$form.id} />

				<label for="cover" class="my-4">
					<span>Cover:</span>
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
								<span class="text-success-500">{$form.cover.name}</span>
							{:else if $errors.cover && $errors.cover.length > 0}
								{#each $errors.cover as error}
									{#if error}
										<small class="flex justify-center text-error-500">{error}</small>
									{/if}
								{/each}
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<label for="banner" class="my-4">
					<span>Banner:</span>
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
								<span class="text-success-500">{$form.banner.name}</span>
							{:else if $errors.banner && $errors.banner.length > 0}
								{#each $errors.banner as error}
									{#if error}
										<small class="flex justify-center text-error-500">{error}</small>
									{/if}
								{/each}
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<FormInput title="Title" bind:value={$form.title} bind:errors={$errors.title} />

				<FormTextarea
					title="Description"
					extraTitle=" (recommended 60-80 characters)"
					bind:value={$form.description}
					bind:errors={$errors.description}
					h={"h-18"}
				/>

				<MultiSelect
					title="Categories"
					bind:value={$form.categories}
					bind:errors={$errors.categories}
					entries={categories}
				/>

				<MultiSelect
					title="Subcategories"
					bind:value={$form.subcategories}
					bind:errors={$errors.subcategories}
					entries={subcategories}
				/>

				<FormTextarea
					title="Content"
					bind:value={$form.content}
					bind:errors={$errors.content}
					h={"h-64"}
				/>

				<div class="flex flex-col text-sm mt-8 mb-2">
					<h5 class="text-center">Stats limits (every 5 minutes)</h5>
					<div class="grid grid-cols-2 gap-8">
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
					</div>
					<div class="grid grid-cols-2 gap-8">
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

				<label for="script" class="my-4">
					<span>Script:</span>
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
								<span class="text-success-500">{$form.script.name}</span>
							{:else if $errors.script && $errors.script.length > 0}
								{#each $errors.script as error}
									{#if error}
										<small class="flex justify-center text-error-500">{error}</small>
									{/if}
								{/each}
							{/if}
						</svelte:fragment>
					</FileDropzone>
				</label>

				<div class="flex my-8">
					<label
						for="published"
						class="form-check-label inline-block cursor-pointer dark:hover:text-primary-100 hover:text-primary-400"
					>
						Published
						<input
							type="checkbox"
							id="published"
							name="published"
							class="form-check-input h-4 w-4 rounded-sm transition duration-200 mt-1 align-top float-left mr-2 cursor-pointer accent-primary-500"
							bind:checked={script.published}
						/>
					</label>
				</div>

				<div class="my-8">
					{#if $errors._errors && $errors._errors.length > 0}
						{#each $errors._errors as error}
							<div class="flex justify-center text-error-500">{error}</div>
						{/each}
					{/if}
				</div>

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
