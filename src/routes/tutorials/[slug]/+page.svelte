<script lang="ts">
	import Markdown from "$lib/components/Markdown.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	import { page } from "$app/stores"
	export let data
	let { tutorialPromise } = data
	$: ({ tutorialPromise } = data)

	let tutorial: Awaited<typeof tutorialPromise> | null = null
	$: tutorialPromise.then((awaited) => (tutorial = awaited))

	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	{#if tutorial}
		<title>{tutorial.title + " - WaspScripts"}</title>
		<meta name="description" content={"OSRS Botting tutorial: " + tutorial.description} />
		<meta
			name="keywords"
			content={"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide. " +
				tutorial.username}
		/>
		<meta name="author" content={tutorial.username} />
		<meta name="robots" content="all" />

		<!-- OpenGraph tags -->
		<meta property="og:type" content="website" />
		<meta property="og:title" content={tutorial.title + " - WaspScripts"} />
		<meta property="og:url" content={$page.url.href} />
		<meta property="og:image" content={headImage} />
		<meta property="og:image:type" content="image/png" />
		<meta property="og:image:alt" content="WaspScripts Logo" />
		<meta property="og:description" content={"OSRS Botting tutorial: " + tutorial.description} />

		<!-- Twitter tags -->
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content={tutorial.title + " - WaspScripts"} />
		<meta name="twitter:description" content={"OSRS Botting tutorial: " + tutorial.description} />
		<meta name="twitter:image" content={headImage} />
	{/if}
</svelte:head>

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<EditButton author={tutorial?.author_id} />
	<h2 class="text-center mb-4 font-bold text-3xl">{tutorial ? tutorial.title : "Loading..."}</h2>
	<h3 class="text-center font-semibold leading-normal mb-4">
		{tutorial ? tutorial.description : "Loading..."}
	</h3>

	<article
		class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
	>
		<Markdown src={tutorial ? tutorial.content : "Loading..."} />
	</article>
</main>
