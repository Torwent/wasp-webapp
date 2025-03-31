<script lang="ts">
	import Head from "$lib/components/Head.svelte"
	import { Avatar } from "@skeletonlabs/skeleton-svelte"

	const { data } = $props()
	const { content, meta, supabaseClient } = $derived(data)

	async function getUsername(id: string) {
		const { data, error: err } = await supabaseClient
			.schema("profiles")
			.from("profiles")
			.select("username, avatar")
			.eq("id", id)
			.single()

		if (err) {
			console.error(err)
			return { username: "Error", avatar: "Error" }
		}

		return data
	}

	let Content = $derived(content)
</script>

<Head
	title="{meta.title} - Tutorials"
	description="OSRS Botting tutorial: {meta.description}"
	keywords="Tutorial, Tutorials, Guide, Guides, Learn, Coding"
	author={meta.username}
/>

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<div class="my-8 grid place-items-center">
		<a
			href="https://github.com/Torwent/wasp-info/edit/main/tutorials/{meta.order}.md"
			class="variant-filled-tertiary btn"
		>
			Found something wrong? Edit on GitHub!
		</a>
	</div>
	<h2 class="my-4 text-center text-3xl font-bold">{meta.title}</h2>
	<h3 class="my-4 text-center font-semibold leading-normal">{meta.description}</h3>
	<h4 class="my-12 text-center">
		Author:
		<span class="flex justify-center text-primary-500">
			{#await getUsername(meta.author)}
				Loading...
			{:then author}
				<span class="my-auto">{author.username}</span>
				<Avatar src={author.avatar} name={author.username ?? "Error"} classes="mx-1 w-8 h-8" />
			{/await}
		</span>
	</h4>
	{#if meta.coauthors}
		<h5 class="justify-center text-center">
			Co-Authors:
			<div class="my-2 flex items-baseline justify-center text-sm text-secondary-500">
				{#each meta.coauthors as coauthor, i}
					{#await getUsername(coauthor)}
						Loading
					{:then author}
						<span class="mx-2 flex">
							<span class="my-auto">{author.username}</span>
							<Avatar
								src={author.avatar}
								name={author.username ?? "Error"}
								classes="mx-1 w-6 h-6"
							/>
						</span>
					{/await}
				{/each}
			</div>
		</h5>
	{/if}
	<article
		class="prose mx-auto my-8 border-t-2 border-surface-300 py-6 dark:prose-invert dark:border-surface-800"
	>
		<div>
			<Content />
		</div>
	</article>
</main>
