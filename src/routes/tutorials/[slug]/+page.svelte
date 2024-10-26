<script lang="ts">
	import { page } from "$app/stores"
	export let data
	const { content, meta } = data
	const headImage = "/multi-color-logo.png"
</script>

<svelte:head>
	<title>{meta.title + " - WaspScripts"}</title>
	<meta name="description" content={"OSRS Botting tutorial: " + meta.description} />
	<meta
		name="keywords"
		content={"OldSchool, RuneScape, OSRS, 2007, Color, Colour,  Bot, Wasp, Scripts, Simba, Tutorials, Tutorial, Guides, Guide. " +
			meta.username}
	/>
	<meta name="author" content={meta.username} />
	<meta name="robots" content="all" />

	<!-- OpenGraph tags -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={meta.title + " - WaspScripts"} />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={headImage} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content="WaspScripts Logo" />
	<meta property="og:description" content={"OSRS Botting tutorial: " + meta.description} />

	<!-- Twitter tags -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={meta.title + " - WaspScripts"} />
	<meta name="twitter:description" content={"OSRS Botting tutorial: " + meta.description} />
	<meta name="twitter:image" content={headImage} />
</svelte:head>

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<div class="my-8 grid place-items-center">
		<a
			href="https://github.com/Torwent/wasp-info/edit/main/tutorials/{meta.order}.md"
			class="btn variant-filled-tertiary"
		>
			Found something wrong? Edit on GitHub!
		</a>
	</div>
	<h2 class="text-center mb-4 font-bold text-3xl">{meta.title}</h2>
	<h3 class="text-center font-semibold leading-normal mb-4">{meta.description}</h3>

	<article
		class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
	>
		<div>
			<svelte:component this={content} />
		</div>
	</article>
</main>
