<script lang="ts">
	import { fade } from "svelte/transition"
	import MetaTags from "$lib/components/MetaTags.svelte"
	import DropDown from "$lib/components/DropDown.svelte"
	import Discord from "$lib/components/Discord.svelte"
	import { getData } from "$lib/database/supabase"
	import type { FAQEntry } from "$lib/database/types"

	const faqData = getData("faq_questions") as unknown as FAQEntry[]
	const faqErrors = getData("faq_errors") as unknown as FAQEntry[]
</script>

<svelte:head>
	<MetaTags
		title="FAQ and Errors"
		description="Need help botting osrs? See if what you are looking for is in this list."
		url="/faq"
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

	{#await faqData then faq}
		<DropDown title="FAQ" entries={faq} />
	{/await}

	{#await faqErrors then errors}
		<DropDown title="Common Errors" entries={errors} />
	{/await}

	<header class="py-12 text-center">
		<p class="py-6">
			Hopefully you found what you were looking for here, if not feel free to join the discord
			server and ask around!
		</p>
		<Discord />
	</header>
</div>
