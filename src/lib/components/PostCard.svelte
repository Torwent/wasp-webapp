<script>
	import { fly } from "svelte/transition"
	export let post
</script>

<div
	in:fly={{ duration: 600, delay: 900, x: 500 }}
	out:fly={{ duration: 600, x: -500 }}
	class="flex flex-col shadow-md my-8 cursor-pointer hover:-translate-y-1 duration-300 w-full bg-stone-100 dark:bg-stone-800 rounded-md"
>
	<a href="/blog/{encodeURI(post.title)}">
		<div class="flex flex-col p-3">
			<!-- Title -->
			<div class="text-md font-semibold text-amber-500 hover:underline truncate">
				{post.title}
			</div>

			<!-- Author - Category -->
			<div class="text-xs text-stone-400 truncate mt-1">
				by

				<!-- Author -->
				<a href="/user/{post.user_id}" class="font-semibold hover:underline">
					{post.author}
				</a>
			</div>

			<!-- content -->
			<div class="text-sm text-stone-500 mt-4 mb-1">{post.description}</div>
		</div>
		<div class="py-2 px-4">
			{#if post.level === 0}
				<span
					class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-sky-400 dark:bg-sky-500 text-white rounded-full"
				>
					Basic tutorial
				</span>
			{:else if post.level === 1}
				<span
					class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-orange-400 dark:bg-orange-500 text-white rounded-full"
				>
					Intermediate tutorial
				</span>
			{:else if post.level === 2}
				<span
					class="text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 dark:bg-red-600 text-white rounded-full"
				>
					Advanced tutorial
				</span>
			{/if}
		</div>
	</a>
</div>
