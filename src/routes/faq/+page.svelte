<script lang="ts">
	import DropDown from "./DropDown.svelte"
	import Discord from "$lib/components/Discord.svelte"
	import { page } from "$app/state"
	import Head from "$lib/components/Head.svelte"

	const { data } = $props()
	const questions = $state(data.questions)
	const errors = $state(data.errors)
</script>

<Head
	title="FAQs and Errors"
	description="Need help botting osrs? See if what you are looking for is in this list."
/>

<main class="container mx-auto my-16 max-w-2xl flex-grow">
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
