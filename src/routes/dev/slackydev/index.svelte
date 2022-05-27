<script>
	import { fade } from "svelte/transition"
</script>

<div
	class="container mx-auto my-6 max-w-5xl flex-grow text-center"
	in:fade={{ duration: 300, delay: 300 }}
	out:fade={{ duration: 300 }}
>
	<header>
		<h3>Jarl Holta</h3>
		<h4>Known as Slacky</h4>
	</header>
	<p>Creator of: ......</p>

	<p>
		Donate to <a
			href="https://www.paypal.com/donate/?hosted_button_id=ZMCWSWE7BPT7C"
			class="font-medium text-amber-400">Slacky</a
		>!
	</p>
</div>
