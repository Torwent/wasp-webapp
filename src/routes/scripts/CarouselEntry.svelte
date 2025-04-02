<script lang="ts">
	import { goto } from "$app/navigation"

	const { assets = "", title = "Loading...", username = null } = $props()
</script>

<img
	class="w-full rounded-lg object-fill brightness-90 md:h-44 lg:h-64"
	src="{assets}/banner.jpg"
	alt={title}
	loading="lazy"
/>

<div class="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2">
	<span class="text-md text-shadow-strong font-bold drop-shadow-2xl lg:text-lg xl:text-4xl">
		{title}
	</span>
	<span class="lg:text-md text-xs xl:text-lg">
		{#if username}
			<button
				onclick={async () => goto("/scripters/{username}")}
				class="text-shadow-strong font-semibold drop-shadow-2xl"
			>
				by {username}
			</button>
		{:else}
			<span class="text-shadow-strong font-semibold drop-shadow-2xl"> by Loading... </span>
		{/if}
	</span>
</div>
