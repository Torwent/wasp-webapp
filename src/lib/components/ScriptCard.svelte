<script lang="ts">
	import ScriptCardBase from "./ScriptCardBase.svelte"

	let { script } = $props()

	const link = $derived("/scripts/" + script.url)
</script>

<a href={link} class="mx-auto">
	<ScriptCardBase {script} />
</a>
