<script lang="ts">
	import { browser } from "$app/environment"
	import { goto } from "$app/navigation"
	import Markdown from "$lib/Markdown.svelte"
	import { updateWarning } from "$lib/backend/data"
	import AdvancedButton from "$lib/components/AdvancedButton.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import ZipDownload from "$lib/components/ZIPDownload.svelte"

	import EditButton from "$lib/components/EditButton.svelte"
	import { convertTime, formatRSNumber } from "$lib/utils"
	import {
		modalStore,
		type ModalSettings,
		type ToastSettings,
		toastStore
	} from "@skeletonlabs/skeleton"
	import { fade } from "svelte/transition"

	export let data

	let { script, dismissed, profile } = data

	function warningDismissed(r: boolean) {
		if (r) {
			updateWarning()
			if (browser) document.cookie = `warningDismissed=true;max-age=31536000;path="/"`
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

	function canDownload() {
		if (script.categories.includes("Free")) return true
		if (!profile) return false
		if (profile.id === script.scripts_protected.author_id) return true
		return (
			profile.profiles_protected.premium ||
			profile.profiles_protected.vip ||
			profile.profiles_protected.tester
		)
	}

	const t: ToastSettings = {
		message: "Please login to be able to download this script."
	}

	if (!profile) toastStore.trigger(t)
</script>

<svelte:head>
	<MetaTags
		title={script.title}
		description="RuneScape OSRS Color Bot - {script.description}"
		keywords="OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, {script.subcategories}"
		author={script.scripts_protected.author}
	/>
</svelte:head>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div class="absolute inset-0 container min-w-full h-96 mx-0 flex flex-col">
		<img
			class="z-0 absolute object-cover h-full w-full"
			src={script?.scripts_protected.assets_path + "banner.jpg"}
			alt={script?.scripts_protected.assets_alt}
		/>
		<!-- Title and Description Hover Effect -->
		<header class="left-0 mt-auto z-[1] text-center h-32 text-primary-500 text-shadow">
			<div
				class="absolute mx-0 h-32 w-full opacity-100 bg-gradient-to-t from-white/20 via-white-800/20
				 dark:from-black/60 dark:via-gray-800/20 to-transparent"
			/>
			<h2 class="mx-8 mb-4 font-bold text-4xl">{script.title}</h2>
			<h3 class="font-semibold leading-normal mb-4">{script.description}</h3>
		</header>
	</div>

	<div class="container mt-80 mx-auto mb-6 max-w-2xl flex-grow">
		{#if !script.published}
			<div class="text-center my-4">
				<h4 class="text-secondary-500 mx-auto font-bold">Hidden</h4>
			</div>
		{/if}
		{#if script.stats_scripts.experience || script.stats_scripts.gold || script.stats_scripts.runtime}
			<header class="text-center">
				{#if script.stats_scripts.experience}
					<h3>
						Total Experience Gained:
						{#await formatRSNumber(script.stats_scripts.experience)}...{:then value}{value}{/await}
					</h3>
				{/if}
				{#if script.stats_scripts.gold}
					<h3>
						Total Gold Gained:
						{#await formatRSNumber(script.stats_scripts.gold)}...{:then value}{value}{/await}
					</h3>
				{/if}
				{#if script.stats_scripts.runtime}
					<h3>
						Total Runtime:
						{#await convertTime(script.stats_scripts.runtime)}...{:then value}{value}{/await}
					</h3>
				{/if}
			</header>
		{/if}

		{#if profile}
			<div class="text-center">
				{#if canDownload()}
					<div class="py-12">
						<AdvancedButton {script} />
					</div>

					<h5 class="pt-6">
						You should move this script to
						<b class="text-primary-500">/Simba/Scripts/</b>
						and place it in the respective folder.
					</h5>
				{:else}
					<h3 class="py-2">This is a premium script and you are not premium.</h3>
					<h4>
						To be able to download this script join
						<a href="/premium" class="font-semibold text-primary-500 hover:underline">Premium</a>
						!
					</h4>
				{/if}

				<h4 class="mt-24 mb-4">To download several scripts as a zip click the following button:</h4>
				<ZipDownload bind:profile />

				<EditButton author_id={script.scripts_protected.author_id} />
			</div>
		{/if}

		<header class="text-center my-6 text-primary-500">
			<span class="text-lg">Description:</span>
		</header>

		<div class="variant-ghost-surface max-h-[50rem] overflow-auto">
			<article class="py-6 m-auto prose dark:prose-invert">
				<Markdown src={script.content} />
			</article>
		</div>
	</div>
</div>
