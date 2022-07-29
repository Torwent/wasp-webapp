<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import ScriptDownloadButton from "$lib/components/ScriptDownloadButton.svelte"
	import Carousel from "$lib/components/Carousel.svelte"
	import { getServiceSupabase } from "$lib/supabase"
	import { fade } from "svelte/transition"
	import { profile, loadProfile } from "$lib/stores/authStore"
	let tempDismiss = $profile.dismissed_warning

	export let script: {
		id: string
		title: string
		description: string
		categories: string[]
		subcategories?: string[]
		content: string
		assets_path: string
		assets_alt: string
	}
	let premium: boolean

	if (script.categories.includes("Premium")) {
		premium = true
	} else {
		premium = false
	}
	let script_name = script.title.toLowerCase().replace(" ", "_") + ".simba"

	const fullDismiss = async () => {
		const ssb = getServiceSupabase()
		ssb.auth.signOut()

		const { error } = await ssb
			.from("profile")
			.update({ dismissed_warning: true })
			.match({ id: $profile.id })

		if (error) {
			return console.error(error)
		}

		loadProfile($profile.id)

		tempDismiss = true
	}
</script>

<svelte:head>
	<title>{script.title} - Waspscripts</title>
	<meta name="description" content={script.description} />
</svelte:head>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	{#if script.categories.includes("Community") && !tempDismiss}
		<div
			class="fixed inset-0 bg-stone-900 bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur transition-colors z-40"
			in:fade={{ duration: 300, delay: 300 }}
			out:fade={{ duration: 300 }}
		>
			<div class="m-auto my-36 p-12 max-w-4xl rounded-md shadow-md bg-stone-100 dark:bg-stone-800">
				<div class="text-center px-8">
					<h2 class="py-6 text-orange-500">⚠️This is a community script.⚠️</h2>
					<h3 class="text-base">
						Community scripts can be uploaded by anyone with the
						<span class="text-sky-500 dark:text-sky-400"> Developer </span>
						role and are not reviewed, therefore they can be malicious.
					</h3>
					<h3 class="text-base py-6">
						You shouldn't use a community script you are not willing to review or that you don't
						trust it's developer.
					</h3>
					<h3 class="text-base py-6">
						Maintenance of the script is also responsibility of it's developer. So if the script
						doesn't work or has bugs you need to report those issues to the developer.
					</h3>
					<div class="flex justify-between">
						<button
							type="button"
							class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
							on:click={() => (tempDismiss = true)}
						>
							<span class="px-2">I understand!</span>
						</button>

						<button
							type="button"
							class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
							on:click={() => fullDismiss()}
						>
							<span class="px-2">I understand and I don't want to see this warning again!</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="group w-full absolute left-0 top-16">
		<img
			class="inset-0 z-0 object-none h-96 w-full"
			src={script.assets_path + "cover.png"}
			alt={script.assets_alt}
		/>

		<header class="text-center w-full h-32 absolute inset-0 z-10 top-64 text-amber-500">
			<h1 class="mb-4 font-bold text-4xl">{script.title}</h1>
			<h2 class="font-semibold leading-normal mb-4">{script.description}</h2>
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

	<div class="container mx-auto mt-96 mb-6 max-w-2xl flex-grow">
		<div class="container w-full mx-auto my-3">
			<Carousel
				bucket="imgs"
				folder={"scripts/" + script.title.toLowerCase().replace(" ", "_") + "/assets"}
			/>
		</div>

		<div class="text-center py-12">
			{#if script.categories.includes("Free")}
				<ScriptDownloadButton {premium} {script_name} text={`Download ${script.title}`} />
				<h3 class="py-6">
					This is a free script, if you want to learn how to install and easily manage all
					FreeWaspScripts check this
					<a
						href="/blog/Simba%20packages"
						class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
					>
						guide</a
					>.
				</h3>
			{:else if script.categories.includes("Premium")}
				{#if !$profile.id}
					<h3 class="py-6">Please login to be able to download this script.</h3>
				{:else if $profile.premium || $profile.vip || $profile.tester}
					<ScriptDownloadButton {premium} {script_name} text={`Download ${script.title}`} />
					<h4 class="py-6">
						This is a premium script, you need to manually move it to <b
							>Simba/Scripts/wasp-premium</b
						>.
					</h4>

					<h4 class="py-6">
						If you prefer to download all premium scripts in a zip you can download them here:
					</h4>
					<ScriptDownloadButton
						{premium}
						script_name="wasp-premium.zip"
						text="Download wasp-premium.zip"
					/>
				{:else}
					<h3 class="py-6">This is a premium script and you are not premium.</h3>
					<h4>
						To be able to download this script join
						<a
							href="/premium"
							class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
						>
							Premium
						</a>!
					</h4>
				{/if}
			{/if}
		</div>

		{#if $profile.id === script.id || $profile.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
			<div class="grid place-items-center">
				<a href="/scripts/{encodeURI(script.title)}/edit">
					<button
						data-mdb-ripple="true"
						data-mdb-ripple-color="light"
						class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center justify-between 
			bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
					>
						Edit
					</button>
				</a>
			</div>
		{/if}

		<h2 class="text-amber-500 dark:text-amber-200 text-center py-6">Description:</h2>
		<article class="prose dark:prose-invert py-6">
			<Markdown src={script.content} />
		</article>
	</div>
</div>
