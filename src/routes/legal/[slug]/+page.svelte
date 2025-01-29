<script lang="ts">
	import { page } from "$app/state"
	import AdvancedButton from "./AdvancedButton.svelte"

	let { data } = $props()
	let { policies, roles } = $derived(data)
	let index = $state(0)

	let currentPolicy: (typeof policies)[number] = $derived(policies[index])

	let userLocale = "pt-PT"

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
	<meta property="og:url" content={page.url.href} />
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
	<div class="mx-auto grid max-w-4xl">
		<a href={page.url.pathname + "/add"} class="btn mx-auto preset-filled">Add</a>
		<div class="mx-auto my-6 flex">
			<AdvancedButton bind:index bind:total={policies.length} />
		</div>
		<div class="mx-auto my-6 flex">
			Updated on: {currentPolicy
				? new Date(currentPolicy.created_at).toLocaleString(userLocale)
				: "Loading..."}
		</div>

		{#if index !== 0}
			<div class="mx-auto my-6 grid max-w-4xl text-center text-secondary-500">
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
	<article class="prose mx-auto max-w-md py-6 dark:prose-invert md:max-w-4xl">
		{@html currentPolicy.content?.code}
	</article>
</main>
