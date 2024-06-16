<script lang="ts">
	import { page } from "$app/stores"
	import Markdown from "$lib/components/Markdown.svelte"
	import AdvancedButton from "./AdvancedButton.svelte"
	export let data

	let { policiesPromise } = data
	$: ({ policiesPromise } = data)

	let policies: Awaited<typeof policiesPromise> | null = null
	let currentPolicy: Awaited<typeof policiesPromise>[number] | null = null
	let index = 0

	let userLocale = "pt-PT"
	$: policiesPromise.then((awaited) => (policies = awaited))
	$: if (policies) currentPolicy = policies[index]

	const headTitle = "Terms and Conditions - WaspScripts"
	const headDescription = "WaspScripts Terms and Conditions"
	const headKeywords =
		"OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, Simba, Privacy, Policy, Terms, Conditions"
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

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<div class="grid mx-auto max-w-4xl">
		<div class="flex mx-auto my-6">
			{#if policies}
				<AdvancedButton bind:index bind:total={policies.length} />
			{/if}
		</div>
		<div class="flex mx-auto my-6">
			Updated on: {currentPolicy
				? new Date(currentPolicy.created_at).toLocaleString(userLocale)
				: "Loading..."}
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
		<Markdown src={currentPolicy?.content ?? "Loading..."} />
	</article>
</main>
