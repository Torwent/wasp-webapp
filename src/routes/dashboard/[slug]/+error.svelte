<script lang="ts">
	import { page } from "$app/state"
</script>

<main class="m-4 h-96 text-center">
	{#if page.error}
		<h1 class="my-16 text-error-500">{page.error.message}</h1>
	{/if}
</main>
