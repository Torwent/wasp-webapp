<script lang="ts">
	import { mardownRenderer } from "$lib/client/markdown"
	let { src } = $props()
</script>

{@html mardownRenderer.render(src)}
