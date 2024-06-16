<script lang="ts">
	import { page } from "$app/stores"
	import { CodeBlock } from "@skeletonlabs/skeleton"

	const headTitle = "Page not found - WaspScripts"
	const headDescription = "This page does not exist."
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Script, Developer, Tutorials, Tutorial, Guides, Guide. "
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
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

<main class="container mx-auto my-6 max-w-4xl flex-grow text-center">
	<div class="card variant-outline-error py-8 my-8">
		<header class="my-8">
			<h3>An error has occurred while loading the page.</h3>
		</header>

		<div class="my-8">
			<h4 class="my-2">Error code: {$page.status}</h4>
			<CodeBlock
				class="mx-4"
				language="html"
				buttonLabel="📝"
				buttonCopied="👍"
				code={$page.error?.message}
			/>
		</div>

		<a href={$page.url.href}>
			<button class="btn variant-filled-error">Back</button>
		</a>
	</div>
</main>
