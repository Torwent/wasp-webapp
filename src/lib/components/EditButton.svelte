<script lang="ts">
	import { page } from "$app/stores"
	import { canEdit } from "$lib/backend/data"
	export let author_id: string
</script>

{#await canEdit(author_id) then result}
	{#if result}
		<div class="my-8 grid place-items-center">
			<a href="{$page.url.pathname}/edit">
				<button class="btn variant-filled-tertiary">Edit</button>
			</a>
		</div>
	{/if}
{/await}
