<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	export let data
	let { tutorial } = data
	$: ({ tutorial } = data)

	const headTitle = tutorial.title + " - WaspScripts"
	const headDescription = "OSRS Botting tutorial: " + tutorial.description
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide. " +
		tutorial.username
	const headAuthor = tutorial.username
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
	<EditButton author_id={tutorial.user_id} />
	<h2 class="text-center mb-4 font-bold text-3xl">{tutorial.title}</h2>
	<h3 class="text-center font-semibold leading-normal mb-4">{tutorial.description}</h3>

	<article
		class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
	>
		<Markdown src={tutorial.content} />
	</article>
</main>
