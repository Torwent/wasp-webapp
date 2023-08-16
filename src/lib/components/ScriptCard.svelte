<script lang="ts">
	import type { Script } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	export let script: Script

	let link = "/scripts/" + encodeSEO(script.title + " by " + script.protected.username)
	$: link = "/scripts/" + encodeSEO(script.title + " by " + script.protected.username)
</script>

<a href={link}>
	<ScriptCardBase {script} />
</a>
