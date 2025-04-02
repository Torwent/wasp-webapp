<script lang="ts">
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"
	import AdvancedButton from "./AdvancedButton.svelte"

	let { data } = $props()
	let { policies } = $derived(data)
	let index = $state(0)

	let currentPolicy: (typeof policies)[number] = $derived(policies[index])

	let userLocale = "pt-PT"
</script>

<Head
	title="Terms and Conditions"
	description="WaspScripts Terms and Conditions"
	keywords="Privacy, Policy, Terms, Conditions"
/>

<main class="container mx-auto my-6 max-w-4xl flex-grow">
	<div class="mx-auto grid max-w-4xl">
		<a href={page.url.pathname + "/add"} class="btn preset-filled mx-auto">Add</a>
		<div class="mx-auto my-6 flex">
			<AdvancedButton bind:index bind:total={policies.length} />
		</div>
		<div class="mx-auto my-6 flex">
			Updated on: {currentPolicy
				? new Date(currentPolicy.created_at).toLocaleString(userLocale)
				: "Loading..."}
		</div>

		{#if index !== 0}
			<div class="text-secondary-500 mx-auto my-6 grid max-w-4xl text-center">
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
	<article class="prose dark:prose-invert mx-auto max-w-md py-6 md:max-w-4xl">
		{@html currentPolicy.content?.code}
	</article>
</main>
