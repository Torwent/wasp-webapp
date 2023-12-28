<script lang="ts">
	import { page } from "$app/stores"
	import Markdown from "$lib/Markdown.svelte"
	import AdvancedButton from "../AdvancedButton.svelte"
	export let data

	const { terms } = data

	let index = 0
	let currentTerms = terms[index]
	let userLocale = "pt-PT"
	$: currentTerms = terms[index]

	const headTitle = "Scripter Terms of Service - WaspScripts"
	const headDescription = "WaspScripts Scripter Terms of Service"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, Simba, Privacy, Policy"
	const headAuthor = "Torwent"
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

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<div class="grid mx-auto max-w-4xl">
		<div class="flex mx-auto my-6">
			<AdvancedButton bind:index total={terms.length} />
		</div>
		<div class="flex mx-auto my-6">
			Updated on: {new Date(currentTerms.created_at).toLocaleString(userLocale)}
		</div>

		{#if index !== 0}
			<div class="grid mx-auto my-6 text-secondary-500 max-w-4xl text-center">
				<p>
					Old versions of this document are merely informative and for the sake of transparency.
				</p>
				<p>
					The moment it's updated, the old version is not considered valid or applicable, and only
					the most recent version holds legal and operational significance.
				</p>
			</div>
		{/if}
	</div>
	<article class="max-w-md md:max-w-4xl mx-auto prose dark:prose-invert py-6">
		<Markdown src={currentTerms.content} />
	</article>
</main>
