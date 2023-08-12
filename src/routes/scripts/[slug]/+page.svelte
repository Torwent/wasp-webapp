<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { canDownload, canEdit, updateWarning } from "$lib/backend/data"
	import AdvancedButton from "$lib/components/AdvancedButton.svelte"
	import ZipDownload from "$lib/components/ZIPDownload.svelte"

	import EditButton from "$lib/components/EditButton.svelte"
	import {
		modalStore,
		type ModalSettings,
		type ToastSettings,
		toastStore
	} from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import ScriptHeader from "../ScriptHeader.svelte"
	import ScriptArticle from "../ScriptArticle.svelte"
	import StatsHeader from "../StatsHeader.svelte"
	import { onMount } from "svelte"
	import { formatRSNumber, replaceScriptContent } from "$lib/utils"

	export let data

	let { script, dismissed, profile } = data
	$: ({ script, dismissed, profile } = data)

	onMount(() => {
		if (!$page.url.pathname.includes("-by-")) history.replaceState({}, "", "/scripts/" + script.url)
	})

	function warningDismissed(r: boolean) {
		if (r) {
			updateWarning(data.supabaseClient)
			if (browser) document.cookie = `warning_dismissed=true;max-age=31536000;path="/"`
		} else goto("/scripts")
	}

	const warn: ModalSettings = {
		type: "confirm",
		// Data
		title: "Community Script",
		buttonTextConfirm: "I agree",
		body: `
		<div class="variant-ghost-error flex">
			<div class="block p-4">
				<p>
					Community scripts can be uploaded by anyone with the
					<span class="text-sky-500 dark:text-sky-400"> Developer </span>
					role and are not reviewed, therefore they can be malicious.
				</p>
				<br>
				<p>
					You shouldn't use a community script you are not willing to review or that you don't
					trust it's developer.
				</p>
				<br>
				<p>
					Maintenance of the script is also responsibility of it's developer. So if the script
					doesn't work or has bugs you need to report those issues to the developer.
				</p>
			</div>
		</div>
		`,
		response: (r: boolean) => warningDismissed(r)
	}

	if (!dismissed && script && script.categories.includes("Community")) modalStore.trigger(warn)

	function canDownloadScript() {
		if (script.categories.includes("Free")) return true
		return canDownload(profile)
	}

	const t: ToastSettings = {
		message: "Please login to be able to download this script."
	}

	if (!profile) toastStore.trigger(t)

	const authorButtons = ["none", "online list", "all time downloads", "monthly downloads"]
	let selectedBtn = "none"

	const headTitle = script.title + " - WaspScripts"
	const headDescription = "RuneScape OSRS Color Bot - " + script.description
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
	<meta name="robots" content="all" />

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
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div>
	<ScriptHeader title={script.title} username={script.scripts_protected.profiles_public.username}>
		<img
			class="z-0 absolute object-cover h-full w-full"
			src={script?.scripts_protected.assets_path + "banner.jpg"}
			alt={script?.scripts_protected.assets_alt}
			loading="lazy"
		/>
	</ScriptHeader>

	<div class="container mt-80 mx-auto mb-6 max-w-lg md:max-w-2xl flex-grow">
		<header class="my-8">
			<h3 class="text-center text-secondary-500 text-shadow drop-shadow-2xl">
				{script.description}
			</h3>

			{#if !script.published && canEdit(profile, script.scripts_protected.author_id)}
				<h4 class="my-4 text-center text-error-500 text-shadow drop-shadow-2xl">Unpublished</h4>
			{/if}
		</header>

		<StatsHeader
			experience={script.stats_scripts.experience}
			gold={script.stats_scripts.gold}
			runtime={script.stats_scripts.runtime}
		/>

		{#if canEdit(profile, script.scripts_protected.author_id)}
			<header class="text-center">
				<div class="my-4 btn-group-vertical md:btn-group variant-ghost justify-evenly">
					{#each authorButtons as btn, idx}
						{#if idx > 0}
							<button
								class="w-full"
								class:variant-glass-primary={selectedBtn === btn}
								on:click={() => {
									if (selectedBtn === btn) selectedBtn = authorButtons[0]
									else selectedBtn = btn
								}}
							>
								View {btn}
							</button>
						{/if}
					{/each}
				</div>

				{#if selectedBtn === authorButtons[1]}
					{#if script.stats_scripts.total_current_users}
						<h4>
							Currently online (simba uuids): {formatRSNumber(
								script.stats_scripts.total_current_users
							)}
						</h4>

						<div>
							<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
								{#each script.stats_scripts.current_users as user}
									{#if user}
										{Object.values(user)[0]}
										<br />
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{:else if selectedBtn === authorButtons[2]}
					{#if script.stats_scripts.total_unique_downloads}
						<h4>
							Total downloads: {formatRSNumber(script.stats_scripts.total_unique_downloads)}
						</h4>

						<div>
							<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
								{#each script.stats_scripts.unique_downloads as user}
									{user}
									<br />
								{/each}
							</div>
						</div>
					{/if}
				{:else if selectedBtn === authorButtons[3]}
					{#if script.stats_scripts.total_monthly_downloads}
						<h4>
							Total downloads: {formatRSNumber(script.stats_scripts.total_monthly_downloads)}
						</h4>

						<div>
							<div class="variant-ghost-surface max-h-[10rem] overflow-auto text-small">
								{#each script.stats_scripts.monthly_downloads as user}
									{user}
									<br />
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			</header>
		{/if}

		{#if profile}
			<div class="text-center">
				{#if canDownloadScript()}
					<div class="py-12 grid justify-center justify-items-center gap-8">
						<AdvancedButton {script} rev={script.scripts_protected.revision} />
						<ZipDownload bind:profile />
						<EditButton author_id={script.scripts_protected.author_id} />
					</div>

					<h4 class="pt-4">
						You should move this script to
						<b class="text-primary-500">/Simba/Scripts/</b>
						and place it in the respective folder.
					</h4>
				{:else}
					<h4 class="py-2">This is a premium script and you are not premium.</h4>
					<h5>
						To be able to download this script join
						<a href="/premium" class="font-semibold text-primary-500 hover:underline">Premium</a>
						!
					</h5>
				{/if}
			</div>
		{/if}

		<ScriptArticle content={replaceScriptContent(script)} />
	</div>
</div>
