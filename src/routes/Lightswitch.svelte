<script lang="ts">
	import { enhance } from "$app/forms"
	import { page } from "$app/state"
	import SunMoon from "svelte-lucide/SunMoon.svelte"

	let dark = $state(page.data.darkMode)
</script>

<form
	id="dark-form"
	method="POST"
	action="/?/toggleDark"
	class="my-auto"
	use:enhance={() => {
		dark = !dark
		document.documentElement.classList.toggle("dark", dark)
	}}
>
	<button
		id="lightswitch"
		class="btn my-auto hidden hover:preset-tonal lg:block"
		title="Toggle dark mode."
		type="submit"
	>
		<SunMoon />
	</button>
</form>
