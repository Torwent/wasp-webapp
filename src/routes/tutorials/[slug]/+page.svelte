<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import { fade } from "svelte/transition"
	import EditButton from "$lib/components/EditButton.svelte"
	export let data
	const { post } = data
</script>

<svelte:head>
	<MetaTags
		title={post.title}
		description={post.description}
		keywords={"OldSchool, RuneScape, OSRS, 2007, Color, Bot, Wasp, Scripts, Tutorials, Guides"}
	/>
</svelte:head>

<main
	class="container mx-auto my-6 max-w-4xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<EditButton author_id={post.user_id} />
	<h2 class="text-center mb-4 font-bold text-3xl">{post.title}</h2>
	<h3 class="text-center font-semibold leading-normal mb-4">{post.description}</h3>

	<article
		class="mx-auto prose dark:prose-invert py-6 border-t-2 border-surface-300 dark:border-surface-800"
	>
		<Markdown src={post.content} />
	</article>
</main>
