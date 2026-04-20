<script lang="ts">
	import Clipboard from "svelte-lucide/Clipboard.svelte"
	import ClipboardCheck from "svelte-lucide/ClipboardCheck.svelte"
	let { uuid }: { uuid: string } = $props()
	let copied = $state(false)
</script>

<button
	class="btn preset-outlined-surface-500 mx-auto cursor-pointer rounded-md p-2 text-xs"
	type="button"
	onclick={async (e) => {
		e.preventDefault()
		await navigator.clipboard.writeText(uuid)
		copied = true
		setTimeout(() => (copied = false), 2000)
	}}
>
	ID: <span class="w-18 truncate">{uuid}</span>
	{#if copied}
		<ClipboardCheck class="h-4" />
	{:else}
		<Clipboard class="h-4" />
	{/if}
</button>
