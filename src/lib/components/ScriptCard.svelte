<script lang="ts">
	import ScriptCardBase from "./ScriptCardBase.svelte"
	let data = $props()
	const link = $derived("/scripts/" + data.script.url)
</script>

<a href={link} class="mx-auto">
	<ScriptCardBase script={data.script} />
</a>
