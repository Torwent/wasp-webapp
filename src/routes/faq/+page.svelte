<script lang="ts">
	import DropDown from "./DropDown.svelte"
	import Discord from "$lib/components/Discord.svelte"

	export let data

	import { page } from "$app/stores"

	let { questions, errors } = data
	$: ({ questions, errors } = data)

	const headTitle = "FAQs and Errors - WaspScripts"
	const headDescription = "Need help botting osrs? See if what you are looking for is in this list."
	const headKeywords = "OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, Simba"
	const headAuthor = "Torwent"
	const headImage =
		"https://db.waspscripts.com/storage/v1/object/public/imgs/logos/multi-color-logo.png"
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

<main class="pb-16 container mx-auto my-6 max-w-2xl flex-grow">
	<header class="py-12 text-center">
		<h2>Welcome to the Frequently Asked Questions and Common Errors section.</h2>
	</header>

	<DropDown title="❓ Frequently Asked Questions" entries={questions} />
	<DropDown title="⚠️ Common Errors" entries={errors} />

	<header class="py-12 text-center">
		<p class="py-6">
			Hopefully you found what you were looking for here, if not feel free to join the discord
			server and ask around!
		</p>
		<Discord />
	</header>
</main>
