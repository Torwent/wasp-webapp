<script lang="ts">
	import Markdown from "$lib/Markdown.svelte"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import { Github } from "lucide-svelte"
	import { fade } from "svelte/transition"
	import PayPal from "./PayPal.svelte"
	import EditButton from "$lib/components/EditButton.svelte"
	export let data

	const { developer, profile } = data
</script>

<svelte:head>
	<MetaTags title={developer.username} description={developer.description} />
</svelte:head>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<div class="flex justify-between">
		<div class="flex my-auto">
			<header>
				<h3 class="font-bold text-2xl">
					{#if developer.realname && developer.realname != ""} {developer.realname} / {/if}
					{developer.username}
				</h3>
			</header>
		</div>
		<div class="flex my-auto">
			<a href={developer.github}>
				<button class="text-secondary-500 mx-5 h-full">
					<Github />
				</button>
			</a>
			{#if developer.paypal_id && developer.paypal_id != ""}
				<div class="w-full mx-auto">
					<PayPal paypal_id={developer.paypal_id} username={developer.username} />
				</div>
			{/if}
		</div>
	</div>
	<h4 class="my-4">{developer.description}</h4>
	<article
		class="prose dark:prose-invert py-6 border-t-2 border-stone-300 dark:border-stone-800 mx-auto"
	>
		<Markdown src={developer.content} />
	</article>

	<div class="flex justify-between">
		<a href="./">
			<button class="btn variant-filled-secondary">Back</button>
		</a>

		<EditButton author_id={developer.id} />
	</div>
</div>
