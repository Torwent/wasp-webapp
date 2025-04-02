<script lang="ts">
	import { page } from "$app/state"
</script>

<main class="m-4 h-96 text-center">
	{#if page.error}
		<h1 class="text-error-500 my-16">{page.error.message}</h1>
	{/if}
</main>
