<script lang="ts">
	import type { IScriptCard } from "$lib/types/collection"
	import { encodeSEO } from "$lib/utils"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	export let script: IScriptCard

	let link =
		"/scripts/" +
		encodeSEO(script.title + " by " + script.scripts_protected.profiles_public.username)
	$: link =
		"/scripts/" +
		encodeSEO(script.title + " by " + script.scripts_protected.profiles_public.username)
</script>

<a href={link}>
	<ScriptCardBase {script} />
</a>
