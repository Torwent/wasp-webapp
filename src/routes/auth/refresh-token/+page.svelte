<script lang="ts">
	import { page } from "$app/stores"
	import { CodeBlock } from "@skeletonlabs/skeleton"
	export let data

	const { token } = data

	const headTitle = "Refresh token - WaspScripts"
	const headDescription = "Login to waspscripts.com through Simba"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, "
	const headAuthor = "Torwent"
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{headTitle}</title>
	<meta name="description" content={headDescription} />
	<meta name="keywords" content={headKeywords} />
	<meta name="author" content={headAuthor} />
	<meta name="robots" content="noindex" />

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

<main class="container mx-auto my-52 max-w-2xl flex-grow">
	<div class="my-24">
		<span class="my-4 flex font-bold">Refresh token</span>
		<CodeBlock language="html" code={token} buttonLabel="📝" buttonCopied="👍" />
	</div>

	<div class="text-center">
		<p>Please copy the token above into the Wasp Launcher</p>
		<p>Sharing this can be dangerous, keep it to yourself!</p>
	</div>
</main>
