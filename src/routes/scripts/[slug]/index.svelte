<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import Markdown from "$lib/Markdown.svelte"
	import ScriptDownloadButton from "$lib/components/ScriptDownloadButton.svelte"
	import Carousel from "$lib/components/Carousel.svelte"
	import { fade } from "svelte/transition"
	import { profile } from "$lib/stores/authStore"

	export let script
	let premium

	if (script.categories.includes("Premium")) {
		premium = true
	} else {
		premium = false
	}

	let script_name = script.title.toLowerCase().replace(" ", "_") + ".simba"
</script>

<div in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<div class="group w-full">
		<img
			class="inset-0 z-0 object-none h-96 w-full"
			src={script.assets_path + "cover.png"}
			alt="missing img"
		/>

		<div class="text-center w-full h-32 absolute inset-0 z-10 top-80 text-amber-500">
			<h1 class="mb-4 font-bold text-4xl">{script.title}</h1>
			<h2 class="font-semibold leading-normal mb-4">{script.description}</h2>
		</div>
		<!-- Hover Effect -->
		<div
			class="absolute top-96
                    h-16 w-full px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-black/20 via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
		/>
	</div>

	<div class="container mx-auto my-6 max-w-2xl flex-grow">
		<div class="container h-96 w-full mx-auto my-3">
			<Carousel
				bucket="imgs"
				folder={"scripts/" + script.title.toLowerCase().replace(" ", "_") + "/assets"}
			/>
		</div>

		<div class="text-center">
			{#if script.categories.includes("Free")}
				<ScriptDownloadButton {premium} {script_name} text={`Download ${script.title}`} />
				<h3 class="py-6">
					This is a free script, if you want to learn how to install and easily manage all
					FreeWaspScripts check this
					<a
						href="/blog/3"
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
						This is a premium script, if you don't know what to do with this file, follow this
						<a
							href="/blog/4"
							class="font-semibold text-amber-500 dark:text-amber-200 hover:underline"
						>
							guide</a
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

		<article class="prose dark:prose-invert py-6 text-center">
			<Markdown src={script.content} />
		</article>
	</div>
</div>
