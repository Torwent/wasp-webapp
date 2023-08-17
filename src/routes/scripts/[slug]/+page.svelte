<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import { canDownload, canEdit, getScriptsStats, updateWarning } from "$lib/backend/data"
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
	import { replaceScriptContent } from "$lib/utils"
	import ScriptData from "./ScriptData.svelte"

	export let data

	let { script, dismissed, profile, supabaseClient } = data
	$: ({ script, dismissed, profile, supabaseClient } = data)

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

	const scriptStats = getScriptsStats(supabaseClient, script.id)

	const headTitle = script.title + " - WaspScripts"
	const headDescription = "RuneScape OSRS Color Bot - " + script.description
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, " +
		script.subcategories
	const headAuthor = script.protected.username
	const headImage = script.protected.assets + "banner.jpg"
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
	<ScriptHeader title={script.title} username={script.protected.username}>
		<img
			class="z-0 absolute object-cover h-full w-full"
			src={script.protected.assets + "banner.jpg"}
			alt="Script banner"
			loading="lazy"
		/>
	</ScriptHeader>

	<div class="container mt-80 mx-auto mb-6 max-w-lg md:max-w-2xl flex-grow">
		<header class="my-8">
			<h3 class="text-center text-secondary-500 text-shadow drop-shadow-2xl">
				{script.description}
			</h3>

			{#if !script.published && canEdit(profile, script.protected.author_id)}
				<h4 class="my-4 text-center text-error-500 text-shadow drop-shadow-2xl">Unpublished</h4>
			{/if}
		</header>

		{#await scriptStats}
			<header class="text-center">
				<h4>Total Experience Gained: ...</h4>
				<h4>Total Gold Gained: ...</h4>
				<h4>Total Runtime: ...</h4>
			</header>
		{:then stats}
			<StatsHeader {stats} />
		{/await}

		{#if canEdit(profile, script.protected.author_id)}
			<ScriptData id={script.id} {scriptStats} />
		{/if}

		{#if profile}
			<div class="text-center">
				{#if canDownloadScript()}
					<div class="py-12 grid justify-center justify-items-center gap-8">
						<AdvancedButton {script} rev={script.protected.revision} />
						<ZipDownload bind:profile />
						<EditButton author_id={script.protected.author_id} />
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
