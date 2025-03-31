<script lang="ts">
	import { goto } from "$app/navigation"
	import ScriptCardBase from "./ScriptCardBase.svelte"
	let data = $props()
	const link = $derived("/scripts/" + data.script.url)
</script>

<button class="mx-auto" onclick={() => goto(link)}>
	<ScriptCardBase script={data.script} customCover={undefined} />
</button>
