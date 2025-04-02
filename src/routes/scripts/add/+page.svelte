<script lang="ts">
	import { superForm } from "sveltekit-superforms"
	import { zodClient } from "sveltekit-superforms/adapters"
	import { cropString, scriptCategories, scriptStatus, scriptTypes } from "$lib/utils"
	import { getScriptContent } from "$lib/client/utils"
	import { FileCode, ImagePlus } from "svelte-lucide"
	import ScriptHeader from "../ScriptHeader.svelte"
	import ScriptArticle from "../ScriptArticle.svelte"
	import { addScriptClientSchema } from "$lib/client/schemas"
	import { FileUpload, Switch } from "@skeletonlabs/skeleton-svelte"
	import AdvancedButton from "../AdvancedButton.svelte"
	import ZipDownload from "../ZipDownload.svelte"
	import NewScriptCard from "$lib/components/NewScriptCard.svelte"
	import type { ScriptLimits, ScriptMetaData, ScriptPublic } from "$lib/types/collection"

	const { data } = $props()
	let profile = $derived(data.profile!)
	let roles = $derived(data.roles!)

	const { form, errors, enhance, validate } = superForm(data.form!, {
		dataType: "form",
		multipleSubmits: "prevent",
		taintedMessage: "Are you sure you want to leave?",
		validators: zodClient(addScriptClientSchema),
		scrollToError: true
	})

	const categories = Object.values(scriptCategories)

	let coverURL: string = $state("/cover.jpg")
	let bannerURL: string = $state("/banner.jpg")

	let coverStyle: 0 | 1 | 2 = $state(0)
	let bannerStyle: 0 | 1 | 2 = $state(0)
	let scriptStyle: 0 | 1 | 2 = $state(0)

	let show: boolean[] = $state([false, false, false])

	let publicData: ScriptPublic = $state({
		id: "SCRIPT_ID_UNDEFINED",
		title: $form.title,
		description: $form.description,
		content: $form.description,
		published: $form.published,
		url: ""
	})

	let metaData: ScriptMetaData = $state({
		status: $form.status ? "official" : "community",
		type: $form.type ? "premium" : "free",
		categories: $form.categories
	})
	let limitsData: ScriptLimits = $state({
		xp_min: $form.xp_min,
		xp_max: $form.xp_max,
		gp_min: $form.gp_min,
		gp_max: $form.gp_max
	})

	$effect(() => {
		publicData = {
			id: "SCRIPT_ID_UNDEFINED",
			title: $form.title,
			description: $form.description,
			content: $form.description,
			published: $form.published,
			url: ""
		}
	})

	$effect(() => {
		metaData = {
			status: $form.status ? "official" : "community",
			type: $form.type ? "premium" : "free",
			categories: $form.categories
		}
	})

	$effect(() => {
		limitsData = {
			xp_min: $form.xp_min,
			xp_max: $form.xp_max,
			gp_min: $form.gp_min,
			gp_max: $form.gp_max
		}
	})
</script>

