<script lang="ts">
	import type { Post } from "$lib/backend/types"
	import { encodeSEO } from "$lib/utils"
	import { fly } from "svelte/transition"
	export let post: Post

	$: link = "/tutorials/" + encodeSEO(post.title + " by " + post.author)
</script>

<div
	in:fly={{ duration: 600, delay: 900, x: 500 }}
	out:fly={{ duration: 600, x: -500 }}
	class="card variant-ghost-surface m-4"
>
	<a href={link}>
		<div class="flex flex-col p-3">
			<div
				class="text-md font-semibold text-primary-600 dark:text-primary-500 hover:underline truncate"
			>
				{post.title}
			</div>

			<small class="text-xs text-surface-400 truncate mt-1">
				by
				<a href="/user/{post.user_id}" class="font-semibold hover:underline">
					{post.author}
				</a>
			</small>

			<div class="text-sm text-surface-600 dark:text-surface-300 mt-4 mb-1">{post.description}</div>
		</div>
		<div class="py-2 px-4">
			<span
				class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold
					{post.level === 0
					? 'bg-sky-400 dark:bg-sky-500'
					: post.level === 1
					? 'bg-orange-400 dark:bg-orange-500'
					: 'bg-red-500 dark:bg-red-600'}
					 text-white rounded-full"
			>
				{#if post.level === 0}Basic{:else if post.level === 1}Intermediate{:else}Advanced{/if} tutorial
			</span>
		</div>
	</a>
</div>
