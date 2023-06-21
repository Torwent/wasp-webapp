<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import { Github } from "lucide-svelte"
	import { fade } from "svelte/transition"
	import PayPal from "./PayPal.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	export let data

	const { developer } = data

	const headTitle = developer.username + " - WaspScripts"
	const headDescription = developer.description
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Developer, " +
		developer.username
	const headAuthor = developer.username
	const headImage =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={headDescription} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={headTitle} />
	<meta name="twitter:description" content={headDescription} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<div class="flex justify-between">
		<div class="flex my-auto">
			<header>
				<h3 class="font-bold text-2xl">
					{#if developer.real_name && developer.real_name != ""} {developer.real_name} / {/if}
					{developer.username}
				</h3>
			</header>
		</div>
		<div class="flex my-auto">
			<a href={developer.github}>
				<button class="text-secondary-500 mx-5 h-full">
					<Github />
				</button>
			</a>
			{#if developer.paypal_id && developer.paypal_id != ""}
				<div class="w-full mx-auto">
					<PayPal paypal_id={developer.paypal_id} username={developer.username} />
				</div>
			{/if}
		</div>
	</div>
	<h4 class="my-4">{developer.description}</h4>
	<article
		class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
	>
		<Markdown src={developer.content} />
	</article>

	<div class="flex justify-between">
		<div class="my-8 grid place-items-center">
			<a href="./" class="btn variant-filled-secondary">Back</a>
		</div>

		<EditButton author_id={developer.id} />
	</div>
</div>
