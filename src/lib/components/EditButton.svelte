<script lang="ts">
	import { page } from "$app/stores"
	import { canEdit } from "$lib/client/data"
	export let author_id: string

	let { profile, roles } = $page.data
	$: ({ profile, roles } = $page.data)
</script>

{#if canEdit(profile.id, roles, author_id)}
	<div class="my-8 grid place-items-center">
		<a href="{$page.url.pathname}/edit" class="btn variant-filled-tertiary">Edit</a>
	</div>
{/if}
