<script lang="ts">
	export let assets: string = ""
	export let title: string = "Loading..."
	export let username: string | null = null
</script>

<img
	class="md:h-44 lg:h-64 object-fill w-full rounded-lg brightness-90"
	src="{assets}/banner.jpg"
	alt={title}
	loading="lazy"
/>

<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid">
	<span class="font-bold text-md lg:text-lg xl:text-4xl text-shadow-strong drop-shadow-2xl">
		{title}
	</span>
	<span class="text-xs lg:text-md xl:text-lg">
		{#if username}
			<a href="/scripters/{username}" class="font-semibold text-shadow-strong drop-shadow-2xl">
				by {username}
			</a>
		{:else}
			<span class="font-semibold text-shadow-strong drop-shadow-2xl"> by Loading... </span>
		{/if}
	</span>
</div>
