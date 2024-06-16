<script lang="ts">
	import { page } from "$app/stores"
	import { canEdit } from "$lib/client/supabase"
	export let author: string | null = null

	let { profile, roles } = $page.data
	$: ({ profile, roles } = $page.data)
</script>

{#if canEdit(profile?.id, roles, author)}
	<div class="my-8 grid place-items-center">
		<a href="{$page.url.pathname}/edit" class="btn variant-filled-tertiary">Edit</a>
	</div>
{/if}