<main>
	{#if show[0]}
		<main class="mx-auto w-[90%] flex-col">
			<ScriptHeader
				id="SCRIPT_ID_UNDEFINED"
				title={$form.title}
				username={profile.username}
				description={$form.description}
			>
				<img class="rounded-md" src={bannerURL} alt="Script banner" loading="lazy" />
			</ScriptHeader>

			<div class="container mx-auto mb-6 max-w-lg flex-grow md:max-w-5xl">
				{#if profile}
					<div class="text-center">
						<div class="grid justify-center justify-items-center gap-8 py-12">
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

				<ScriptArticle content={getScriptContent(publicData, limitsData, profile.username ?? "")} />
			</div>
		</main>
	{/if}

	{#if show[1]}
		<div class="max-w-2x m-8">
			<div class="grid grid-cols-1 justify-items-center">
				<NewScriptCard script={publicData} metadata={metaData} customCover={coverURL} />
			</div>
		</div>
	{/if}

	{#if show[2]}
		<div class="max-w-2x m-8">
			<div class="mx-auto w-[36rem] rounded-md bg-zinc-200 p-8 text-left dark:bg-zinc-900">
				<div class="flex">
					<div
						class="my-auto mr-3 grid h-8 w-8 content-center justify-center overflow-clip rounded-full bg-white"
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
			<div class="mx-auto my-8 w-[40rem]">
				* this is not a real search result, just an example of what you might expect to see in
				google/bing/duckduckgo
			</div>
		</div>
	{/if}

	<div class="max-w-2x container mx-auto my-8 mb-6 flex flex-col">
		<div class="btn-group preset-outlined-surface-500 mx-auto flex flex-col md:flex-row">
			{#each [" script page", " script card", " search result example"] as str, idx (str)}
				<button
					class="btn {show[idx] ? 'preset-filled' : 'hover:preset-tonal'}"
					onclick={() => {
						const tmp = show[idx]
						for (let i = 0; i < show.length; i++) show[i] = false
						show[idx] = !tmp
					}}
				>
					{#if show[idx]}Hide{:else}Show{/if}{str}
				</button>
			{/each}
		</div>

		<article
			class="xs:w-full preset-outlined-surface-500 mx-auto my-8 rounded-md p-8 md:w-6/7 lg:w-3/4"
		>
			<header class="my-8 text-center">
				<h3>Edit Script</h3>
			</header>
			<form method="POST" enctype="multipart/form-data" use:enhance>
				<div class="mx-auto my-8 flex flex-col justify-evenly md:flex-row">
					<label class="label mx-auto my-4 flex w-fit place-items-center">
						<Switch
							name="published"
							checked={$form.published}
							onCheckedChange={(e) => ($form.published = e.checked)}
						/>
						<span class="label-text mx-2 text-center">
							{#if $form.published}Public{:else}Hidden{/if}
						</span>
					</label>

					<label class="label mx-auto my-4 flex w-fit place-items-center">
						<Switch
							name="status"
							checked={$form.status}
							onCheckedChange={(e) => ($form.status = e.checked)}
							disabled={!roles.administrator}
							classes={roles.administrator ? "" : "disabled"}
						/>
						<span class="label-text mx-2 text-center">
							{#if $form.status}
								{scriptStatus.official.icon}{scriptStatus.official.name}
							{:else}
								{scriptStatus.community.icon}{scriptStatus.community.name}
							{/if}
						</span>
					</label>

					<label class="label mx-auto my-4 flex w-fit place-items-center">
						<Switch
							name="type"
							checked={$form.type}
							onCheckedChange={(e) => ($form.type = e.checked)}
						/>
						<span class="label-text mx-2 text-center">
							{#if $form.type}
								{scriptTypes.premium.icon}{scriptTypes.premium.name}
							{:else}
								{scriptTypes.free.icon}{scriptTypes.free.name}
							{/if}
						</span>
					</label>
				</div>
				<div class="my-8 flex flex-col justify-evenly">
					<label class="label">
						<span class="label-text">Title:</span>
						<input
							type="text"
							id="title"
							name="title"
							class="input"
							class:ring-error-500={$errors.title != null}
							bind:value={$form.title}
						/>
					</label>
					{#if $errors.title}
						{#each $errors.title as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</div>

				<div class="my-8 flex flex-col">
					<label class="label">
						<span class="label-text">Description (recommended 60-80 characters):</span>
						<textarea
							id="description"
							name="description"
							class="textarea"
							class:ring-error-500={$errors.description != null}
							bind:value={$form.description}
						>
						</textarea>
					</label>
					{#if $errors.description}
						{#each $errors.description as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</div>

				<div class="my-8 flex flex-col">
					<label class="label">
						<span class="label-text">Content:</span>
						<textarea
							id="content"
							name="content"
							class="textarea h-64"
							class:ring-error-500={$errors.content != null}
							bind:value={$form.content}
						>
						</textarea>
					</label>
					{#if $errors.content}
						{#each $errors.content as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}
				</div>

				<div class="my-16 flex flex-col">
					<label class="label">
						<span class="label-text">Categories:</span>
						<select
							id="categories"
							name="categories"
							class="select overflow-y-scroll"
							class:ring-error-500={$errors.categories != null}
							bind:value={$form.categories}
							multiple
						>
							{#each categories as category (category.value)}
								<option value={category.value} class="selection:bg-primary-500">
									{category.icon}{category.name}
								</option>
							{/each}
						</select>
					</label>
					<small class="my-2">
						{#each $form.categories as category (category)}
							<span class="mx-2">
								{scriptCategories[category].icon}{scriptCategories[category].name}
							</span>
						{/each}
					</small>

					{#if $errors.categories?._errors}
						{#each $errors.categories._errors as err (err)}
							<small class="text-error-500">{err}</small>
						{/each}
					{/if}

					<span class="mx-auto">
						<kbd class="kbd">CTRL + Click</kbd>
						or
						<kbd class="kbd">SHIFT + Click</kbd>
						to select multiple categories on Desktop
					</span>
				</div>

				<header class="my-8 text-center">
					<h5>Files</h5>
				</header>
				<div class="flex flex-col justify-between gap-4 2xl:flex-row">
					<FileUpload
						name="cover"
						label="Cover image"
						accept="image/jpeg"
						maxFiles={1}
						maxFileSize={1024 * 1024 * 50}
						subtext={$errors.cover == null
							? "Must be exactly 300x200 pixels and JPG format."
							: $errors.cover.toString()}
						onFileReject={console.error}
						interfaceIcon={coverStyle === 0
							? ""
							: coverStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceText={coverStyle === 0
							? ""
							: coverStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceSubtext="type-scale-1 opacity-60 {coverStyle === 0
							? ''
							: coverStyle === 1
								? 'text-success-500'
								: 'text-error-500'}"
						classes="w-full"
						interfaceBase="preset-filled-surface-100-900 text-center hover:preset-filled-surface-200-800"
						allowDrop
						onFileChange={async (details) => {
							coverStyle = 0
							coverURL = "/cover.jpg"
							if (details.acceptedFiles.length === 0) {
								if (details.rejectedFiles.length > 0) coverStyle = 2
								return
							}

							$form.cover = details.acceptedFiles[0]
							coverStyle = 2
							const invalid = await validate("cover")

							if (invalid) {
								console.error(invalid)
								return
							}

							coverStyle = 1
							let reader = new FileReader()
							reader.onload = function () {
								coverURL = reader.result as string
							}
							reader.readAsDataURL(details.acceptedFiles[0])
						}}
					>
						{#snippet iconInterface()}<ImagePlus class="mx-auto" />{/snippet}
					</FileUpload>

					<FileUpload
						name="banner"
						label="Banner image"
						accept="image/jpeg"
						maxFiles={1}
						maxFileSize={1024 * 1024 * 50}
						subtext={$errors.banner == null
							? "Must be exactly 1920x768 pixels and JPG format."
							: $errors.banner.toString()}
						interfaceIcon={bannerStyle === 0
							? ""
							: bannerStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceText={bannerStyle === 0
							? ""
							: bannerStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceSubtext="type-scale-1 opacity-60 {bannerStyle === 0
							? ''
							: bannerStyle === 1
								? 'text-success-500'
								: 'text-error-500'}"
						onFileReject={console.error}
						classes="w-full"
						interfaceBase="preset-filled-surface-100-900 text-center hover:preset-filled-surface-200-800"
						allowDrop
						onFileChange={async (details) => {
							bannerStyle = 0
							bannerURL = "/banner.jpg"
							if (details.acceptedFiles.length === 0) {
								if (details.rejectedFiles.length > 0) bannerStyle = 2
								return
							}

							$form.banner = details.acceptedFiles[0]
							bannerStyle = 2
							const invalid = await validate("banner")

							if (invalid) {
								console.error(invalid)
								return
							}

							bannerStyle = 1
							let reader = new FileReader()
							reader.onload = function () {
								bannerURL = reader.result as string
							}
							reader.readAsDataURL(details.acceptedFiles[0])
						}}
					>
						{#snippet iconInterface()}<ImagePlus class="mx-auto" />{/snippet}
					</FileUpload>

					<FileUpload
						name="script"
						label="Simba script"
						accept=".simba"
						maxFiles={1}
						maxFileSize={1024 * 1024 * 50}
						subtext={$errors.script == null
							? "Must be a simba script file."
							: $errors.script.toString()}
						interfaceIcon={scriptStyle === 0
							? ""
							: scriptStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceText={scriptStyle === 0
							? ""
							: scriptStyle === 1
								? "text-success-500"
								: "text-error-500"}
						interfaceSubtext="type-scale-1 opacity-60 {scriptStyle === 0
							? ''
							: scriptStyle === 1
								? 'text-success-500'
								: 'text-error-500'}"
						onFileReject={console.error}
						classes="w-full"
						interfaceBase="preset-filled-surface-100-900 text-center hover:preset-filled-surface-200-800"
						allowDrop
						onFileChange={async (details) => {
							scriptStyle = 0
							if (details.acceptedFiles.length === 0) {
								if (details.rejectedFiles.length > 0) scriptStyle = 2
								return
							}

							$form.script = details.acceptedFiles[0]
							scriptStyle = 2
							const invalid = await validate("script")

							if (invalid) {
								console.error(invalid)
								return
							}
							scriptStyle = 1
						}}
					>
						{#snippet iconInterface()}<FileCode class="mx-auto" />{/snippet}
					</FileUpload>
				</div>

				<div class="preset-filled-surface-100-900 my-8 rounded-md p-8">
					<header class="my-8 text-center">
						<h5>Stats limits (every 5 minutes)</h5>
					</header>
					<div class="flex flex-col justify-between gap-4 md:flex-row">
						<div class="flex w-full flex-col gap-4 lg:flex-row">
							<div class="w-full">
								<label class="label">
									<span class="label-text">Minimum Experience:</span>
									<input
										type="number"
										id="xp_min"
										name="xp_min"
										class="input"
										class:ring-error-500={$errors.xp_min != null}
										bind:value={$form.xp_min}
									/>
								</label>
								{#if $errors.xp_min}
									<small class="text-error-500">{$errors.xp_min}</small>
								{/if}
							</div>

							<div class="w-full">
								<label class="label">
									<span class="label-text">Maximum Experience:</span>
									<input
										type="number"
										id="xp_max"
										name="xp_max"
										class="input"
										class:ring-error-500={$errors.xp_max}
										bind:value={$form.xp_max}
									/>
								</label>
								{#if $errors.xp_max}
									<small class="text-error-500">{$errors.xp_max}</small>
								{/if}
							</div>
						</div>

						<div class="flex w-full flex-col gap-4 lg:flex-row">
							<div class="w-full">
								<label class="label">
									<span class="label-text">Minimum Gold:</span>
									<input
										type="number"
										id="gp_min"
										name="gp_min"
										class="input"
										class:ring-error-500={$errors.gp_min != null}
										bind:value={$form.gp_min}
									/>
								</label>
								{#if $errors.gp_min}
									<small class="text-error-500">{$errors.gp_min}</small>
								{/if}
							</div>

							<div class="w-full">
								<label class="label">
									<span class="label-text">Maximum Gold:</span>
									<input
										type="number"
										id="gp_max"
										name="gp_max"
										class="input"
										class:ring-error-500={$errors.gp_max}
										bind:value={$form.gp_max}
									/>
								</label>
								{#if $errors.gp_max}
									<small class="text-error-500">{$errors.gp_max}</small>
								{/if}
							</div>
						</div>
					</div>
				</div>

				{#if $errors._errors && $errors._errors.length > 0}
					<div class="my-8">
						{#each $errors._errors as err (err)}
							<div class="text-error-500 flex justify-center">{err}</div>
						{/each}
					</div>
				{/if}

				<div class="flex justify-between">
					<a href="./">
						<button class="btn preset-filled-secondary-500">Back</button>
					</a>

					<button type="submit" class="btn preset-filled-secondary-500">Submit</button>
				</div>
			</form>
		</article>
	</div>
</main>
