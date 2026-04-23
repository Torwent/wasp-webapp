<script lang="ts">
	let { data } = $props()
	const { message } = data
</script>

<main class="container mx-auto my-44 max-w-2xl flex-grow">
	<h3 class="my-4 flex font-bold">Email update message:</h3>
	<p class="my-16">{message}</p>
	<p class="my-16">Make sure you click the confirmation link on both emails 😁</p>
</main>
