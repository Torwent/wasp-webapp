<script>
	import { fade } from "svelte/transition"
	import { posts } from "../../stores/postStore.js"
	import PostCard from "../../components/PostCard.svelte"

	let searchQuery = ""
	let filteredPosts = []
	let placeholderText = "Search posts..."

	String.prototype.fuzzy = function (s) {
		var hay = this.toLowerCase(),
			i = 0,
			n = -1,
			l
		s = s.toLowerCase()
		for (; (l = s[i++]); ) if (!~(n = hay.indexOf(l, n + 1))) return false
		return true
	}

	const handleSearch = () => {
		filteredPosts = $posts
		placeholderText = "Search posts..."
		if (searchQuery === "") return

		filteredPosts = $posts.filter((post) => post.title.fuzzy(searchQuery))
		if (filteredEntries.length === 0) {
			placeholderText = "Not found!"
			searchQuery = ""
		}
	}
</script>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<div>
		<form class="form my-6" on:submit|preventDefault={handleSearch}>
			<div class="flex flex-col text-sm mb-2">
				<input
					type="text"
					bind:value={searchQuery}
					name="search"
					placeholder={placeholderText}
					class="appearance-none shadow-sm border border-gray-200 p-2 focus:outline-none focus:border-gray-500 rounded-lg"
				/>
			</div>
		</form>
	</div>

	<div>
		{#if filteredPosts.length !== 0}
			{#each filteredPosts as p}
				<PostCard post={p} />
			{/each}
		{:else if $posts}
			{#each $posts as p}
				<PostCard post={p} />
			{/each}
		{:else}
			Loading posts...
		{/if}
	</div>
</div>
