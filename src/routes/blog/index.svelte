<script>
	import { fade } from "svelte/transition"
	import { posts } from "../../stores/postStore.js"
	import PostCard from "../../components/PostCard.svelte"
</script>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	{#if $posts}
		{#each $posts as p}
			<PostCard post={p} />
		{/each}
	{:else}
		Loading posts...
	{/if}
</div>
