<script context="module">
	import { load } from "./_slug"
	export { load }
</script>

<script>
	import { fade } from "svelte/transition"
	import RoleBadges from "../../../components/RoleBadges.svelte"
	export let user
</script>

<div
	class="container mx-auto my-6 max-w-2xl flex-grow"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<h1 class="mb-4 font-bold text-3xl">{user.display_name}</h1>
	<h2 class="font-semibold leading-normal mb-4">{user.id}</h2>
	<h2 class="font-semibold leading-normal mb-4">{user.avatar}</h2>
	<RoleBadges profile={user} />
</div>
