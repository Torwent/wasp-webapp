<script lang="ts">
	import { enhance } from "$app/forms"
	import { page } from "$app/state"
	import { Palette } from "svelte-lucide"

	const themesData = [
		{ label: "Cerberus", value: "cerberus" },
		{ label: "Concord", value: "concord" },
		{ label: "Fennec", value: "fennec" },
		{ label: "Wasp", value: "wasp" }
	]

	let theme = $state(page.data.theme)
	let selectElement: HTMLSelectElement
</script>

<form
	id="theme-form"
	method="POST"
	action="/?/setTheme"
	class="input-group hover:preset-tonal mx-1 my-auto flex"
	use:enhance={() => document.body.setAttribute("data-theme", theme)}
	onchange={(e) => e.currentTarget.requestSubmit()}
>
	<div class="ig-cell preset-tonal">
		<Palette size="16" />
	</div>
	<select
		bind:this={selectElement}
		name="theme"
		id="theme-select"
		class="ig-select my-auto"
		bind:value={theme}
	>
		{#each themesData as entry (entry.value)}
			<option value={entry.value} selected={entry.value === theme}> {entry.label} </option>
		{/each}
	</select>
</form>
