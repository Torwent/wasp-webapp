<script lang="ts">
	import type { IScriptCard } from "$lib/backend/types"
	import { encodeSEO } from "$lib/utils"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	export let script: IScriptCard

	const link = "/scripts/" + encodeSEO(script.title + " by " + script.scripts_protected.author)
</script>

<a href={link}>
	<ScriptCardBase {script} />
</a>
