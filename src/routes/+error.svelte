<script lang="ts">
	import { page } from "$app/state"
</script>

{#if page.error}
	<main class="mx-auto my-64 flex h-96 flex-col text-center">
		<h1 class="text-error-500 my-4 text-xl font-bold">Error Status: {page.status}</h1>
		<div class="text-error-500 mx-auto max-w-3/6 text-lg">{page.error.message}</div>
	</main>
{/if}
