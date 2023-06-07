<script lang="ts">
	import { page } from "$app/stores"
	import { canEdit } from "$lib/backend/data"
	export let author_id: string | null | undefined

	$: ({ profile } = $page.data)
</script>

{#if canEdit(profile, author_id)}
	<div class="my-8 grid place-items-center">
		<a href="{$page.url.pathname}/edit">
			<button class="btn variant-filled-tertiary">Edit</button>
		</a>
	</div>
{/if}
