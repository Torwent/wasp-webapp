<script lang="ts">
	import type { Script } from "$lib/types/collection"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	export let script: Script
	let link = "/scripts/" + script.url
	$: link = "/scripts/" + script.url
</script>

<a href={link}>
	<ScriptCardBase {script} />
</a>
