<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import AdvancedButton from "$lib/components/AdvancedDownloadButton.svelte"
	import SimpleButton from "$lib/components/SimpleDownloadButton.svelte"
	import Carousel from "$lib/components/Carousel.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import { getServiceSupabase } from "$lib/supabase"
	import { fade } from "svelte/transition"
	import { profile, loadProfile } from "$lib/stores/authStore"
	import type { Script } from "$lib/supabaseStorage"
	let tempDismiss = $profile.dismissed_warning

	export let script: Script

	const fullDismiss = async () => {
		tempDismiss = true
		const ssb = getServiceSupabase()
		ssb.auth.signOut()

		const { error } = await ssb
			.from("profile")
			.update({ dismissed_warning: true })
			.match({ id: $profile.id })

		if (error) return console.error(error)

		loadProfile($profile.id)
	}

	let assets_path =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/scripts/" +
		script.id +
		"/banner.jpg"
</script>

<svelte:head>
	<MetaTags
		title={script.title}
		description={script.description}
		url={"/scripts/" + encodeURI(script.title)}
	/>
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

	<div class="inset-0 group container w-screen h-[44rem] mx-auto flex flex-col">
		<img
			class="inset-0 z-0 absolute object-cover h-fit w-full"
			src={assets_path}
			alt={script.assets_alt}
		/>
		<header class="mt-auto z-10 text-center h-32 text-amber-500 text-shadow">
			<div
				class="absolute mx-0 left-0 h-32 w-full opacity-100
					   bg-gradient-to-t from-white/20 via-white-800/20 dark:from-black/60 dark:via-gray-800/20 to-transparent"
			/>
			<h1 class="mb-4 font-bold text-4xl">{script.title}</h1>
			<h2 class="font-semibold leading-normal mb-4">{script.description}</h2>
		</header>
		<!-- Title and Description Hover Effect -->
	</div>

	<div class="container mx-auto mb-6 max-w-2xl flex-grow">
		<div class="container w-full mx-auto my-3">
			<Carousel
				bucket="imgs"
				folder={"scripts/" + script.title.toLowerCase().replace(" ", "_") + "/assets"}
			/>
		</div>

		<div class="text-center py-12">
			{#if script.categories.includes("Free")}
				<AdvancedButton {script} />

				{#if script.categories.includes("Official")}
					<h3 class="py-6">
						This is a free wasp script, you can add it to Simba's package manager with the following
						link:
					</h3>
					<h4>
						<a
							href="https://github.com/Torwent/wasp-free"
							class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
							>https://github.com/Torwent/wasp-free</a
						>
					</h4>
					<h5 class="py-4">
						For more information check this
						<a
							href="/blog/Simba%20packages"
							class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
						>
							guide</a
						>.
					</h5>
				{/if}
			{:else if script.categories.includes("Premium")}
				{#if !$profile.id}
					<h3 class="py-6">Please login to be able to download this script.</h3>
				{:else if $profile.premium || $profile.vip || $profile.tester || $profile.id === script.user_id}
					<AdvancedButton {script} />
					<h4 class="pt-6">
						This is a premium script, you need to move it to
						<b class="text-amber-500 dark:text-amber-200"> Simba/Scripts/wasp-premium </b>
					</h4>

					{#if script.categories.includes("Official")}
						<h4 class="py-6">To download all official premium scripts a zip click here:</h4>
						<SimpleButton />
					{/if}
				{:else}
					<h3 class="py-2">This is a premium script and you are not premium.</h3>
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

		{#if $profile.id === script.user_id || $profile.id === "4dbcf43d-cc8a-48e3-aead-2c55a3f302ee"}
			<div class="grid place-items-center">
				<a href="/scripts/{encodeURI(script.title) + '&' + script.id}/edit">
					<button
						data-mdb-ripple="true"
						data-mdb-ripple-color="light"
						class=" text-white text-xs font-semibold leading-tight px-6 py-2.5 uppercase rounded transition duration-300 ease-in-out flex justify-start shadow-md hover:shadow-lg
				 			 bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 outline-orange-300 active:outline"
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
