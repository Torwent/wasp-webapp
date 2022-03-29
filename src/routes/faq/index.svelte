<script>
	import { fade } from "svelte/transition"
	import { questions, commonErrors } from "../../stores/questionStore"
	import DropDown from "../../components/DropDown.svelte"

	import Discord from "../../components/Discord.svelte"
</script>

<div
	class="pb-16 container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header class="py-12 text-center">
		<h2>Welcome to the Frequently Asked Questions and Common Errors section.</h2>
		<p class="py-6">
			Hopefully you find what you are looking for here, if not feel free to join the discord server
			and ask around!
		</p>
		<Discord />
	</header>

	<DropDown title="FAQ" entries={questions} />
	<DropDown title="Common Errors" entries={commonErrors} />
</div>
