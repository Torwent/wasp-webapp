<script lang="ts">
	import type { ScriptBase } from "$lib/types/collection"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	export let script: ScriptBase

	let link = "/scripts/" + script.url
	$: link = "/scripts/" + script.url
</script>

<a href={link} class="mx-auto">
	<ScriptCardBase bind:script />
</a>
