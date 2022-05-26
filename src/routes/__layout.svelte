<script>
	import "../app.css"
	import Navbar from "$lib/components/Navbar.svelte"
	import Footer from "$lib/components/Footer.svelte"
	import Discord from "$lib/components/Discord.svelte"
</script>

<Navbar />
<main class="min-h-screen">
	<!--
	<h1 class="text-center mx-auto pt-12 text-red-500 font-bold">
		THIS IS WORK IN PROGRESS AND NOT EVERYTHING IS FUNCTIONAL
	</h1>
	<p class="text-center mx-auto pt-4 pb-12 text-red-500 font-bold">
		If you want to actually use my work you should join the discord server:
	</p>
	<a href="https://discord.com/invite/YMYUahmww9">
		<Discord />
	</a>
	-->
	<slot />
</main>
<Footer />
