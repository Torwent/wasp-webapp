<script lang="ts">
	import { enhance } from "$app/forms"
	import { page } from "$app/state"

	const themesData = [
		{ label: "Cerberus", value: "cerberus" },
		{ label: "Concord", value: "concord" },
		{ label: "Fennec", value: "fennec" },
		{ label: "Modern", value: "modern" }
	]

	let theme = $state(page.data.theme)
</script>

<form
	id="theme-form"
	method="POST"
	action="/?/setTheme"
	class="my-auto hover:preset-tonal"
	use:enhance={() => document.body.setAttribute("data-theme", theme)}
	onchange={(e) => e.currentTarget.requestSubmit()}
>
	<select name="theme" id="theme-select" class="select" bind:value={theme}>
		{#each themesData as entry}
			<option value={entry.value} selected={entry.value === theme}>{entry.label}</option>
		{/each}
	</select>
</form>
