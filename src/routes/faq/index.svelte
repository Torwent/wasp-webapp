<script>
	import { fade } from "svelte/transition"
	import { questions, commonErrors, loadData } from "$lib/stores/stores.js"
	import DropDown from "$lib/components/DropDown.svelte"
	import Discord from "$lib/components/Discord.svelte"

	loadData("faq", questions)
	loadData("common_errors", commonErrors)
</script>

<svelte:head>
	<title>FAQ and Errors - Waspscripts</title>
	<meta
		name="description"
		content="Need help botting osrs? See if what you are looking for is in this list."
	/>
</svelte:head>

<div
	class="pb-16 container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="py-12 text-center">
		<h2>Welcome to the Frequently Asked Questions and Common Errors section.</h2>
	</header>

	<DropDown title="FAQ" entries={questions} />
	<DropDown title="Common Errors" entries={commonErrors} />

	<header class="py-12 text-center">
		<p class="py-6">
			Hopefully you found what you were looking for here, if not feel free to join the discord
			server and ask around!
		</p>
		<Discord />
	</header>
</div>
